"""
Index textbook content into Qdrant for RAG chatbot
"""
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from services.embeddings_service import client, embed_text, COLLECTION_NAME
from qdrant_client.models import PointStruct
import uuid

DOCS_DIR = Path(__file__).parent.parent / "textbook" / "docs"

def extract_sections(content: str, chapter_slug: str) -> list:
    """Extract sections from markdown content"""
    sections = []
    current_section = ""
    current_title = chapter_slug

    for line in content.split("\n"):
        if line.startswith("## "):
            if current_section.strip():
                sections.append({
                    "text": current_section.strip(),
                    "section_title": current_title,
                    "chapter_slug": chapter_slug
                })
            current_title = line[3:].strip()
            current_section = line + "\n"
        else:
            current_section += line + "\n"

    # Add last section
    if current_section.strip():
        sections.append({
            "text": current_section.strip(),
            "section_title": current_title,
            "chapter_slug": chapter_slug
        })

    return sections

def index_markdown_file(filepath: Path) -> int:
    """Index a markdown file into Qdrant"""
    chapter_slug = filepath.stem

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove frontmatter
    if content.startswith('---'):
        end = content.find('---', 3)
        if end != -1:
            content = content[end+3:].strip()

    sections = extract_sections(content, chapter_slug)

    points = []
    for section in sections:
        try:
            embedding = embed_text(section["text"][:8000])  # Limit text length
            point_id = str(uuid.uuid4())
            points.append(PointStruct(
                id=point_id,
                vector=embedding,
                payload=section
            ))
        except Exception as e:
            print(f"  Error embedding section: {e}")

    if points and client:
        client.upsert(collection_name=COLLECTION_NAME, points=points)
        print(f"  Indexed {len(points)} sections from {chapter_slug}")

    return len(points)

def main():
    if not client:
        print("Error: Qdrant client not configured")
        return

    print(f"Indexing textbook content from {DOCS_DIR}")

    total = 0
    for md_file in DOCS_DIR.rglob("*.md"):
        print(f"Processing: {md_file.name}")
        count = index_markdown_file(md_file)
        total += count

    print(f"\nTotal sections indexed: {total}")

if __name__ == "__main__":
    main()
