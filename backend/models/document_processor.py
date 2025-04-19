# backend/models/document_processor.py
from typing import List, Dict, Any, Optional, BinaryIO
import logging
import io
import re
import uuid
from google.cloud import documentai_v1 as documentai
from google.cloud import storage
from google.api_core.client_options import ClientOptions
from backend.schemas.comment import Comment
from backend.config.settings import settings

# Configure logging
logging.basicConfig(level=logging.INFO,
                  format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DocumentProcessor:
    """
    Processes EIS documents using Google Document AI to extract comments.

    This class is responsible for:
    1. Processing document files with Document AI
    2. Extracting public comments from processed documents
    3. Storing and retrieving documents from Google Cloud Storage
    """

    def __init__(
        self,
        project_id: Optional[str] = None,
        location: Optional[str] = None,
        processor_id: Optional[str] = None
    ):
        """
        Initialize the Document Processor.

        Args:
            project_id: Google Cloud project ID (defaults to settings)
            location: Document AI processor location (defaults to settings)
            processor_id: Document AI processor ID (defaults to settings)
        """
        self.project_id = project_id or settings.PROJECT_ID
        self.location = location or settings.DOCUMENT_PROCESSOR_LOCATION
        self.processor_id = processor_id or settings.DOCUMENT_PROCESSOR_ID

        if not self.project_id:
            raise ValueError("Project ID must be provided or set in environment variables")

        # Initialize Document AI client
        if self.processor_id:
            client_options = ClientOptions(
                api_endpoint=f"{self.location}-documentai.googleapis.com"
            )
            self.docai_client = documentai.DocumentProcessorServiceClient(client_options=client_options)
            self.processor_name = self.docai_client.processor_path(
                self.project_id, self.location, self.processor_id
            )
            logger.info(f"Document AI processor initialized: {self.processor_name}")
        else:
            self.docai_client = None
            logger.warning("Document AI processor not configured. Using fallback text processing.")

        # Initialize Storage client
        self.storage_client = storage.Client(project=self.project_id)

        # Define input and output buckets
        self.input_bucket_name = settings.INPUT_BUCKET
        self.output_bucket_name = settings.OUTPUT_BUCKET

        if not self.input_bucket_name or not self.output_bucket_name:
            logger.warning("Storage buckets not fully configured. Some operations may fail.")

    def process_document(self, content: bytes, mime_type: str) -> documentai.Document:
        """
        Process a document using Document AI.

        Args:
            content: Raw document bytes
            mime_type: MIME type of the document

        Returns:
            Processed Document AI document

        Raises:
            ValueError: If Document AI is not configured
            RuntimeError: If document processing fails
        """
        if not self.docai_client:
            raise ValueError("Document AI processor not configured")

        try:
            # Create document object
            raw_document = documentai.RawDocument(
                content=content, mime_type=mime_type
            )

            # Configure the process request
            request = documentai.ProcessRequest(
                name=self.processor_name,
                raw_document=raw_document
            )

            # Process the document
            result = self.docai_client.process_document(request=request)
            return result.document

        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            raise RuntimeError(f"Document processing failed: {str(e)}")

    def extract_comments(self, document: documentai.Document) -> List[Comment]:
        """
        Extract comments from a processed Document AI document.

        This method extracts comments using entity detection if available,
        or falls back to heuristic-based extraction from document text.

        Args:
            document: Processed Document AI document

        Returns:
            List of extracted comments
        """
        comments = []

        # If Document AI extracted entities, use them directly
        if hasattr(document, 'entities') and document.entities:
            for i, entity in enumerate(document.entities):
                if entity.type_ == "COMMENT": # Assuming 'COMMENT' is the entity type for comments
                    comment_text = ""
                    for segment in entity.text_anchor.text_segments:
                        start = int(segment.start_index) # Ensure indices are integers
                        end = int(segment.end_index)     # Ensure indices are integers
                        comment_text += document.text[start:end]

                    # Create Comment object
                    comment = Comment(
                        id=f"{uuid.uuid4()}",
                        text=comment_text.strip(),
                        document_id=document.uri or "unknown",
                        page_number=self._get_page_number(document, entity)
                    )
                    comments.append(comment)

        # If no entities or not the right type, use text-based extraction
        if not comments:
            comments = self._extract_comments_from_text(document)

        return comments

    def _get_page_number(self, document: documentai.Document, entity: Any) -> Optional[int]:
        """
        Determine the page number for an entity.

        Args:
            document: Document AI document
            entity: Document AI entity

        Returns:
            Page number if available, None otherwise
        """
        if not hasattr(entity, 'text_anchor') or not entity.text_anchor.text_segments:
            return None

        # Get the start position of the entity
        # Use the first segment's start index
        start_pos = int(entity.text_anchor.text_segments[0].start_index)

        # Find which page contains this position
        for page in document.pages:
             if page.layout and page.layout.text_anchor and page.layout.text_anchor.text_segments:
                page_text_start = int(page.layout.text_anchor.text_segments[0].start_index)
                page_text_end = int(page.layout.text_anchor.text_segments[0].end_index)

                if page_text_start <= start_pos < page_text_end:
                    return page.page_number

        return None

    def _extract_comments_from_text(self, document: documentai.Document) -> List[Comment]:
        """
        Extract comments from document text using heuristics.

        This is a fallback method when Document AI entity extraction
        doesn't identify comments directly.

        Args:
            document: Document AI document

        Returns:
            List of extracted comments
        """
        comments = []
        doc_id = document.uri or "unknown"

        # Simple heuristic: look for paragraphs that may be comments
        # Split based on double newlines or potentially page breaks if needed
        paragraphs = re.split(r'\n\s*\n', document.text) # Basic paragraph split

        for i, paragraph in enumerate(paragraphs):
            paragraph_clean = paragraph.strip()
            # Skip very short paragraphs
            if len(paragraph_clean) < 20: # Adjust threshold as needed
                continue

            # Skip headers, footers, and other non-comment text (simplified example)
            # Might need more sophisticated rules based on EIS structure
            if re.match(r'^(Page \d+|Table of Contents|Chapter \d+|Figure \d+|Table \d+)', paragraph_clean, re.IGNORECASE):
                 continue

            # Basic check to avoid lines that are likely just titles or section headers (all caps, short)
            if paragraph_clean.isupper() and len(paragraph_clean.split()) < 6:
                continue

            # Create a comment
            comment = Comment(
                id=f"{doc_id}-{uuid.uuid4()}", # Use UUID for uniqueness
                text=paragraph_clean,
                document_id=doc_id,
                page_number=self._estimate_page_number(document, paragraph) # Pass original paragraph for location
            )
            comments.append(comment)

        return comments

    def _estimate_page_number(self, document: documentai.Document, text: str) -> Optional[int]:
        """
        Estimate the page number for a text segment within the full document text.

        Args:
            document: Document AI document containing the full text and page layouts.
            text: The specific text segment (e.g., a paragraph) to locate.

        Returns:
            Estimated page number if possible, None otherwise
        """
        # Use the original document text for searching
        full_text = document.text
        if not text or text not in full_text:
            return None

        # Find the first occurrence of the text segment
        try:
            start_pos = full_text.index(text)
        except ValueError:
             # Text segment not found in the document text
             return None

        # Find which page contains this starting position
        for page in document.pages:
            if page.layout and page.layout.text_anchor and page.layout.text_anchor.text_segments:
                page_text_start = int(page.layout.text_anchor.text_segments[0].start_index)
                page_text_end = int(page.layout.text_anchor.text_segments[0].end_index)

                # Check if the start position of the text falls within the page's text span
                if page_text_start <= start_pos < page_text_end:
                    return page.page_number

        # If no page is found containing the start position
        return None


    def upload_document(self, file: BinaryIO, filename: str, mime_type: str) -> Dict[str, Any]:
        """
        Upload a document to Cloud Storage. Processing is not done here.

        Args:
            file: File-like object containing document data
            filename: Name of the file
            mime_type: MIME type of the document

        Returns:
            Dictionary with upload information

        Raises:
            ValueError: If storage bucket is not configured
            RuntimeError: If upload fails
        """
        if not self.input_bucket_name:
            raise ValueError("Input storage bucket not configured")

        try:
            # Generate a unique ID for the document
            doc_id = str(uuid.uuid4())
            # Basic sanitization of filename for blob name
            safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
            blob_name = f"{doc_id}/{safe_filename}" # Store in a folder named by doc_id

            # Get the bucket
            bucket = self.storage_client.bucket(self.input_bucket_name)

            # Create a new blob and upload the file
            blob = bucket.blob(blob_name)

            # Reset file pointer before upload
            file.seek(0)
            blob.upload_from_file(file, content_type=mime_type)

            # Get file size after upload (or before if pointer reset is reliable)
            file.seek(0, io.SEEK_END)
            file_size = file.tell()

            logger.info(f"Uploaded '{filename}' ({file_size} bytes) to gs://{self.input_bucket_name}/{blob_name}")

            # Return upload information
            upload_info = {
                "id": doc_id,
                "name": filename,
                "size": file_size,
                "mime_type": mime_type,
                "blob_name": blob_name,
                "bucket": self.input_bucket_name,
                "gcs_uri": f"gs://{self.input_bucket_name}/{blob_name}", # GCS URI is often useful
                "status": "uploaded"
            }

            return upload_info

        except Exception as e:
            logger.error(f"Error uploading document '{filename}': {str(e)}")
            raise RuntimeError(f"Document upload failed: {str(e)}")

    def process_and_extract_comments(self, doc_id: str, blob_name: Optional[str] = None) -> List[Comment]:
        """
        Process a document from storage and extract comments. (Intended for async job)

        Args:
            doc_id: Document ID (used primarily for associating comments)
            blob_name: GCS blob name (required to locate the file)

        Returns:
            List of extracted comments

        Raises:
            ValueError: If storage bucket or blob_name is not configured/provided
            FileNotFoundError: If document blob is not found
            RuntimeError: If processing fails
        """
        if not self.input_bucket_name:
            raise ValueError("Input storage bucket not configured")
        if not blob_name:
            raise ValueError("Blob name must be provided to process the document")

        try:
            # Get the bucket and blob
            bucket = self.storage_client.bucket(self.input_bucket_name)
            blob = bucket.blob(blob_name)

            if not blob.exists():
                logger.error(f"Document blob not found: gs://{self.input_bucket_name}/{blob_name}")
                raise FileNotFoundError(f"Document blob not found: {blob_name}")

            logger.info(f"Processing document: gs://{self.input_bucket_name}/{blob_name}")

            # Download the document content
            document_content = blob.download_as_bytes()

            # Determine MIME type from blob metadata or filename extension
            mime_type = blob.content_type
            if not mime_type:
                if blob.name.lower().endswith('.pdf'):
                    mime_type = 'application/pdf'
                elif blob.name.lower().endswith('.docx'):
                    mime_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                elif blob.name.lower().endswith('.txt'):
                    mime_type = 'text/plain'
                else:
                    mime_type = 'application/octet-stream' # Fallback
                logger.info(f"Inferred MIME type as {mime_type} for blob {blob.name}")


            # Process with Document AI if available and applicable
            if self.docai_client and mime_type in ['application/pdf', 'image/tiff', 'image/gif']: # Add other supported types
                logger.info(f"Processing with Document AI (Processor: {self.processor_id})...")
                processed_doc_ai_document = self.process_document(document_content, mime_type)
                # Update document URI if missing
                if not processed_doc_ai_document.uri:
                    processed_doc_ai_document.uri = f"gs://{self.input_bucket_name}/{blob_name}"
                comments = self.extract_comments(processed_doc_ai_document)
                logger.info(f"Extracted {len(comments)} comments using Document AI.")
            elif mime_type == 'text/plain':
                 # Fallback for text-based documents if Document AI not used/configured
                logger.info("Processing plain text document using text extraction fallback.")
                text = document_content.decode('utf-8', errors='ignore') # Handle potential encoding errors
                # Create a dummy Document AI document object for text extraction function
                dummy_docai_doc = documentai.Document(text=text, uri=f"gs://{self.input_bucket_name}/{blob_name}")
                comments = self._extract_comments_from_text(dummy_docai_doc)
                logger.info(f"Extracted {len(comments)} comments using text fallback.")
            else:
                # For other non-processable types without Document AI
                logger.warning(f"Cannot process MIME type '{mime_type}' without a suitable Document AI processor or text fallback.")
                comments = []

            # Ensure document_id is set correctly on comments
            for comment in comments:
                comment.document_id = doc_id # Associate with the initial upload ID

            return comments

        except FileNotFoundError as e:
            # Reraise specifically to be caught by API layer
            raise e
        except Exception as e:
            logger.error(f"Error processing document gs://{self.input_bucket_name}/{blob_name} (ID: {doc_id}): {str(e)}")
            # Consider wrapping the exception for more context
            raise RuntimeError(f"Document processing failed for {doc_id}: {str(e)}")


    def _extract_comments_from_text_file(self, text: str, doc_id: str) -> List[Comment]:
        """
        (DEPRECATED - logic merged into _extract_comments_from_text)
        Extract comments from plain text file.

        Args:
            text: Document text content
            doc_id: Document ID

        Returns:
            List of extracted comments
        """
        # This logic is now handled by _extract_comments_from_text
        # and process_and_extract_comments creating a dummy Document object
        logger.warning("_extract_comments_from_text_file is deprecated.")
        dummy_docai_doc = documentai.Document(text=text, uri=f"text://{doc_id}")
        return self._extract_comments_from_text(dummy_docai_doc)


    def get_document_preview(self, doc_id: str) -> Dict[str, Any]:
        """
        Generate or retrieve a preview for a document. (Placeholder)

        Args:
            doc_id: Document ID

        Returns:
            Dictionary with preview information

        Raises:
            ValueError: If storage bucket is not configured
            FileNotFoundError: If document is not found (logic not implemented here)
            RuntimeError: If preview generation fails
        """
        if not self.input_bucket_name or not self.output_bucket_name:
            # Output bucket needed for storing previews
            raise ValueError("Input and Output storage buckets must be configured for previews")

        # Placeholder implementation for demo
        # In a real app, this would involve:
        # 1. Checking if preview exists in output bucket (e.g., previews/{doc_id}/preview.png)
        # 2. If not, downloading the original doc from input bucket
        # 3. Using a library (like Pillow, PyMuPDF for PDFs) to render the first page as an image
        # 4. Uploading the preview image to the output bucket
        # 5. Returning the GCS URI of the preview image

        logger.info(f"Preview requested for document {doc_id}. Returning placeholder.")
        preview_blob_name = f"previews/{doc_id}/preview.png" # Example path
        output_bucket = self.storage_client.bucket(self.output_bucket_name)
        preview_blob = output_bucket.blob(preview_blob_name)

        # Simulate checking if preview exists (replace with actual check)
        preview_exists = False # Assume false for demo

        if preview_exists:
             preview_url = f"gs://{self.output_bucket_name}/{preview_blob_name}"
             status = "available"
             message = "Preview retrieved from cache."
        else:
             preview_url = "" # No URL if not generated
             status = "not_implemented"
             message = "Document preview generation not implemented in demo."

        return {
            "document_id": doc_id,
            "preview_url": preview_url,
            "status": status,
            "message": message
        }

