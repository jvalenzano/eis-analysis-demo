import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useWorkflow } from '../../hooks/useWorkflow';
import WorkflowStatus from './WorkflowStatus';

interface WorkflowManagerProps {
  documentId: string;
  onError: (message: string) => void;
}

const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  documentId,
  onError
}) => {
  const {
    workflow,
    loading,
    error,
    startWorkflow,
    getWorkflowStatus,
    cancelWorkflow,
    startPolling
  } = useWorkflow();

  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  const handleStartWorkflow = async () => {
    try {
      const newWorkflow = await startWorkflow(documentId);
      startPolling(newWorkflow.id);
    } catch (err) {
      console.error('Error starting workflow:', err);
    }
  };

  const handleCancelWorkflow = async (workflowId: string) => {
    try {
      await cancelWorkflow(workflowId);
    } catch (err) {
      console.error('Error canceling workflow:', err);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Workflow Orchestration
      </Typography>

      {workflow ? (
        <WorkflowStatus
          workflow={workflow}
          onCancel={workflow.status === 'running' ? handleCancelWorkflow : undefined}
        />
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Start a new workflow to analyze and classify this document
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
            onClick={handleStartWorkflow}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Starting...' : 'Start Workflow'}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default WorkflowManager; 