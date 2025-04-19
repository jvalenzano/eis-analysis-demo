import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Alert,
  Chip
} from '@mui/material';
import { Workflow, WorkflowStep } from '../../services/workflowService';

interface WorkflowStatusProps {
  workflow: Workflow;
  onCancel?: (workflowId: string) => void;
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({ workflow, onCancel }) => {
  const getStepStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStepStatusLabel = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'running':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Workflow Status
        </Typography>
        <Chip
          label={workflow.status.toUpperCase()}
          color={getStepStatusColor(workflow.status)}
          size="small"
        />
      </Box>

      {workflow.status === 'failed' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Workflow failed. Please try again.
        </Alert>
      )}

      <Stepper orientation="vertical">
        {workflow.steps.map((step) => (
          <Step key={step.id} active={step.status !== 'pending'}>
            <StepLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>
                  {step.type === 'analysis' ? 'Document Analysis' : 'AI Classification'}
                </Typography>
                <Chip
                  label={getStepStatusLabel(step.status)}
                  color={getStepStatusColor(step.status)}
                  size="small"
                />
              </Box>
            </StepLabel>
            <StepContent>
              {step.status === 'running' && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={step.progress || 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {step.progress || 0}% complete
                  </Typography>
                </Box>
              )}
              {step.status === 'failed' && step.error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {step.error}
                </Alert>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {workflow.status === 'running' && onCancel && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onCancel(workflow.id)}
          >
            Cancel Workflow
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default WorkflowStatus; 