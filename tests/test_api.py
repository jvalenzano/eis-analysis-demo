# tests/test_api.py
import unittest
from fastapi.testclient import TestClient
import tempfile
import os
import sys
from unittest.mock import patch, MagicMock, ANY
import uuid # Import uuid
from datetime import datetime

# Add parent directory (root of project) to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


# Mock settings before importing main or other modules that use settings
mock_settings_dict = {
    'PROJECT_ID': 'test-api-project',
    'REGION': 'test-api-region',
    'INPUT_BUCKET': 'test-api-input-bucket',
    'OUTPUT_BUCKET': 'test-api-output-bucket',
    'API_HOST': 'test-host',
    'API_PORT': 8888,
    'DOCUMENT_PROCESSOR_ID': 'test-api-processor-id',
    'DOCUMENT_PROCESSOR_LOCATION': 'test-api-location',
    'DEBUG': False # Set debug to False for testing standard behavior
}

# Patch environment variables *before* importing the FastAPI app
# This ensures the app and its dependencies load with the mocked settings
with patch.dict(os.environ, mock_settings_dict, clear=True):
     # Mock the DocumentProcessor class *before* it's used by the API endpoints
     # Patch the factory function used for dependency injection
     with patch('backend.api.documents.get_document_processor') as mock_get_doc_processor_docs, \
          patch('backend.api.analysis.get_document_processor') as mock_get_doc_processor_analysis:

          # Import the FastAPI app instance *after* patching
          from backend.main import app

          # Configure mock processor instances returned by the factory functions
          mock_processor_instance = MagicMock()
          mock_get_doc_processor_docs.return_value = mock_processor_instance
          mock_get_doc_processor_analysis.return_value = mock_processor_instance


          class TestAPI(unittest.TestCase):
              """Tests for API endpoints using FastAPI TestClient."""

              client = TestClient(app) # Create a single TestClient instance

              def setUp(self):
                  """Reset mocks before each test."""
                  # Reset the mock instance's calls and return values if needed
                  mock_processor_instance.reset_mock()

                  # Reset in-memory stores if they exist and are imported
                  # Be cautious with direct imports of mutable state like this
                  try:
                       from backend.api import documents, analysis
                       documents.UPLOADED_DOCUMENTS_METADATA = {} # Clear uploaded docs
                       analysis.analysis_jobs = {} # Clear analysis jobs
                  except ImportError:
                       pass # Ignore if modules can't be imported directly


              def test_root_endpoint(self):
                  """Test the root endpoint '/'."""
                  response = self.client.get("/")
                  self.assertEqual(response.status_code, 200)
                  self.assertEqual(response.json().get("status"), "online")
                  self.assertIn("EIS Analysis API", response.json().get("message"))

              def test_health_check_endpoint(self):
                    """Test the health check endpoint '/_ah/health'."""
                    response = self.client.get("/_ah/health")
                    self.assertEqual(response.status_code, 200)
                    self.assertEqual(response.json(), {"status": "healthy"})

              def test_list_documents_initial(self):
                  """Test listing documents when none have been uploaded (only samples)."""
                  response = self.client.get("/api/documents")
                  self.assertEqual(response.status_code, 200)
                  data = response.json()
                  self.assertIn("documents", data)
                  self.assertIsInstance(data["documents"], list)
                  # Check if only sample documents are returned initially
                  self.assertTrue(len(data["documents"]) > 0) # Assuming samples exist
                  self.assertTrue(all("sample-" in doc["id"] for doc in data["documents"]))


              def test_get_sample_document_found(self):
                  """Test getting a specific sample document that exists."""
                  # Assuming 'sample-eis-1' is a valid sample ID from documents.py
                  doc_id = "sample-eis-1"
                  response = self.client.get(f"/api/documents/{doc_id}")
                  self.assertEqual(response.status_code, 200)
                  self.assertEqual(response.json()["id"], doc_id)

              def test_get_document_not_found(self):
                  """Test getting a document that does not exist."""
                  response = self.client.get("/api/documents/non-existent-id-123")
                  self.assertEqual(response.status_code, 404)
                  self.assertIn("not found", response.json()["detail"])


              def test_document_upload_success(self):
                  """Test successful document upload."""
                  # Configure the mock processor's upload_document method
                  mock_upload_info = {
                      "id": str(uuid.uuid4()),
                      "name": "test_upload.pdf",
                      "size": 15360, # Sample size
                      "mime_type": "application/pdf",
                      "blob_name": f"{uuid.uuid4()}/test_upload.pdf",
                      "bucket": "test-api-input-bucket",
                      "gcs_uri": f"gs://test-api-input-bucket/{uuid.uuid4()}/test_upload.pdf",
                      "status": "uploaded"
                  }
                  mock_processor_instance.upload_document.return_value = mock_upload_info

                  # Simulate file upload
                  file_content = b"%PDF-1.4 fake content..."
                  files = {'file': ('test_upload.pdf', io.BytesIO(file_content), 'application/pdf')}
                  form_data = {'title': 'Test Upload Title'} # Optional form data

                  response = self.client.post("/api/documents/upload", files=files, data=form_data)

                  # Verify response
                  self.assertEqual(response.status_code, 200)
                  json_response = response.json()
                  self.assertEqual(json_response["name"], mock_upload_info["name"]) # Should match mock
                  self.assertEqual(json_response["status"], "uploaded")
                  self.assertEqual(json_response["size"], mock_upload_info["size"]) # Check if size from mock is returned
                  self.assertIn("id", json_response)
                  self.assertIn("upload_time", json_response)


                  # Verify that the mock processor method was called correctly
                  mock_processor_instance.upload_document.assert_called_once()
                  # Check args passed to the mock method (ANY matches the file object)
                  call_args, call_kwargs = mock_processor_instance.upload_document.call_args
                  self.assertIsInstance(call_args[0], io.BytesIO) # Check file object type
                  self.assertEqual(call_args[1], form_data['title']) # Check title was used
                  self.assertEqual(call_args[2], 'application/pdf') # Check mime type


              def test_document_upload_failure_processor(self):
                  """Test document upload failure during processing."""
                  # Configure mock processor to raise an error
                  mock_processor_instance.upload_document.side_effect = RuntimeError("GCS upload failed")

                  file_content = b"content"
                  files = {'file': ('fail_upload.txt', io.BytesIO(file_content), 'text/plain')}

                  response = self.client.post("/api/documents/upload", files=files)

                  # Verify failure response
                  self.assertEqual(response.status_code, 500) # Internal Server Error
                  self.assertIn("GCS upload failed", response.json()["detail"])


              # --- Analysis Endpoint Tests ---

              def test_process_document_request_success(self):
                  """Test initiating async processing successfully."""
                  # First, simulate an upload to populate UPLOADED_DOCUMENTS_METADATA
                  # (Need to bypass actual upload using mocks)
                  doc_id = str(uuid.uuid4())
                  blob_name = f"{doc_id}/fake_doc.pdf"
                  from backend.api import documents # Import to access the dict
                  documents.UPLOADED_DOCUMENTS_METADATA[doc_id] = {"blob_name": blob_name, "id": doc_id}


                  request_body = {"documentId": doc_id}
                  response = self.client.post("/api/analysis/process", json=request_body)

                  self.assertEqual(response.status_code, 200)
                  json_response = response.json()
                  self.assertEqual(json_response["documentId"], doc_id)
                  self.assertEqual(json_response["status"], "QUEUED")
                  self.assertIn("jobId", json_response)
                  job_id = json_response["jobId"]

                  # Verify job status is stored (in memory for test)
                  from backend.api import analysis # Import to access the dict
                  self.assertIn(job_id, analysis.analysis_jobs)
                  self.assertEqual(analysis.analysis_jobs[job_id]["status"], "QUEUED")


              def test_process_document_request_no_doc_id(self):
                  """Test initiating processing without documentId."""
                  response = self.client.post("/api/analysis/process", json={})
                  self.assertEqual(response.status_code, 400) # Bad Request
                  self.assertIn("'documentId' is required", response.json()["detail"])

              def test_process_document_request_doc_not_found(self):
                    """Test initiating processing for a non-existent document ID."""
                    request_body = {"documentId": "non-existent-doc-id"}
                    response = self.client.post("/api/analysis/process", json=request_body)
                    self.assertEqual(response.status_code, 404)
                    self.assertIn("not found", response.json()["detail"])


              def test_get_job_status_not_found(self):
                    """Test getting status for a non-existent job."""
                    response = self.client.get("/api/analysis/jobs/non-existent-job-id")
                    self.assertEqual(response.status_code, 404)


              # Note: Testing the actual background task completion requires more advanced techniques
              # like mocking BackgroundTasks or running the task synchronously for the test.
              # These basic tests cover the API request/response cycle.

if __name__ == "__main__":
    unittest.main()

