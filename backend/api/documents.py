# backend/api/documents.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import List, Dict, Any, Optional
import logging
import uuid
from datetime import datetime
from backend.schemas.document import Document, DocumentList, DocumentUpload
from backend.schemas.comment import Comment, CommentsResponse
from backend.models.document_processor import DocumentProcessor
from backend.config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/documents", tags=["documents"])

# Sample documents for demo - Replace with actual storage logic later
SAMPLE_DOCUMENTS = [
    Document(
        id="sample-eis-1",
        name="Forest Service EIS - Pine Mountain Project",
        date="2023-05-15",
        size=4582345,
        description="Draft Environmental Impact Statement for the Pine Mountain Forest Management Project.",
        type="Draft EIS"
    ),
    Document(
        id="sample-eis-2",
        name="River Basin Restoration Plan",
        date="2023-03-22",
        size=3251487,
        description="Public comments on the River Basin ecosystem restoration initiative.",
        type="Public Comments"
    ),
    # Add more sample documents if desired from the milestone doc
    Document(
        id="sample-eis-3",
        name="Wildlife Corridor Infrastructure Project",
        date="2023-06-10",
        size=2874521,
        description="Analysis of wildlife corridor impacts from proposed highway development.",
        type="Final EIS"
    ),
    Document(
         id="sample-eis-4",
         name="Mountain Valley Timber Sale",
         date="2023-04-05",
         size=5124879,
         description="Environmental impact assessment for proposed timber harvesting in Mountain Valley region.",
         type="Draft EIS"
    ),
    Document(
         id="sample-eis-5",
         name="Lakeside Recreation Development",
         date="2023-07-18",
         size=3684512,
         description="Public feedback on proposed recreational facilities at Clearwater Lake.",
         type="Public Comments"
    )
]

# Keep track of uploaded documents in memory (for demo purposes)
# In a real app, use a database or persistent storage
UPLOADED_DOCUMENTS_METADATA = {} # Stores {doc_id: upload_info_dict}


def get_document_processor() -> DocumentProcessor:
    """
    Factory function to create a DocumentProcessor instance using dependency injection.

    Returns:
        Initialized DocumentProcessor
    """
    # This ensures a new processor instance potentially with updated settings
    # is created per request or as configured by FastAPI's dependency management.
    return DocumentProcessor(
        project_id=settings.PROJECT_ID,
        location=settings.DOCUMENT_PROCESSOR_LOCATION,
        processor_id=settings.DOCUMENT_PROCESSOR_ID
    )

@router.get("", response_model=DocumentList)
async def list_documents():
    """
    List available documents for analysis.
    Combines sample documents with uploaded document metadata.
    """
    # Combine sample docs with metadata from uploaded docs
    all_docs = []
    all_docs.extend(SAMPLE_DOCUMENTS) # Start with sample static documents

    # Add documents that have been uploaded during the session
    for doc_id, meta in UPLOADED_DOCUMENTS_METADATA.items():
         # Convert metadata dict to Document model
         all_docs.append(
              Document(
                   id=doc_id,
                   name=meta.get("name", "Unknown"),
                   date=datetime.now().strftime("%Y-%m-%d"), # Use current date for simplicity
                   size=meta.get("size", 0),
                   url=meta.get("gcs_uri"),
                   description=f"Uploaded document ({meta.get('mime_type')})",
                   type="Uploaded"
              )
         )

    return DocumentList(documents=all_docs)

@router.get("/{document_id}", response_model=Document)
async def get_document(document_id: str):
    """
    Get a specific document by ID.
    Checks both sample and uploaded documents.
    """
    # Check sample documents first
    for doc in SAMPLE_DOCUMENTS:
        if doc.id == document_id:
            return doc

    # Check uploaded documents
    if document_id in UPLOADED_DOCUMENTS_METADATA:
         meta = UPLOADED_DOCUMENTS_METADATA[document_id]
         return Document(
              id=document_id,
              name=meta.get("name", "Unknown"),
              date=datetime.now().strftime("%Y-%m-%d"),
              size=meta.get("size", 0),
              url=meta.get("gcs_uri"),
              description=f"Uploaded document ({meta.get('mime_type')})",
              type="Uploaded"
         )

    # Document not found
    raise HTTPException(status_code=404, detail=f"Document {document_id} not found")

@router.post("/upload", response_model=DocumentUpload)
async def upload_document_endpoint( # Renamed to avoid conflict with variable name
    file: UploadFile = File(...),
    title: Optional[str] = Form(None), # Optional form fields
    description: Optional[str] = Form(None),
    doc_processor: DocumentProcessor = Depends(get_document_processor) # Use dependency injection
):
    """
    Upload a new document to GCS.
    """
    try:
        # Determine the MIME type correctly
        content_type = file.content_type or "application/octet-stream"
        logger.info(f"Upload request for file '{file.filename}', type: {content_type}, title: {title}")

        # Upload the document using the processor
        # Pass the file object directly
        upload_info = doc_processor.upload_document(
            file.file, # Pass the file-like object
            title or file.filename, # Use title if provided, else filename
            content_type
        )

        # Store metadata about the uploaded file (in memory for demo)
        UPLOADED_DOCUMENTS_METADATA[upload_info["id"]] = upload_info
        logger.info(f"Stored metadata for uploaded doc ID: {upload_info['id']}")


        # Create response using the DocumentUpload schema
        return DocumentUpload(
            id=upload_info["id"],
            name=upload_info["name"],
            size=upload_info["size"],
            upload_time=datetime.now(), # Timestamp the completion of the upload request
            status=upload_info["status"]
        )

    except ValueError as ve:
         logger.error(f"Configuration error during upload: {str(ve)}")
         raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
         logger.error(f"Runtime error during upload: {str(re)}")
         raise HTTPException(status_code=500, detail=str(re))
    except Exception as e:
        # Catch any other unexpected errors
        logger.error(f"Unexpected error during document upload: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during upload: {str(e)}")


# Note: The /comments and /preview endpoints might be better placed
# under the /analysis router if they trigger processing jobs.
# Keeping them here for now as per the original structure.

@router.get("/{document_id}/comments", response_model=CommentsResponse)
async def get_document_comments(
    document_id: str,
    doc_processor: DocumentProcessor = Depends(get_document_processor)
):
    """
    Get comments extracted from a document.
    NOTE: This directly processes the document. Consider triggering an async job instead.
    """
    logger.warning(f"Direct comment extraction requested for {document_id}. Consider using the async /api/analysis/process endpoint.")

    # Find the document metadata (check uploaded first, then sample)
    doc_meta = UPLOADED_DOCUMENTS_METADATA.get(document_id)
    if not doc_meta:
         # Check if it's a sample document (won't have blob_name, cannot process)
         is_sample = any(doc.id == document_id for doc in SAMPLE_DOCUMENTS)
         if is_sample:
              raise HTTPException(status_code=400, detail=f"Cannot directly extract comments from sample document '{document_id}'. Upload the document first.")
         else:
              raise HTTPException(status_code=404, detail=f"Metadata for document {document_id} not found.")

    blob_name = doc_meta.get("blob_name")
    if not blob_name:
         raise HTTPException(status_code=404, detail=f"Blob name not found for document {document_id}.")

    try:
        # Process the document directly and extract comments
        # This is synchronous and might timeout for large documents
        comments = doc_processor.process_and_extract_comments(document_id, blob_name)

        # Estimate page count (simple approach)
        max_page = 0
        if comments:
             max_page = max(c.page_number or 0 for c in comments)

        # Create response
        return CommentsResponse(
            document_id=document_id,
            comments=comments,
            total_count=len(comments),
            page_count=max_page # Provide best estimate
        )

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e: # Catch config errors from processor
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e: # Catch processing errors from processor
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error extracting comments for {document_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred during comment extraction.")


@router.get("/{document_id}/preview")
async def get_document_preview(
    document_id: str,
    doc_processor: DocumentProcessor = Depends(get_document_processor)
):
    """
    Get a preview of a document. (Placeholder implementation)
    """
    # Check if document exists (sample or uploaded)
    if not any(doc.id == document_id for doc in SAMPLE_DOCUMENTS) and document_id not in UPLOADED_DOCUMENTS_METADATA:
         raise HTTPException(status_code=404, detail=f"Document {document_id} not found")

    try:
        # Get preview info using the processor
        preview_info = doc_processor.get_document_preview(document_id)
        return preview_info

    except FileNotFoundError as e: # Should not happen with current check, but good practice
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e: # Catch config errors
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e: # Catch processing errors
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error generating preview for {document_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred during preview generation.")

