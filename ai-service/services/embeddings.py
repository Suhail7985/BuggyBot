import os
from typing import List
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings


_embeddings_model = None


def get_embeddings_model() -> GoogleGenerativeAIEmbeddings:
    """Get or create the embeddings model (singleton)."""
    global _embeddings_model
    if _embeddings_model is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        genai.configure(api_key=api_key)
        _embeddings_model = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=api_key,
        )
    return _embeddings_model


def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings for a list of texts."""
    model = get_embeddings_model()
    return model.embed_documents(texts)


def generate_query_embedding(text: str) -> List[float]:
    """Generate embedding for a single query."""
    model = get_embeddings_model()
    return model.embed_query(text)
