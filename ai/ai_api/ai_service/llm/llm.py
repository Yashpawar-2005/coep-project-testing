import ollama
from rag.embedding_operations import *
# import tiktoken

def extract_from_db(user_query,index_name,namespace):
    emb = create_embeddings_for_query(query=user_query)
    results = similarity_search(index_name=index_name,query_embedding=emb,namespace=namespace)
    return [match['metadata']['query'] for match in results.get('matches',[])]


def generate_chat(user_query,chat_his):

    context = extract_from_db(user_query=user_query,index_name="quickstart",namespace="ns1")
    
    prompt_template = f'''You are an expert database architect specializing in SQL schema design.
You must remember all previous queries and your own responses throughout the conversation.
Your task is to generate **ONLY** an SQL query or schema based on the provided question, chat history, and relevant context.

### **Previous Conversations (Chat History):**
{chat_his}

### **Contextual Information (Relevant Queries or Schemas):**
{context}

### **Current User Query:**
{user_query}

### **Instructions:**
- Use the chat history to maintain conversation flow.
- Use the context data to generate the most optimal SQL schema or query.
- **DO NOT** provide any explanation, reasoning, or additional text.
- **ONLY** return valid SQL queries inside triple backticks (```sql ... ```).
'''
    reply = ""
    for chunk in ollama.chat(model="deepseek-r1",messages=[{"role":"user","content":prompt_template}],stream=True):
        print("DEBUG:", chunk)  # Inspect response structure
        content = chunk.message.content  # Handle possible keys
        reply+=content
        try:
            yield  f"data: {content}\n\n"  
            yield '\n'
        except:
            print("⚠️ Warning: Unexpected chunk format:", chunk)

    print("DEEPSEEK:",reply)
