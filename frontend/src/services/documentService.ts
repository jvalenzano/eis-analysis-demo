// frontend/src/services/documentService.ts
import axios from 'axios';
import { Document, DocumentsResponse } from '../types/document';
// Import the mock data from the new file
import { mockDocuments, mockPreview, mockAnalysisJob } from './__mocks__/mockData';

// Base API URL - Reads from environment variable VITE_API_URL defined in .env files
// Defaults to backend dev server if variable is not set.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Flag to control using mock data - Reads from VITE_USE_MOCK_DATA
// Defaults to true for initial frontend development as per milestone doc
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || true;

console.log(`Document Service: API_URL=${API_URL}, USE_MOCK_DATA=${USE_MOCK_DATA}`); // Log config on load

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

    console.log(`Fetching documents from: ${API_URL}/documents`);
    try {
      const response = await axios.get<DocumentsResponse>(`${API_URL}/documents`);
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
  async analyzeDocument(documentId: string): Promise<{ jobId: string; status: string; estimatedTimeSeconds: number }> {
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for analyzeDocument (ID: ${documentId})`);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockAnalysisJob); // Use imported mock data
        }, 1200);
      });
    }

    console.log(`Sending analysis request for document ${documentId} to: ${API_URL}/analysis/process`);
    try {
      const response = await axios.post(`${API_URL}/analysis/process`, { documentId });
      console.log('Analysis job initiated:', response.data);
      if (response.data && response.data.jobId) {
          return response.data;
      } else {
          throw new Error("Invalid response format from analysis endpoint");
      }
    } catch (error) {
      console.error('Error initiating document analysis:', error);
      throw error;
    }
  },

  /**
   * Fetches a document preview, if available, or returns mock preview.
   */
   async getDocumentPreview(documentId: string): Promise<{ preview_url: string; status: string; message?: string }> {
    if (USE_MOCK_DATA) {
      console.log(`Using mock data for getDocumentPreview (ID: ${documentId})`);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockPreview); // Use imported mock data
        }, 700);
      });
    }

    console.log(`Fetching preview for document ${documentId} from: ${API_URL}/documents/${documentId}/preview`);
    try {
      const response = await axios.get(`${API_URL}/documents/${documentId}/preview`);
      console.log('Received preview info:', response.data);
      return {
          preview_url: response.data?.preview_url || '',
          status: response.data?.status || 'error',
          message: response.data?.message
      };
    } catch (error) {
      console.error('Error fetching document preview:', error);
       return { preview_url: '', status: 'error', message: 'Preview fetch failed.' };
    }
  }
};

export default documentService;
