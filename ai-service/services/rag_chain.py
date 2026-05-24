import os
import json
from typing import AsyncGenerator, List, Dict, Any
from services.vector_store import semantic_search, collection_exists
from services.llm import generate_streaming_response
from prompts.system_prompt import get_prompt_parts
from models.schemas import Citation


DEFAULT_COLLECTION = os.getenv("PRELOAD_COLLECTION_NAME", "grokking_algorithms")
TOP_K = int(os.getenv("TOP_K_RESULTS", "5"))


async def rag_stream(
    message: str,
    chat_history: List[Dict[str, str]],
    mode: str = "chat",
    collection_name: str = None,
    user_id: str = None,
) -> AsyncGenerator[str, None]:
    """
    Full RAG pipeline with streaming output.
    Yields SSE-formatted data chunks.
    """
    collection = collection_name or DEFAULT_COLLECTION

    # Step 1: Semantic search
    try:
        results = semantic_search(message, collection, top_k=TOP_K)
    except Exception as e:
        results = []

    if not results:
        # Try the preloaded Grokking Algorithms collection as fallback
        if collection != DEFAULT_COLLECTION and collection_exists(DEFAULT_COLLECTION):
            results = semantic_search(message, DEFAULT_COLLECTION, top_k=TOP_K)

    # Step 2: Build context from retrieved chunks
    if results:
        context_parts = []
        citations = []

        for i, result in enumerate(results):
            content = result["content"]
            metadata = result.get("metadata", {})
            page = metadata.get("page", "?")
            chapter = metadata.get("chapter", "Grokking Algorithms")
            source = metadata.get("source", "Grokking Algorithms")

            context_parts.append(f"[Source {i+1} - {chapter}, Page {page}]:\n{content}")

            citations.append({
                "chapter": chapter,
                "page": page if isinstance(page, int) else None,
                "excerpt": content[:200] + "..." if len(content) > 200 else content,
                "source": source,
            })

        context = "\n\n---\n\n".join(context_parts)
    else:
        context = (
            "No excerpts were retrieved from the knowledge base. "
            "Answer using standard computer science references. "
            "State clearly that source citations are unavailable until course material is indexed."
        )
        citations = []

    # Step 3: Build chat history string
    history_str = ""
    if chat_history:
        history_parts = []
        for msg in chat_history[-6:]:  # Last 3 exchanges
            role = "User" if msg["role"] == "user" else "Assistant"
            history_parts.append(f"{role}: {msg['content'][:500]}")
        history_str = "\n".join(history_parts)

    # Step 4: Build system + user messages for the model
    system_prompt, user_message = get_prompt_parts(mode, context, message, history_str)

    # Step 5: Send citations first
    if citations:
        yield f"data: {json.dumps({'type': 'citations', 'citations': citations})}\n\n"

    # Step 6: Stream LLM response
    try:
        async for token in generate_streaming_response(system_prompt, user_message):
            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
    except Exception as e:
        print(f"[RAG] LLM error: {e}")
        hint = str(e).strip()
        if "API key" in hint or "OPENAI_API_KEY" in hint or "GEMINI_API_KEY" in hint:
            error_msg = (
                "**AI service configuration error:** The hosted AI service is not configured correctly. "
                "Check `https://buggybot-ai.onrender.com/health` and the Render environment variables, then try again."
            )
        elif "429" in hint or "quota" in hint.lower() or "RESOURCE_EXHAUSTED" in hint:
            error_msg = (
                "**AI service quota exceeded.** Wait a minute and try again, or check the hosted service limits on Render."
            )
        elif "404" in hint and "model" in hint.lower():
            error_msg = (
                "**AI model error:** The hosted AI service is using an invalid model setting. "
                "Check the Render environment variables and redeploy the AI service."
            )
        else:
            error_msg = (
                "Unable to complete this request due to a service error. "
                "Verify `https://buggybot-ai.onrender.com/health` and try again in a moment."
            )
        yield f"data: {json.dumps({'type': 'token', 'content': error_msg})}\n\n"

    yield "data: [DONE]\n\n"
