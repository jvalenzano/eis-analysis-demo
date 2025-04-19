# backend/schemas/document.py
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class Document(BaseModel):
    """
    Represents an Environmental Impact Statement document.
    """
    id: str = Field(..., description="Unique identifier for the document")
    name: str = Field(..., description="Human-readable name of the document")
    date: str = Field(..., description="Document creation or upload date")
    size: int = Field(..., description="Size of the document in bytes")
    url: Optional[str] = Field(None, description="URL to access the document")
    thumbnail_url: Optional[str] = Field(None, description="Thumbnail image URL")
    description: Optional[str] = Field(None, description="Document description")
    type: Optional[str] = Field(None, description="Document type or category")

class DocumentList(BaseModel):
    """
    A list of documents with metadata.
    """
    documents: List[Document] = Field(..., description="List of documents")

class DocumentUpload(BaseModel):
    """
    Response after a document upload.
    """
    id: str = Field(..., description="Assigned document ID")
    name: str = Field(..., description="Original filename")
    size: int = Field(..., description="File size in bytes")
    upload_time: datetime = Field(..., description="Upload timestamp")
    status: str = Field(..., description="Upload status")
