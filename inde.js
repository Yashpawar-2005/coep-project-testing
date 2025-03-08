// Import necessary libraries - using dynamic import for ESM modules
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { ChromaClient } = require("chromadb");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// ChromaDB client
const chroma = new ChromaClient({ path: "http://localhost:8000" });
let collection;
let embeddingModelPromise = null;
let rerankerPromise = null;

async function setupChroma() {
    try {
        collection = await chroma.getOrCreateCollection({ 
            name: "documents",
            metadata: { "hnsw:space": "cosine" } // Using cosine similarity for BGE embeddings
        });
        console.log("ChromaDB collection setup complete");
    } catch (error) {
        console.error("ChromaDB setup error:", error);
        throw error;
    }
}

// Initialize embedding model (lazy-loading)
async function getEmbeddingModel() {
    if (!embeddingModelPromise) {
        // Use axios for embedding API calls to avoid ESM module issues
        console.log("Setting up embedding model connection...");
        embeddingModelPromise = Promise.resolve(true);
    }
    return embeddingModelPromise;
}

// Split text into chunks using LangChain's TextSplitter
async function chunkText(text) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 512,
        chunkOverlap: 50,
        separators: ["\n\n", "\n", " ", ""]
    });
    
    const chunks = await splitter.createDocuments([text]);
    return chunks.map(chunk => chunk.pageContent);
}

// Get embeddings using remote embedding API (Ollama with BGE model)
async function getEmbedding(text) {
    try {
        // Initialize model (this is just a placeholder action now)
        await getEmbeddingModel();
        
        // Call Ollama API for embeddings with BGE model
        const response = await axios.post("http://localhost:11434/api/embeddings", {
            model: "bge-large", // Assuming you've pulled this model in Ollama
            prompt: text,
        });

        if (!response.data.embedding) {
            throw new Error("No embedding returned from API");
        }

        return response.data.embedding;
    } catch (error) {
        // Try fallback to deepseek if BGE model is not available
        console.warn("Error with BGE model, trying fallback:", error.message);
        
        try {
            const fallbackResponse = await axios.post("http://localhost:11434/api/embeddings", {
                model: "deepseek-r1",
                prompt: text,
            });
            
            if (!fallbackResponse.data.embedding) {
                throw new Error("No embedding returned from fallback API");
            }
            
            return fallbackResponse.data.embedding;
        } catch (fallbackError) {
            console.error("All embedding attempts failed:", fallbackError.message);
            throw new Error("Embedding failed with all available models");
        }
    }
}

// Rerank documents using semantic similarity (since we can't use the reranker directly)
async function rerankDocuments(query, documents, topK = 3) {
    if (documents.length <= 1) return documents;
    
    try {
        // Simple reranking mechanism - get query embedding and compare with documents
        // Convert query to embedding
        const queryEmbedding = await getEmbedding(query);
        
        // Get embeddings for all documents
        const docEmbeddings = await Promise.all(documents.map(doc => getEmbedding(doc)));
        
        // Calculate similarity scores
        const scoredDocs = docEmbeddings.map((embedding, index) => {
            // Cosine similarity
            const similarity = calculateCosineSimilarity(queryEmbedding, embedding);
            return {
                score: similarity,
                doc: documents[index]
            };
        });
        
        // Sort by relevance score (descending)
        scoredDocs.sort((a, b) => b.score - a.score);
        
        // Return top K results
        return scoredDocs.slice(0, topK).map(item => item.doc);
    } catch (error) {
        console.error("Reranking error:", error);
        // Fall back to original documents if reranking fails
        return documents.slice(0, topK);
    }
}

// Helper function to calculate cosine similarity
function calculateCosineSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length) {
        throw new Error("Vectors must have the same length");
    }
    
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        mag1 += vec1[i] * vec1[i];
        mag2 += vec2[i] * vec2[i];
    }
    
    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    return dotProduct / (mag1 * mag2);
}

// Store document chunks
app.post("/store", async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Content is required" });
    }

    try {
        // Split content into chunks
        const chunks = await chunkText(content);
        console.log(`Document split into ${chunks.length} chunks`);
        
        // Process chunks in batches to avoid memory issues
        const batchSize = 10;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batchChunks = chunks.slice(i, i + batchSize);
            
            // Get embeddings for each chunk
            const embeddings = await Promise.all(batchChunks.map(chunk => getEmbedding(chunk)));
            
            // Generate unique IDs for each chunk
            const ids = batchChunks.map(() => `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`);
            
            // Add to ChromaDB
            await collection.add({
                ids,
                embeddings,
                metadatas: batchChunks.map(chunk => ({ content: chunk })),
            });
            
            console.log(`Stored batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)}`);
        }
        
        res.json({ 
            message: "Document stored successfully", 
            chunks: chunks.length 
        });
    } catch (error) {
        console.error("Store error:", error);
        res.status(500).json({ error: "Failed to store document: " + error.message });
    }
});


app.post("/generate", async (req, res) => {
    const { prompt, useReranker = true, topK = 5 } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {

        const vector = await getEmbedding(prompt);
        console.log("Query embedding generated successfully");
        const results = await collection.query({
            queryEmbeddings: [vector],
            nResults: topK * 2, 
        });
        
        let retrievedDocs = [];
        if (results.metadatas && results.metadatas[0]) {
            retrievedDocs = results.metadatas[0]
                .filter(doc => doc && doc.content)
                .map(doc => doc.content);
        }
        
        console.log(`Retrieved ${retrievedDocs.length} documents from vector search`);
        let contextDocs = retrievedDocs;
        if (useReranker && retrievedDocs.length > 1) {
            contextDocs = await rerankDocuments(prompt, retrievedDocs, topK);
            console.log(`Reranked and selected top ${contextDocs.length} documents`);
        }
        const context = contextDocs.join("\n\n");
        console.log("Context preparation complete");
        const systemPrompt = "You are a schema generation assistant. Based on the context and user prompt, generate the most appropriate database schema.";
        const fullPrompt = `${systemPrompt}\n\nContext:\n${context}\n\nUser: ${prompt}`;
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        const metaInfo = {
            event: 'meta',
            data: JSON.stringify({
                contextCount: contextDocs.length,
                rerankerUsed: useReranker && retrievedDocs.length > 1
            })
        };
        res.write(`data: ${JSON.stringify(metaInfo)}\n\n`);
        const response = await axios({
            method: 'post',
            url: 'http://localhost:11434/api/generate',
            data: {
                model: "deepseek-r1",
                prompt: fullPrompt,
                stream: true,
                temperature: 0.1,
                top_p: 0.9
            },
            responseType: 'stream'
        });
        
        console.log("Started streaming response");
        
        
        response.data.on('data', (chunk) => {
            try {
                const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                
                for (const line of lines) {
                    const jsonData = JSON.parse(line);
                    const chunkEvent = {
                        event: 'chunk',
                        data: jsonData.response
                    };
                    res.write(`data: ${JSON.stringify(chunkEvent)}\n\n`);
                    if (jsonData.done) {
                        const doneEvent = {
                            event: 'done',
                            data: {}
                        };
                        res.write(`data: ${JSON.stringify(doneEvent)}\n\n`);
                        res.end();
                    }
                }
            } catch (error) {
                console.error("Error parsing streaming chunk:", error);

            }
        });
        response.data.on('error', (error) => {
            console.error("Stream error:", error);
            const errorEvent = {
                event: 'error',
                data: { message: error.message }
            };
            res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
            res.end();
        });
        response.data.on('end', () => {
            res.end();
        });
        
    } catch (error) {
        console.error("Generate error:", error);
        res.status(500).json({ 
            error: "Failed to generate response: " + (error.response?.data?.error || error.message),
            details: error.stack
        });
    }
});
app.post("/clear", async (req, res) => {
    try {
        await collection.delete();
        collection = await chroma.createCollection({ 
            name: "documents",
            metadata: { "hnsw:space": "cosine" }
        });
        res.json({ message: "Collection cleared successfully" });
    } catch (error) {
        console.error("Clear collection error:", error);
        res.status(500).json({ error: "Failed to clear collection: " + error.message });
    }
});


app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        models: {
            embedding: embeddingModelPromise ? "configured" : "not configured",
        }
    });
});


app.listen(PORT, async () => {
    try {
        await setupChroma();
        await getEmbeddingModel();
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
});