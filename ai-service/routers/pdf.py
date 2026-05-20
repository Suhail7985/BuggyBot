import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import tempfile
from services.pdf_processor import extract_text_from_pdf
from services.chunker import create_chunks
from services.vector_store import store_chunks, delete_collection, collection_exists, list_collections
from models.schemas import ProcessPDFResponse

router = APIRouter(prefix="/api/pdf", tags=["pdf"])


async def process_pdf_background(file_path: str, collection_name: str, document_id: str):
    """Background task to process PDF and store in ChromaDB."""
    try:
        print(f"📄 Processing PDF: {file_path} → collection: {collection_name}")
        text, page_count = extract_text_from_pdf(file_path)
        print(f"✅ Extracted {page_count} pages")

        chunks = create_chunks(text)
        print(f"✅ Created {len(chunks)} chunks")

        stored = store_chunks(chunks, collection_name)
        print(f"✅ Stored {stored} chunks in ChromaDB collection '{collection_name}'")

    except Exception as e:
        print(f"❌ PDF processing error: {e}")
    finally:
        # Clean up temp file
        if os.path.exists(file_path) and "tmp" in file_path:
            os.remove(file_path)


@router.post("/process", response_model=ProcessPDFResponse)
async def process_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    collection_name: str = Form(...),
    document_id: str = Form(default=""),
):
    """Upload and process a PDF file into ChromaDB."""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Save uploaded file to temp location
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    # Quick page count for immediate response
    try:
        import pdfplumber
        with pdfplumber.open(tmp_path) as pdf:
            page_count = len(pdf.pages)
    except:
        page_count = 0

    # Process in background
    background_tasks.add_task(
        process_pdf_background, tmp_path, collection_name, document_id
    )

    return ProcessPDFResponse(
        success=True,
        message=f"PDF processing started for collection '{collection_name}'",
        chunk_count=0,
        page_count=page_count,
        collection_name=collection_name,
    )


@router.get("/collections")
async def get_collections():
    """List all available ChromaDB collections."""
    collections = list_collections()
    return {"success": True, "collections": collections}


@router.get("/collection/{collection_name}/status")
async def get_collection_status(collection_name: str):
    """Check if a collection exists and is ready."""
    exists = collection_exists(collection_name)
    return {"success": True, "exists": exists, "collection_name": collection_name}


@router.delete("/collection/{collection_name}")
async def delete_collection_endpoint(collection_name: str):
    """Delete a ChromaDB collection."""
    success = delete_collection(collection_name)
    return {"success": success, "message": f"Collection '{collection_name}' deleted" if success else "Collection not found"}
