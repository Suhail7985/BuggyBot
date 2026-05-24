import os


def get_llm_provider() -> str:
    """Which LLM backend to use: openai | gemini | none."""
    if os.getenv("OPENAI_API_KEY", "").strip():
        return "openai"
    if os.getenv("GEMINI_API_KEY", "").strip():
        return "gemini"
    return "none"


def get_embeddings_provider() -> str:
    """Embeddings must match how the collection was indexed."""
    # Prefer explicit override
    forced = os.getenv("EMBEDDINGS_PROVIDER", "").strip().lower()
    if forced in ("openai", "gemini"):
        return forced
    if os.getenv("OPENAI_API_KEY", "").strip():
        return "openai"
    if os.getenv("GEMINI_API_KEY", "").strip():
        return "gemini"
    return "none"


def require_provider() -> str:
    provider = get_llm_provider()
    if provider == "none":
        raise ValueError(
            "No API key configured. Set OPENAI_API_KEY or GEMINI_API_KEY in ai-service/.env"
        )
    return provider
