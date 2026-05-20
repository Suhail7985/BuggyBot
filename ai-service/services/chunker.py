import re
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os


CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))


def create_chunks(text: str) -> List[Dict[str, Any]]:
    """Split text into chunks with metadata."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""],
        length_function=len,
        is_separator_regex=False,
    )

    # Extract page numbers from the text
    page_markers = {}
    current_page = 1
    lines = text.split('\n')
    position = 0

    for line in lines:
        match = re.match(r'\[PAGE:(\d+)\]', line)
        if match:
            current_page = int(match.group(1))
        page_markers[position] = current_page
        position += len(line) + 1

    # Clean page markers from text before chunking
    clean_text = re.sub(r'\[PAGE:\d+\]\n', '', text)

    raw_chunks = splitter.split_text(clean_text)

    # Create chunk objects with metadata
    chunks = []
    for i, chunk_text in enumerate(raw_chunks):
        chunks.append({
            "id": f"chunk_{i}",
            "text": chunk_text,
            "metadata": {
                "chunk_index": i,
                "page": estimate_page(chunk_text, page_markers, text),
                "chapter": extract_chapter_from_chunk(chunk_text),
                "source": "Grokking Algorithms",
            }
        })

    return chunks


def estimate_page(chunk_text: str, page_markers: Dict, original_text: str) -> int:
    """Estimate which page a chunk comes from."""
    # Find the chunk in the original text and get the nearest page marker
    idx = original_text.find(chunk_text[:50])
    if idx == -1:
        return 1

    closest_page = 1
    for pos, page in sorted(page_markers.items()):
        if pos <= idx:
            closest_page = page
        else:
            break

    return closest_page


def extract_chapter_from_chunk(chunk: str) -> str:
    """Try to identify which chapter this chunk belongs to."""
    chapter_patterns = [
        r'chapter\s+(\d+)[:\s]+([^\n\.]+)',
        r'(\d+)\.\s+([A-Z][^\n]{5,50})',
    ]

    for pattern in chapter_patterns:
        match = re.search(pattern, chunk, re.IGNORECASE)
        if match:
            return match.group(0).strip()[:80]

    return "Grokking Algorithms"
