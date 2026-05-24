import os
from typing import List, Union

from services.config import get_embeddings_provider


_embeddings_model = None


def get_embeddings_model():
    """OpenAI or Gemini embeddings — must match how Chroma collections were built."""
    global _embeddings_model
    if _embeddings_model is not None:
        return _embeddings_model

    provider = get_embeddings_provider()
    if provider == "openai":
        from langchain_openai import OpenAIEmbeddings

        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key:
            raise ValueError("OPENAI_API_KEY is not set")
        _embeddings_model = OpenAIEmbeddings(
            model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
            openai_api_key=api_key,
        )
    elif provider == "gemini":
        from langchain_google_genai import GoogleGenerativeAIEmbeddings

        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
        _embeddings_model = GoogleGenerativeAIEmbeddings(
            model=os.getenv("GEMINI_EMBEDDING_MODEL", "models/gemini-embedding-001"),
            google_api_key=api_key,
        )
    else:
        raise ValueError(
            "No embeddings API key. Set OPENAI_API_KEY or GEMINI_API_KEY in ai-service/.env"
        )

    return _embeddings_model


def generate_embeddings(texts: List[str]) -> List[List[float]]:
    model = get_embeddings_model()
    return model.embed_documents(texts)


def generate_query_embedding(text: str) -> List[float]:
    model = get_embeddings_model()
    return model.embed_query(text)
