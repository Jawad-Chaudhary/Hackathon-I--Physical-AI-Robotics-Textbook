"""
Embeddings and vector search service
Manages Qdrant vector store for RAG chatbot
Uses Google Gemini for embeddings
"""

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from config import QDRANT_URL, QDRANT_API_KEY, GEMINI_API_KEY
import google.generativeai as genai

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

COLLECTION_NAME = "textbook_chapters"
# Gemini text-embedding-004 uses 768 dimensions
EMBEDDING_DIMENSION = 768

# Initialize Qdrant client
client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY) if QDRANT_URL and QDRANT_API_KEY else None

def setup_collection():
    """
    Create Qdrant collection if it doesn't exist
    Uses 768 dimensions for Gemini text-embedding-004
    """
    if not client:
        print("Warning: Qdrant client not configured")
        return

    try:
        collections = client.get_collections().collections
        existing = next((c for c in collections if c.name == COLLECTION_NAME), None)

        if existing:
            # Check if dimensions match, if not recreate
            info = client.get_collection(COLLECTION_NAME)
            current_size = info.config.params.vectors.size
            if current_size != EMBEDDING_DIMENSION:
                print(f"Recreating collection: dimension mismatch ({current_size} vs {EMBEDDING_DIMENSION})")
                client.delete_collection(COLLECTION_NAME)
                client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config=VectorParams(size=EMBEDDING_DIMENSION, distance=Distance.COSINE)
                )
                print(f"Recreated collection: {COLLECTION_NAME} with {EMBEDDING_DIMENSION} dimensions")
            else:
                print(f"Collection already exists: {COLLECTION_NAME}")
        else:
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=EMBEDDING_DIMENSION, distance=Distance.COSINE)
            )
            print(f"Created collection: {COLLECTION_NAME}")
    except Exception as e:
        print(f"Error setting up collection: {e}")

def embed_text(text: str) -> list[float]:
    """
    Generate embedding using Gemini text-embedding-004
    Args:
        text: Text to embed
    Returns:
        768-dimensional embedding vector
    """
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_document"
    )
    return result['embedding']

def embed_query(text: str) -> list[float]:
    """
    Generate embedding for a search query
    Args:
        text: Query text to embed
    Returns:
        768-dimensional embedding vector
    """
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_query"
    )
    return result['embedding']

def search_similar(query: str, limit: int = 5) -> list:
    """
    Search for similar chapter sections using vector similarity
    Args:
        query: Search query text
        limit: Maximum number of results
    Returns:
        List of search results with payloads
    """
    if not client:
        return []

    try:
        query_vector = embed_query(query)
        results = client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=limit
        )
        return results.points if hasattr(results, 'points') else []
    except Exception as e:
        print(f"Error searching: {e}")
        return []
