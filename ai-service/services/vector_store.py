import os
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from langchain_chroma import Chroma
from services.embeddings import get_embeddings_model


CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")

_chroma_client = None


def get_chroma_client() -> chromadb.PersistentClient:
    """Get or create ChromaDB persistent client (singleton)."""
    global _chroma_client
    if _chroma_client is None:
        os.makedirs(CHROMA_DB_PATH, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(
            path=CHROMA_DB_PATH,
            settings=Settings(anonymized_telemetry=False),
        )
    return _chroma_client


def get_vector_store(collection_name: str) -> Chroma:
    """Get a LangChain Chroma vector store for a collection."""
    embeddings = get_embeddings_model()
    return Chroma(
        client=get_chroma_client(),
        collection_name=collection_name,
        embedding_function=embeddings,
    )


def store_chunks(chunks: List[Dict[str, Any]], collection_name: str) -> int:
    """Store text chunks with embeddings in ChromaDB."""
    client = get_chroma_client()
    embeddings_model = get_embeddings_model()

    # Delete existing collection if it exists
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass

    collection = client.create_collection(collection_name)

    # Batch embed and store
    batch_size = 50
    total_stored = 0

    import time
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        texts = [chunk["text"] for chunk in batch]
        ids = [f"{collection_name}_{chunk['id']}" for chunk in batch]
        metadatas = [chunk["metadata"] for chunk in batch]

        # Generate embeddings with rate limit handling
        max_retries = 3
        for attempt in range(max_retries):
            try:
                embeddings = embeddings_model.embed_documents(texts)
                break
            except Exception as e:
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    if attempt < max_retries - 1:
                        print(f"  [Rate Limit Hit] Sleeping for 20 seconds before retrying...")
                        time.sleep(20)
                    else:
                        raise e
                else:
                    raise e

        collection.add(
            embeddings=embeddings,
            documents=texts,
            ids=ids,
            metadatas=metadatas,
        )
        total_stored += len(batch)
        print(f"  Stored batch {i//batch_size + 1}: {total_stored}/{len(chunks)} chunks")
        
        # Proactively sleep slightly to avoid hitting the 100/min limit
        if i + batch_size < len(chunks):
            time.sleep(2)

    return total_stored


def semantic_search(
    query: str,
    collection_name: str,
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """Perform semantic search on a collection."""
    try:
        vector_store = get_vector_store(collection_name)
        results = vector_store.similarity_search_with_score(query, k=top_k)

        return [
            {
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": float(score),
            }
            for doc, score in results
        ]
    except Exception as e:
        print(f"Search error in collection {collection_name}: {e}")
        return []


def collection_exists(collection_name: str) -> bool:
    """Check if a ChromaDB collection exists and has documents."""
    try:
        client = get_chroma_client()
        collection = client.get_collection(collection_name)
        return collection.count() > 0
    except Exception:
        return False


def delete_collection(collection_name: str) -> bool:
    """Delete a ChromaDB collection."""
    try:
        client = get_chroma_client()
        client.delete_collection(collection_name)
        return True
    except Exception:
        return False


def list_collections() -> List[str]:
    """List all available collections."""
    client = get_chroma_client()
    return [col.name for col in client.list_collections()]
