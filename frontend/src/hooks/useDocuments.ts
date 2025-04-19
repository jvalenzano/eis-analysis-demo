// frontend/src/hooks/useDocuments.ts
import { useState, useEffect, useCallback } from 'react';
import { Document } from '../types/document';
import documentService from '../services/documentService';

// Define the structure for the analysis job state
interface AnalysisJobState {
  jobId: string;
  status: string; // e.g., 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'
  estimatedTimeSeconds?: number; // Optional, from initial response
  message?: string; // Optional status message
}

// Mock data for development
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Forest Service EIS 2023',
    description: 'Environmental Impact Statement for Forest Service Project',
    date: '2023-01-15',
    url: '/documents/forest-service-eis-2023',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Wildlife Habitat Assessment',
    description: 'Assessment of wildlife habitat impacts',
    date: '2023-02-20',
    url: '/documents/wildlife-habitat-assessment',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Water Quality Analysis',
    description: 'Analysis of water quality impacts',
    date: '2023-03-10',
    url: '/documents/water-quality-analysis',
    status: 'pending'
  }
];

/**
 * Custom hook for managing document data, selection, and analysis state.
 */
export function useDocuments() {
  // State for the list of documents
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  // State for the currently selected document
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  // State to indicate if documents are currently being loaded
  const [loading, setLoading] = useState<boolean>(false);
  // State to store any errors during data fetching or analysis
  const [error, setError] = useState<string | null>(null);
  // State to indicate if analysis is currently being initiated or running
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  // State to store information about the current or last analysis job
  const [analysisJob, setAnalysisJob] = useState<AnalysisJobState | null>(null);


  /**
   * Loads the list of available documents using the documentService.
   * Uses useCallback to prevent unnecessary re-creation of the function.
   */
  const loadDocuments = useCallback(async () => {
    console.log('useDocuments: loadDocuments called');
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const fetchedDocuments = await documentService.getDocuments();
      console.log('useDocuments: Documents fetched:', fetchedDocuments);
      setDocuments(fetchedDocuments);
    } catch (err: any) {
      const errorMsg = 'Failed to load documents. Please try again later.';
      setError(errorMsg);
      console.error('Error in loadDocuments:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once


  /**
   * Sets the currently selected document.
   * Uses useCallback for consistency.
   */
  const selectDocument = useCallback((document: Document | null) => { // Allow null to deselect
    console.log('useDocuments: Selecting document:', document?.id ?? 'None');
    setSelectedDocument(document);
    setAnalysisJob(null); // Clear previous analysis job when selection changes
    setError(null); // Clear errors on new selection
  }, []);


  /**
   * Initiates the analysis of the currently selected document.
   * Uses useCallback and depends on selectedDocument state.
   */
  const analyzeSelectedDocument = useCallback(async () => {
    if (!selectedDocument) {
      console.warn('analyzeSelectedDocument called without a selected document.');
      return null; // Do nothing if no document is selected
    }

    console.log(`useDocuments: Initiating analysis for document: ${selectedDocument.id}`);
    setAnalyzing(true);
    setError(null); // Clear previous errors
    setAnalysisJob(null); // Clear previous job info

    try {
      // Call the service to start the analysis process
      const job = await documentService.analyzeDocument(selectedDocument.id);
      console.log('useDocuments: Analysis job initiated:', job);
      // Store the initial job info
      setAnalysisJob({
           jobId: job.jobId,
           status: job.status || 'QUEUED', // Use 'QUEUED' or similar as initial status
           estimatedTimeSeconds: job.estimatedTimeSeconds,
           message: `Analysis job ${job.jobId} started.`
      });
      return job; // Return job info to the caller component
    } catch (err: any) {
      const errorMsg = 'Failed to initiate document analysis. Please try again later.';
      setError(errorMsg);
      console.error('Error in analyzeSelectedDocument:', err);
      setAnalysisJob(null); // Clear job info on error
      return null; // Indicate failure
    } finally {
      setAnalyzing(false); // Analysis initiation attempt finished
    }
  }, [selectedDocument]); // Recalculate if selectedDocument changes


  // useEffect hook to load documents automatically when the hook is first used
  useEffect(() => {
    console.log('useDocuments: Initializing, loading documents...');
    loadDocuments();
  }, [loadDocuments]); // Run only when loadDocuments function reference changes (which is once due to useCallback)


  // Return all state values and functions needed by components
  return {
    documents,             // The list of documents
    selectedDocument,      // The currently selected document
    loading,               // Boolean indicating if documents are loading
    error,                 // String containing error message, or null
    analyzing,             // Boolean indicating if analysis is being initiated
    analysisJob,           // Object with info about the analysis job, or null
    selectDocument,        // Function to select a document
    analyzeSelectedDocument, // Function to trigger analysis
    refreshDocuments: loadDocuments // Function to manually reload documents
  };
}
