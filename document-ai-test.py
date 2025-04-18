#!/usr/bin/env python3
"""
Document AI Integration Test Script

This script validates the Document AI processor configuration and tests its
ability to extract text and structured data from sample documents.

Usage:
  python test_document_ai.py [--sample-pdf-path FILEPATH]

Arguments:
  --sample-pdf-path FILEPATH  Path to a sample PDF to process (optional)
"""

import argparse
import os
import sys
import tempfile
from google.cloud import documentai_v1 as documentai
from google.cloud import storage
from google.api_core.client_options import ClientOptions
import dotenv
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_sample_text_document():
    """Create a simple text document for testing."""
    content = """
Environmental Impact Statement - Sample Document
    
Section 1: Purpose and Need
This document evaluates the environmental impacts of the proposed project.
    
Section 2: Public Comments
    
Comment 1:
I am concerned about the potential impact on river water quality. 
The EIS doesn't adequately address runoff issues from the construction site.
    
Comment 2:
The wildlife corridor analysis seems incomplete. There is no mention of 
seasonal migration patterns for local deer populations.
    
Comment 3:
As a recreational user of the area, I support the proposed trail improvements 
but would like to see more consideration for equestrian access.
"""
    
    fd, path = tempfile.mkstemp(suffix=".txt")
    with os.fdopen(fd, 'w') as f:
        f.write(content)
    
    return path

def load_environment():
    """Load environment variables from .env file."""
    dotenv.load_dotenv()
    
    required_vars = [
        "PROJECT_ID",
        "DOCUMENT_PROCESSOR_ID",
        "DOCUMENT_PROCESSOR_LOCATION",
        "INPUT_BUCKET",
        "OUTPUT_BUCKET"
    ]
    
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        logger.error("Please check your .env file or environment.")
        sys.exit(1)
    
    return {
        "project_id": os.environ.get("PROJECT_ID"),
        "processor_id": os.environ.get("DOCUMENT_PROCESSOR_ID"),
        "location": os.environ.get("DOCUMENT_PROCESSOR_LOCATION"),
        "input_bucket": os.environ.get("INPUT_BUCKET"),
        "output_bucket": os.environ.get("OUTPUT_BUCKET")
    }

def validate_document_ai_processor(config):
    """Validate Document AI processor configuration."""
    logger.info("Validating Document AI processor...")
    
    try:
        # Initialize Document AI client
        client_options = ClientOptions(
            api_endpoint=f"{config['location']}-documentai.googleapis.com"
        )
        client = documentai.DocumentProcessorServiceClient(client_options=client_options)
        
        # Get processor name
        processor_name = client.processor_path(
            config['project_id'], 
            config['location'], 
            config['processor_id']
        )
        
        # Check if processor exists
        processor = client.get_processor(name=processor_name)
        
        logger.info(f"✅ Processor validation successful!")
        logger.info(f"   - Processor name: {processor.name}")
        logger.info(f"   - Processor type: {processor.type_}")
        logger.info(f"   - Create time: {processor.create_time}")
        
        return client, processor_name
    
    except Exception as e:
        logger.error(f"❌ Processor validation failed: {str(e)}")
        sys.exit(1)

def validate_storage_buckets(config):
    """Validate access to Cloud Storage buckets."""
    logger.info("Validating Cloud Storage buckets...")
    
    try:
        # Initialize Storage client
        storage_client = storage.Client(project=config['project_id'])
        
        # Check input bucket
        input_bucket = storage_client.bucket(config['input_bucket'])
        exists = storage_client.lookup_bucket(config['input_bucket'])
        
        if not exists:
            logger.error(f"❌ Input bucket {config['input_bucket']} does not exist.")
            sys.exit(1)
        
        # Check output bucket
        output_bucket = storage_client.bucket(config['output_bucket'])
        exists = storage_client.lookup_bucket(config['output_bucket'])
        
        if not exists:
            logger.error(f"❌ Output bucket {config['output_bucket']} does not exist.")
            sys.exit(1)
        
        logger.info(f"✅ Storage buckets validation successful!")
        return storage_client
    
    except Exception as e:
        logger.error(f"❌ Storage buckets validation failed: {str(e)}")
        sys.exit(1)

def process_document(client, processor_name, document_path):
    """Process a document with Document AI."""
    logger.info(f"Processing document: {document_path}")
    
    try:
        # Read file content
        with open(document_path, "rb") as file:
            content = file.read()
        
        # Determine MIME type
        if document_path.lower().endswith('.pdf'):
            mime_type = 'application/pdf'
        elif document_path.lower().endswith('.txt'):
            mime_type = 'text/plain'
        else:
            mime_type = 'application/octet-stream'
        
        # Configure Document AI request
        raw_document = documentai.RawDocument(
            content=content,
            mime_type=mime_type
        )
        
        request = documentai.ProcessRequest(
            name=processor_name,
            raw_document=raw_document
        )
        
        # Process the document
        logger.info("Sending document to Document AI...")
        result = client.process_document(request=request)
        document = result.document
        
        # Extract and print text
        logger.info("Document processing successful!")
        logger.info(f"Document text: {document.text[:500]}...")
        
        # Print document entities if present
        if hasattr(document, 'entities') and document.entities:
            logger.info(f"Extracted {len(document.entities)} entities:")
            for entity in document.entities:
                logger.info(f"  - Type: {entity.type_}")
                # Get entity text
                entity_text = ""
                for segment in entity.text_anchor.text_segments:
                    start = segment.start_index
                    end = segment.end_index
                    entity_text += document.text[start:end]
                logger.info(f"    Text: {entity_text[:100]}...")
        
        return document
    
    except Exception as e:
        logger.error(f"❌ Document processing failed: {str(e)}")
        return None

def upload_to_bucket(storage_client, config, file_path):
    """Upload a file to the input bucket."""
    try:
        bucket = storage_client.bucket(config['input_bucket'])
        blob_name = os.path.basename(file_path)
        blob = bucket.blob(f"test/{blob_name}")
        
        blob.upload_from_filename(file_path)
        
        logger.info(f"✅ File uploaded to gs://{config['input_bucket']}/test/{blob_name}")
        return f"gs://{config['input_bucket']}/test/{blob_name}"
    
    except Exception as e:
        logger.error(f"❌ File upload failed: {str(e)}")
        return None

def main():
    """Main function."""
    parser = argparse.ArgumentParser(description='Test Document AI Integration')
    parser.add_argument('--sample-pdf-path', help='Path to a sample PDF file')
    args = parser.parse_args()
    
    # Load environment variables
    config = load_environment()
    
    # Validate Document AI processor
    docai_client, processor_name = validate_document_ai_processor(config)
    
    # Validate storage buckets
    storage_client = validate_storage_buckets(config)
    
    # Process a document
    if args.sample_pdf_path and os.path.exists(args.sample_pdf_path):
        document_path = args.sample_pdf_path
        logger.info(f"Using provided sample document: {document_path}")
    else:
        document_path = create_sample_text_document()
        logger.info(f"Created sample text document: {document_path}")
    
    # Upload to GCS
    gcs_path = upload_to_bucket(storage_client, config, document_path)
    if gcs_path:
        logger.info(f"Document uploaded to: {gcs_path}")
    
    # Process with Document AI
    document = process_document(docai_client, processor_name, document_path)
    
    if document:
        logger.info("✅ Document AI integration test passed!")
    else:
        logger.error("❌ Document AI integration test failed!")
        sys.exit(1)
    
    # Clean up if we created a temp file
    if not args.sample_pdf_path:
        os.unlink(document_path)
        logger.info(f"Removed temporary document: {document_path}")

if __name__ == "__main__":
    main()