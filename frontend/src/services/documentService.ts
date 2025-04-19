// frontend/src/services/documentService.ts
import axios from 'axios';
import { Document, DocumentsResponse } from '../types/document';
// Import the mock data from the new file
import { mockDocuments, mockPreview, mockAnalysisJob } from './__mocks__/mockData';

// Base API URL - Reads from environment variable VITE_API_URL defined in .env files
// Defaults to backend dev server if variable is not set.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Flag to control using mock data - Reads from VITE_USE_MOCK_DATA
// Defaults to true for initial frontend development as per milestone doc
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || true;

console.log(`Document Service: API_BASE_URL=${API_BASE_URL}, USE_MOCK_DATA=${USE_MOCK_DATA}`); // Log config on load

interface AnalysisJobResponse {
  jobId: string;
  status: string;
  estimatedTimeSeconds?: number;
  message?: string;
}

interface DocumentPreviewResponse {
  previewUrl: string;
  status: 'available' | 'processing' | 'error';
  message?: string;
}

/**
 * Service for interacting with document-related API endpoints.
 * Can use mock data based on environment variable VITE_USE_MOCK_DATA.
 */
const documentService = {
  /**
   * Fetches the list of available documents from the API or returns mock data.
   */
  async getDocuments(): Promise<Document[]> {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for getDocuments');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockDocuments); // Use imported mock data
        }, 500); // Simulate network delay
      });
    }

    console.log(`Fetching documents from: ${API_BASE_URL}/documents`);
    try {
      const response = await axios.get<DocumentsResponse>(`${API_BASE_URL}/documents`);
      console.log('Received documents from API:', response.data);
      return response.data.documents || [];
    } catch (error) {
      console.error('Error fetching documents from API:', error);
      throw error;
    }
  },

  /**
   * Initiates document analysis on the backend or returns mock job info.
   */
  async analyzeDocument(documentId: string): Promise<AnalysisJobResponse> {
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for analyzeDocument (ID: ${documentId})`);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockAnalysisJob); // Use imported mock data
        }, 1200);
      });
    }

    console.log(`Sending analysis request for document ${documentId} to: ${API_BASE_URL}/documents/${documentId}/analyze`);
    try {
      const response = await axios.post<AnalysisJobResponse>(
        `${API_BASE_URL}/documents/${documentId}/analyze`
      );
      console.log('Analysis job initiated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error initiating document analysis:', error);
      throw error;
    }
  },

  /**
   * Fetches a document preview, if available, or returns mock preview.
   */
  async getDocumentPreview(documentId: string): Promise<DocumentPreviewResponse> {
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for getDocumentPreview (ID: ${documentId})`);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockPreview); // Use imported mock data
        }, 700);
      });
    }

    console.log(`Fetching preview for document ${documentId} from: ${API_BASE_URL}/documents/${documentId}/preview`);
    try {
      const response = await axios.get<DocumentPreviewResponse>(
        `${API_BASE_URL}/documents/${documentId}/preview`
      );
      console.log('Received preview info:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching document preview:', error);
      throw new Error('Failed to fetch document preview');
    }
  },

  /**
   * Uploads a new document
   */
  async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<Document>(
        `${API_BASE_URL}/documents/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  }
};

export default documentService;
