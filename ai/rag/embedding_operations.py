from pinecone import Pinecone,ServerlessSpec
from dotenv import load_dotenv
import os
import json
import time
import uuid
load_dotenv()



def create_embeddings_for_text_to_sql(metadata,pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"),environment = 'us-east-1')):
        embeddings = pc.inference.embed(
        model="multilingual-e5-large",
        inputs= [f"{entry['question']} {entry['query']}" for entry in metadata],
        parameters= {"input_type":"passage","truncate":"END","max_tokens":512}
        )
        return embeddings

def create_embeddings_for_query(query,pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"),environment = 'us-east-1')):
    embedding = pc.inference.embed(
    model="multilingual-e5-large",
    inputs=[query],
    parameters={
        "input_type": "query"
    }
    )
    return embedding

def create_vectors(metadata,embeddings):
    idx=0
    vectors = []
    for d,e in zip(metadata,embeddings):
        vectors.append({
            "id":str(idx),
            "values":e['values'],
            "metadata":{'question':d['question'],'query':d['query']}
        })
        idx+=1
    return vectors

def upload_vectors_to_pinecone(vectors,index_name,namespace,pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"),environment = 'us-east-1')):
    while not pc.describe_index(index_name).status['ready']:
        time.sleep(1)
    index = pc.Index(index_name)
    time.sleep(5)
    index.upsert(vectors=vectors,namespace=namespace)

def similarity_search(index_name,query_embedding,namespace,pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"),environment = 'us-east-1'),top_k=3,include_values=False,include_metadata=True):
    index = pc.Index(index_name)
    results = index.query(
        namespace=namespace,
        vector = query_embedding[0].values,
        top_k=top_k,
        include_values=include_values,
        include_metadata=include_metadata
    )
    return results
