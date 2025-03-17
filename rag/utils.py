from pinecone import Pinecone,ServerlessSpec
from dotenv import load_dotenv
import os
import json
import time
load_dotenv()

# pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"),environment = 'us-east-1')

def check_index_exists(index_name,pc):
    if index_name in [i['name'] for i in pc.list_indexes()]:
        return True
    return False

def create_pc_index(index_name,pc,dimensions=1024,metric='cosine',spec=ServerlessSpec(cloud="aws", region="us-east-1")):
    pc.create_index(
        name=index_name,
        dimension=dimensions,
        metric=metric,
        spec=spec
    )

def extract_data(filename):
    with open(filename,'r') as tr:
        data = json.load(tr)
        extracted_data = [
            {
            "question":entry["question"],
            "query":entry["query"]
            }
        for entry in data
        ]
    return extracted_data



