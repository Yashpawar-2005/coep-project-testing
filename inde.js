const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { ChromaClient } = require("chromadb");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const chroma = new ChromaClient({ path: "http://localhost:8000" });
let collection;

async function setupChroma() {
    try {
        collection = await chroma.getOrCreateCollection({ name: "documents" });
        console.log("ChromaDB collection setup complete");
    } catch (error) {
        console.error("ChromaDB setup error:", error);
        throw error;
    }
}

async function getEmbedding(text) {
    try {
        const response = await axios.post("http://localhost:11434/api/embeddings", {
            model: "deepseek-r1",
            prompt: text,
        });

        if (!response.data.embedding) {
            throw new Error("No embedding returned from API");
        }

        return response.data.embedding;
    } catch (error) {
        console.error("Error getting embeddings:", error.response?.data || error.message);
        throw new Error("Embedding failed: " + (error.response?.data || error.message));
    }
}

app.post("/store", async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Content is required" });
    }

    try {
        const vector = await getEmbedding(content);
        await collection.add({
            ids: [Date.now().toString()],
            embeddings: [vector],
            metadatas: [{ content }],
        });
        
        res.json({ message: "Document stored successfully" });
    } catch (error) {
        console.error("Store error:", error);
        res.status(500).json({ error: "Failed to store document: " + error.message });
    }
});

app.post("/generate", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        // Get embedding for the prompt
        const vector = await getEmbedding(prompt);
        console.log("Embedding generated successfully");
        
        const results = await collection.query({
            queryEmbeddings: [vector],
            nResults: 2,
        });
        
        console.log("ChromaDB query results:", JSON.stringify(results, null, 2));
        let retrievedDocs = "";
        if (results.metadatas && results.metadatas[0]) {
            retrievedDocs = results.metadatas[0]
                .filter(doc => doc && doc.content)
                .map(doc => doc.content)
                .join("\n");
        }
        
        console.log("Retrieved context:", retrievedDocs);

        // Make generation request to DeepSeek
        const generateResponse = await axios.post("http://localhost:11434/api/generate", {
            model: "deepseek-r1",
            prompt: `Context: ${retrievedDocs}\n\nUser: ${prompt}`,
            stream: false  // Changed to false to get complete response at once
        }, {
            responseType: 'json'
        });

        console.log("Generation response received");
        res.json(generateResponse.data);
    } catch (error) {
        console.error("Generate error:", error);
        res.status(500).json({ 
            error: "Failed to generate response: " + (error.response?.data?.error || error.message),
            details: error.stack
        });
    }
});
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
    try {
        await setupChroma();
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
});