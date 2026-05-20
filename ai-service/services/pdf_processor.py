import os
import pdfplumber
import re
from typing import List, Tuple
from pathlib import Path


def extract_text_from_pdf(file_path: str) -> Tuple[str, int]:
    """Extract text from PDF and return (text, page_count)."""
    text_parts = []
    page_count = 0

    with pdfplumber.open(file_path) as pdf:
        page_count = len(pdf.pages)
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            if page_text:
                # Add page marker for citation tracking
                text_parts.append(f"\n[PAGE:{i+1}]\n{page_text}")

    raw_text = "\n".join(text_parts)
    cleaned = clean_text(raw_text)
    return cleaned, page_count


def clean_text(text: str) -> str:
    """Clean extracted PDF text."""
    # Remove excessive whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)

    # Fix common PDF extraction artifacts
    text = re.sub(r'(\w)-\n(\w)', r'\1\2', text)  # Fix hyphenated words
    text = re.sub(r'\f', '\n', text)  # Form feeds

    # Remove page numbers (standalone numbers on a line)
    text = re.sub(r'^\d+\s*$', '', text, flags=re.MULTILINE)

    return text.strip()


def extract_chapter_info(text: str) -> dict:
    """Extract chapter headings and their positions."""
    chapters = {}
    chapter_pattern = re.compile(
        r'\[PAGE:(\d+)\].*?(?:Chapter|CHAPTER)\s+(\d+)[:\s]+([^\n]+)',
        re.IGNORECASE | re.DOTALL
    )
    for match in chapter_pattern.finditer(text):
        page = int(match.group(1))
        chapter_num = match.group(2)
        chapter_title = match.group(3).strip()
        chapters[page] = f"Chapter {chapter_num}: {chapter_title}"
    return chapters
