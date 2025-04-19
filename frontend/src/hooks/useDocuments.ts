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

/**
 * Custom hook for managing document data, selection, and analysis state.
 */
export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
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
  const selectDocument = useCallback((documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (document) {
      setSelectedDocument(document);
    }
  }, [documents]);

  /**
   * Initiates the analysis of the currently selected document.
   * Uses useCallback and depends on selectedDocument state.
   */
  const analyzeSelectedDocument = useCallback(async () => {
    if (!selectedDocument) return;

    try {
      setAnalyzing(true);
      setError(null);
      const result = await documentService.analyzeDocument(selectedDocument.id);
      setAnalysisJob(result);
      return result;
    } catch (err) {
      setError('Failed to analyze document');
      throw err;
    } finally {
      setAnalyzing(false);
    }
  }, [selectedDocument]);

  const refreshDocuments = useCallback(async () => {
    await loadDocuments();
  }, [loadDocuments]);

  // useEffect hook to load documents automatically when the hook is first used
  useEffect(() => {
    console.log('useDocuments: Initializing, loading documents...');
    loadDocuments();
  }, [loadDocuments]); // Run only when loadDocuments function reference changes (which is once due to useCallback)

  // Return all state values and functions needed by components
  return {
    documents,
    selectedDocument,
    loading,
    error,
    analyzing,
    analysisJob,
    selectDocument,
    analyzeSelectedDocument,
    refreshDocuments,
    setDocuments
  };
}
