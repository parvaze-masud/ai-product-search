from fastapi import FastAPI
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer

app = FastAPI()

# Connect to Elasticsearch
es = Elasticsearch("http://localhost:9200")

# Load AI Model
model = SentenceTransformer("all-MiniLM-L6-v2")

@app.get("/search/")
def search_products(query: str):
    vector = model.encode(query).tolist()
    search_body = {"query": {"knn": {"embedding": {"vector": vector, "k": 5}}}}
    results = es.search(index="products", body=search_body)
    return {"results": results["hits"]["hits"]}

