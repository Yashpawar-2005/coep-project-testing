from pinecone import Pinecone
from dotenv import load_dotenv
import os
import json
import time
load_dotenv()
from utils import *
from embedding_operations import *


pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"),environment = 'us-east-1')
if pc:
    print("api key found!!!")

index_name = "quickstart"

if not check_index_exists(index_name=index_name,pc=pc):
    create_pc_index(index_name=index_name,pc=pc)


json_metadata = extract_data('train_spider.json')

embeddings=create_embeddings_for_text_to_sql(metadata=json_metadata[21:40],pc=pc)


vectors = create_vectors(metadata=json_metadata,embeddings=embeddings)

upload_vectors_to_pinecone(vectors=vectors,index_name=index_name,pc=pc,namespace="ns1")

query = "Fetch top 5 students from computer department"

query_embedding = create_embeddings_for_query(query=query,pc=pc)

results = similarity_search(index_name=index_name,query_embedding=query_embedding,pc=pc,namespace="ns1")

print(results)

