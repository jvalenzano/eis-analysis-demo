import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useClassification } from '../../hooks/useClassification';
import ClassificationResults from './ClassificationResults';

interface ClassificationManagerProps {
  documentId: string;
  onError: (message: string) => void;
}

const ClassificationManager: React.FC<ClassificationManagerProps> = ({
  documentId,
  onError
}) => {
  const {
    classificationJob,
    results,
    loading,
    error,
    submitForClassification,
    getClassificationStatus
  } = useClassification();

  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    // Cleanup polling interval on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const startClassification = async () => {
    try {
      const job = await submitForClassification(documentId);
      if (job.status === 'queued' || job.status === 'processing') {
        // Start polling for status updates
        const interval = window.setInterval(async () => {
          const updatedJob = await getClassificationStatus(job.jobId);
          if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
            clearInterval(interval);
            setPollingInterval(null);
          }
        }, 5000); // Poll every 5 seconds
        setPollingInterval(interval);
      }
    } catch (err) {
      console.error('Error starting classification:', err);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        AI Classification
      </Typography>

      {classificationJob && (
        <Alert
          severity={
            classificationJob.status === 'completed'
              ? 'success'
              : classificationJob.status === 'failed'
              ? 'error'
              : 'info'
          }
          sx={{ mb: 2 }}
        >
          {classificationJob.status === 'completed'
            ? 'Classification completed successfully'
            : classificationJob.status === 'failed'
            ? `Classification failed: ${classificationJob.error}`
            : `Classification in progress: ${classificationJob.progress || 0}%`}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} /> : <PsychologyIcon />}
              onClick={startClassification}
              disabled={loading || (classificationJob?.status === 'processing')}
            >
              {loading
                ? 'Processing...'
                : classificationJob?.status === 'processing'
                ? 'Classification in Progress'
                : 'Start Classification'}
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <ClassificationResults
            results={results}
            loading={loading}
            error={error}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ClassificationManager; 