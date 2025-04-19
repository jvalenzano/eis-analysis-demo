# backend/schemas/comment.py
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class Comment(BaseModel):
    """
    Represents a public comment extracted from an EIS document.
    """
    id: str = Field(..., description="Unique identifier for the comment")
    text: str = Field(..., description="Full text of the comment")
    document_id: str = Field(..., description="ID of the document this comment belongs to")
    page_number: Optional[int] = Field(None, description="Page number in the document")
    author: Optional[str] = Field(None, description="Author name if available")
    date: Optional[datetime] = Field(None, description="Date when the comment was submitted")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class CommentsResponse(BaseModel):
    """
    Response containing extracted comments.
    """
    document_id: str = Field(..., description="ID of the document")
    comments: List[Comment] = Field(..., description="List of extracted comments")
    total_count: int = Field(..., description="Total number of comments")
    page_count: int = Field(..., description="Number of pages in the document")
