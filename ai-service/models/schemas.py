from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    chatHistory: List[ChatMessage] = Field(default=[])
    mode: Literal["chat", "quiz", "complexity"] = "chat"
    userId: Optional[str] = None
    collectionName: Optional[str] = "grokking_algorithms"


class Citation(BaseModel):
    chapter: str
    page: Optional[int] = None
    excerpt: str
    source: str


class ChatResponse(BaseModel):
    response: str
    citations: List[Citation] = []


class ProcessPDFResponse(BaseModel):
    success: bool
    message: str
    chunk_count: int = 0
    page_count: int = 0
    collection_name: str


class HealthResponse(BaseModel):
    status: str
    message: str
    timestamp: str
    preloaded_collection: Optional[str] = None
