# backend/api/analysis.py
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import List, Dict, Any, Optional
import logging
import uuid
from datetime import datetime
from backend.schemas.comment import Comment, CommentsResponse # Although not directly used, keep for context
from backend.models.document_processor import DocumentProcessor
from backend.config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/analysis", tags=["analysis"])

# In-memory storage for job status (Replace with a database/persistent store in production)
analysis_jobs: Dict[str, Dict[str, Any]] = {}

def get_document_processor() -> DocumentProcessor:
    """Factory function for DocumentProcessor dependency injection"""
    return DocumentProcessor(
        project_id=settings.PROJECT_ID,
        location=settings.DOCUMENT_PROCESSOR_LOCATION,
        processor_id=settings.DOCUMENT_PROCESSOR_ID
    )

# Import UPLOADED_DOCUMENTS_METADATA from documents API - slightly unconventional
# but avoids duplicating the in-memory store for demo purposes.
# A better approach in production is a shared database or cache.
try:
     from backend.api.documents import UPLOADED_DOCUMENTS_METADATA, SAMPLE_DOCUMENTS
except ImportError:
     logger.error("Could not import UPLOADED_DOCUMENTS_METADATA from documents API. State may be inconsistent.")
     UPLOADED_DOCUMENTS_METADATA = {} # Fallback to empty dict
     SAMPLE_DOCUMENTS = []


async def process_document_async(
    job_id: str,
    document_id: str,
    doc_processor: DocumentProcessor
):
    """
    Background task to process a document and extract comments.

    Args:
        job_id: Analysis job ID
        document_id: Document ID to process
        doc_processor: DocumentProcessor instance
    """
    try:
        logger.info(f"Starting async processing for job {job_id}, document {document_id}")
        # Update job status: PROCESSING
        analysis_jobs[job_id].update({
            "status": "PROCESSING",
            "progress": 20, # Arbitrary progress update
            "message": "Locating document and initiating processing."
        })

        # --- Find the document blob name ---
        doc_meta = UPLOADED_DOCUMENTS_METADATA.get(document_id)
        blob_name = None
        if doc_meta:
            blob_name = doc_meta.get("blob_name")

        if not blob_name:
             # Check if it's a sample document (cannot be processed this way)
             is_sample = any(doc.id == document_id for doc in SAMPLE_DOCUMENTS)
             status_message = f"Document {document_id} not found in uploaded metadata."
             if is_sample:
                  status_message = f"Sample document '{document_id}' cannot be processed asynchronously. Please upload it first."

             logger.error(f"Job {job_id} failed: {status_message}")
             analysis_jobs[job_id].update({
                 "status": "FAILED", "progress": 0, "message": status_message
             })
             return # Stop processing

        # --- Process document and extract comments ---
        analysis_jobs[job_id].update({
             "progress": 50,
             "message": f"Extracting comments from gs://{doc_processor.input_bucket_name}/{blob_name}"
        })

        comments = doc_processor.process_and_extract_comments(document_id, blob_name)

        # --- Update job status: COMPLETED ---
        logger.info(f"Successfully processed job {job_id}, document {document_id}. Found {len(comments)} comments.")
        # Estimate page count (simple approach)
        max_page = 0
        if comments:
             max_page = max(c.page_number or 0 for c in comments)

        analysis_jobs[job_id].update({
            "status": "COMPLETED",
            "progress": 100,
            "message": f"Successfully extracted {len(comments)} comments.",
            # Store actual results or summary; avoid storing large comment lists in memory for production
            "result": {
                "document_id": document_id,
                "comment_count": len(comments),
                "estimated_page_count": max_page,
                # Add other analysis results here later (sentiment, classification)
                "completed_at": datetime.now().isoformat()
            }
        })

    except FileNotFoundError as e:
         logger.error(f"Job {job_id} failed: Document blob not found - {str(e)}")
         analysis_jobs[job_id].update({
             "status": "FAILED", "progress": 0, "message": f"File not found: {str(e)}"
         })
    except ValueError as e: # Catch config errors from processor
         logger.error(f"Job {job_id} failed: Configuration error - {str(e)}")
         analysis_jobs[job_id].update({
             "status": "FAILED", "progress": 0, "message": f"Configuration error: {str(e)}"
         })
    except RuntimeError as e: # Catch processing errors from processor
         logger.error(f"Job {job_id} failed: Processing error - {str(e)}")
         analysis_jobs[job_id].update({
             "status": "FAILED", "progress": 0, "message": f"Processing error: {str(e)}"
         })
    except Exception as e:
        # Catch any other unexpected errors during the async task
        logger.error(f"Job {job_id} failed unexpectedly: {str(e)}", exc_info=True)
        analysis_jobs[job_id].update({
            "status": "FAILED",
            "progress": 0,
            "message": f"An unexpected error occurred during processing: {str(e)}"
        })


@router.post("/process")
async def process_document_request( # Renamed for clarity
    request: Dict[str, Any], # Expecting {"documentId": "some-id"}
    background_tasks: BackgroundTasks,
    doc_processor: DocumentProcessor = Depends(get_document_processor)
):
    """
    Initiate asynchronous processing (comment extraction) for a document.
    """
    document_id = request.get("documentId")
    if not document_id:
        raise HTTPException(status_code=400, detail="'documentId' is required in the request body")

    logger.info(f"Received analysis request for document ID: {document_id}")

    # Check if document exists (uploaded only, as samples can't be processed async)
    if document_id not in UPLOADED_DOCUMENTS_METADATA:
         is_sample = any(doc.id == document_id for doc in SAMPLE_DOCUMENTS)
         if is_sample:
              raise HTTPException(status_code=400, detail=f"Sample document '{document_id}' cannot be processed asynchronously. Please upload it first.")
         else:
              raise HTTPException(status_code=404, detail=f"Document ID '{document_id}' not found. Please upload the document first.")

    try:
        # Generate unique job ID
        job_id = str(uuid.uuid4())

        # Initialize job status in our in-memory store
        analysis_jobs[job_id] = {
            "id": job_id,
            "document_id": document_id,
            "status": "QUEUED", # Changed from INITIATED
            "progress": 0,
            "started_at": datetime.now().isoformat(),
            "message": "Analysis job queued for processing."
        }

        # Add the actual processing task to the background queue
        background_tasks.add_task(
            process_document_async,
            job_id=job_id,
            document_id=document_id,
            doc_processor=doc_processor # Pass the dependency-injected processor
        )

        logger.info(f"Queued job {job_id} for document {document_id}")

        # Return job information immediately
        return {
            "jobId": job_id,
            "documentId": document_id,
            "status": "QUEUED",
            "message": "Analysis job accepted and queued.",
            "estimatedTimeSeconds": 60 # Rough estimate, adjust as needed
        }

    except Exception as e:
        # Catch errors during job initialization/queuing
        logger.error(f"Failed to initiate analysis for {document_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to queue analysis job: {str(e)}")


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """
    Get the status of an analysis job.
    """
    if job_id not in analysis_jobs:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    logger.debug(f"Status requested for job {job_id}. Current status: {analysis_jobs[job_id].get('status')}")
    return analysis_jobs[job_id]


@router.get("/results/{job_id}")
async def get_analysis_results(job_id: str):
    """
    Get the results of a completed analysis job.
    (Currently returns summary, not full comments)
    """
    if job_id not in analysis_jobs:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    job = analysis_jobs[job_id]

    if job["status"] != "COMPLETED":
        raise HTTPException(
            status_code=400, # Use 400 Bad Request as results aren't ready
            detail=f"Job status is '{job['status']}'. Results are not available yet."
        )

    # Return the 'result' part of the job status
    return job.get("result", {"message": "No result data found."}) # Added default

