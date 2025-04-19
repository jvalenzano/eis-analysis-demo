// frontend/src/components/documents/DocumentSelector.tsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import { Box, Typography, Button, Paper, Grid, Divider, Alert, AlertTitle, CircularProgress, Snackbar } from '@mui/material'; // Added Snackbar (though not used directly here)
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { Document } from '../../types/document'; // Import type
import { useDocuments } from '../../hooks/useDocuments'; // Import the custom hook
import DocumentList from './DocumentList'; // Import list component
import DocumentPreview from './DocumentPreview'; // Import preview component

// Define props expected by this component
interface DocumentSelectorProps {
  // Callback function to notify parent when analysis job starts
  onAnalysisStarted: (jobId: string) => void;
  // Optional callback to propagate errors for global handling (e.g., Snackbar)
  onError?: (message: string) => void; // Make optional for flexibility, though MainContent provides it
}

/**
 * Main component for document selection and analysis initiation.
 * Uses the useDocuments hook for state management and orchestrates
 * the DocumentList and DocumentPreview components.
 * Propagates errors using the onError callback.
 */
const DocumentSelector: React.FC<DocumentSelectorProps> = ({
   onAnalysisStarted,
   onError // Receive onError prop
  }) => {
  // Use the custom hook to get state and functions
  const {
    documents,
    selectedDocument,
    loading, // Loading state for the document list
    error,   // Error state from the hook (e.g., loading documents failed)
    analyzing, // Loading state for the analysis initiation call
    analysisJob, // Info about the submitted job
    selectDocument, // Function to select a document
    analyzeSelectedDocument // Function to trigger analysis
  } = useDocuments();

  // Local state to control whether the preview pane is visible
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Propagate error from the hook to the parent component if onError handler exists
  // This useEffect hook watches the 'error' state from useDocuments
  useEffect(() => {
    // If there's an error message from the hook and an onError handler was provided
    if (error && onError) {
       console.log("DocumentSelector: Propagating error up:", error);
      onError(error); // Call the parent's error handler (e.g., to show Snackbar)
    }
  }, [error, onError]); // Dependency array: rerun effect if error or onError changes

  // Handler when a document card is selected in the list
  const handleDocumentSelect = (document: Document) => {
    selectDocument(document); // Update selection state via the hook
    setShowPreview(false); // Hide preview when selecting from the list directly
  };

  // Handler when the preview button on a card is clicked
  const handlePreviewDocument = (document: Document) => {
    selectDocument(document); // Select the document first
    setShowPreview(true); // Then show the preview pane
  };

  // Handler for the main "Analyze Document" button
  const handleAnalyze = async () => {
    // Call the analysis function from the hook
    const job = await analyzeSelectedDocument();
    // If the job was successfully started (hook returns job info)
    if (job && job.jobId) {
      // Notify the parent component that analysis has started
      onAnalysisStarted(job.jobId);
    }
    // Note: Error handling for analyzeSelectedDocument is managed within the hook
    // and propagated via the 'error' state variable and the useEffect above.
  };

  return (
    // Use Paper for visual grouping
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 2 /* Softer corners */ }}> {/* Responsive padding */}
      {/* Section Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Select Document for Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose an Environmental Impact Statement document from the list below to analyze public comments.
        </Typography>
      </Box>

      {/* Display error from useDocuments hook locally IN ADDITION to global snackbar? */}
      {/* Decided against showing local Alert here as it's handled globally now via onError prop */}
      {/* {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )} */}


      {/* Display info about the submitted analysis job */}
      {analysisJob && (
        <Alert severity="info" sx={{ mb: 3 }} variant="outlined"> {/* Use outlined variant */}
          <AlertTitle>Analysis Queued</AlertTitle>
          Document analysis job ({analysisJob.jobId}) has been queued. Status: {analysisJob.status}.
           {/* We might add a link to track progress later */}
        </Alert>
      )}

      {/* Layout Grid: List on left/top, Preview on right/bottom */}
      <Grid container spacing={3}>
        {/* Document List takes full width or half if preview is shown */}
        <Grid item xs={12} md={showPreview && selectedDocument ? 7 : 12}> {/* Adjust grid size */}
          <DocumentList
            documents={documents}
            selectedDocument={selectedDocument}
            onSelectDocument={handleDocumentSelect}
            onPreviewDocument={handlePreviewDocument}
            loading={loading}
            // Pass down the error from the hook for list-specific display if needed
            // Currently DocumentList shows its own loading/error based on props passed.
            error={error}
          />
        </Grid>
        {/* Document Preview shown conditionally */}
        {showPreview && selectedDocument && (
          <Grid item xs={12} md={5}> {/* Adjust grid size */}
            <DocumentPreview
               document={selectedDocument}
               onClose={() => setShowPreview(false)} // Add close functionality
               onError={onError} // Pass global error handler down to preview
             />
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Action Button Area */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={analyzing ? <CircularProgress size={20} color="inherit" /> : <AnalyticsIcon />}
          // Disable button if no document is selected OR analysis is already in progress
          disabled={!selectedDocument || analyzing}
          onClick={handleAnalyze}
          size="large"
        >
          {/* Change button text while analysis is being initiated */}
          {analyzing ? 'Starting Analysis...' : 'Analyze Selected Document'}
        </Button>
      </Box>

    </Paper>
  );
};

export default DocumentSelector;
