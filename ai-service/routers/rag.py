from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from models.schemas import ChatRequest, ChatResponse
from services.rag_chain import rag_stream
from services.vector_store import collection_exists, semantic_search
import os

router = APIRouter(prefix="/api/rag", tags=["rag"])

DEFAULT_COLLECTION = os.getenv("PRELOAD_COLLECTION_NAME", "grokking_algorithms")


@router.post("/chat")
async def chat_stream(request: ChatRequest):
    """Stream a RAG-powered chat response."""
    collection = request.collectionName or DEFAULT_COLLECTION

    return StreamingResponse(
        rag_stream(
            message=request.message,
            chat_history=[m.model_dump() for m in request.chatHistory],
            mode=request.mode,
            collection_name=collection,
            user_id=request.userId,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.post("/search")
async def semantic_search_endpoint(request: ChatRequest):
    """Direct semantic search endpoint (non-streaming)."""
    collection = request.collectionName or DEFAULT_COLLECTION
    results = semantic_search(request.message, collection, top_k=5)
    return {"success": True, "results": results}


@router.get("/health")
async def rag_health():
    """Check if RAG system is operational."""
    default_ready = collection_exists(DEFAULT_COLLECTION)
    return {
        "success": True,
        "rag_ready": default_ready,
        "default_collection": DEFAULT_COLLECTION,
        "default_collection_ready": default_ready,
    }
