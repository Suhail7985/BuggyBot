import os
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')
import asyncio
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import pdf, rag
from services.pdf_processor import extract_text_from_pdf
from services.chunker import create_chunks
from services.vector_store import store_chunks, collection_exists
from models.schemas import HealthResponse


import re

DATA_DIR = os.getenv("PRELOAD_DATA_DIR", "./data")
DEFAULT_COLLECTION = os.getenv("PRELOAD_COLLECTION_NAME", "grokking_algorithms")


async def preload_all_pdfs():
    """Scan the data directory and pre-load all PDF files into ChromaDB on startup."""
    if not os.path.exists(DATA_DIR):
        print(f"⚠️  Data directory not found at: {DATA_DIR}")
        return

    pdf_files = [f for f in os.listdir(DATA_DIR) if f.endswith(".pdf")]
    
    if not pdf_files:
        print(f"ℹ️  No PDFs found in '{DATA_DIR}' for preloading.")
        print(f"   Please place PDF books under: {os.path.abspath(DATA_DIR)}")
        return

    print(f"📚 Found {len(pdf_files)} PDF(s) to preload: {', '.join(pdf_files)}")

    for pdf_file in pdf_files:
        file_path = os.path.join(DATA_DIR, pdf_file)
        
        # Normalize name for ChromaDB collection (must be alphanumeric, hyphens, underscores)
        collection_name = os.path.splitext(pdf_file)[0].lower()
        collection_name = re.sub(r'[^a-z0-9_-]', '_', collection_name)
        collection_name = re.sub(r'_+', '_', collection_name).strip('_')

        # Fallback to default collection name if it matches grokking_algorithms
        if "grokking" in collection_name and "algorithm" in collection_name:
            collection_name = DEFAULT_COLLECTION

        if collection_exists(collection_name):
            print(f"✅ Collection '{collection_name}' already exists. Skipping preload for '{pdf_file}'.")
            continue

        print(f"📚 Pre-loading '{pdf_file}' into ChromaDB collection '{collection_name}'...")
        try:
            text, page_count = extract_text_from_pdf(file_path)
            print(f"   📄 Extracted {page_count} pages from '{pdf_file}'")

            chunks = create_chunks(text)
            print(f"   🔪 Created {len(chunks)} chunks")

            stored = store_chunks(chunks, collection_name)
            print(f"   ✅ Stored {stored} chunks in ChromaDB for '{pdf_file}'")
            print(f"   🎉 '{pdf_file}' is ready for BuggyBot!")

        except Exception as e:
            print(f"❌ Failed to preload '{pdf_file}': {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — preload PDFs on startup."""
    from services.config import get_llm_provider, get_embeddings_provider

    print("🚀 BuggyBot AI Service starting...")
    llm = get_llm_provider()
    emb = get_embeddings_provider()
    if llm == "none":
        print("⚠️  WARNING: No OPENAI_API_KEY or GEMINI_API_KEY — chat will fail until .env is configured.")
    else:
        print(f"✅ LLM provider: {llm} · Embeddings: {emb}")
    # Run preloading in background so server starts instantly
    asyncio.create_task(preload_all_pdfs())
    yield
    print("👋 BuggyBot AI Service shutting down...")


app = FastAPI(
    title="BuggyBot AI Service",
    description="RAG-powered DSA mentor AI using OpenAI + ChromaDB",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Routers
app.include_router(pdf.router)
app.include_router(rag.router)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    preloaded = collection_exists(DEFAULT_COLLECTION)
    return HealthResponse(
        status="ok",
        message="BuggyBot AI Service is running 🤖",
        timestamp=datetime.utcnow().isoformat(),
        preloaded_collection=DEFAULT_COLLECTION if preloaded else None,
    )


@app.get("/")
async def root():
    return {
        "service": "BuggyBot AI Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
