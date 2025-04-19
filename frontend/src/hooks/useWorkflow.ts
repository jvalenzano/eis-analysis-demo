import { useState, useCallback, useEffect } from 'react';
import workflowService, { Workflow, WorkflowStep } from '../services/workflowService';

export function useWorkflow() {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  const startWorkflow = useCallback(async (documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const newWorkflow = await workflowService.startWorkflow(documentId);
      setWorkflow(newWorkflow);
      return newWorkflow;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start workflow';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWorkflowStatus = useCallback(async (workflowId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedWorkflow = await workflowService.getWorkflowStatus(workflowId);
      setWorkflow(updatedWorkflow);
      return updatedWorkflow;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get workflow status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelWorkflow = useCallback(async (workflowId: string) => {
    setLoading(true);
    setError(null);
    try {
      await workflowService.cancelWorkflow(workflowId);
      const updatedWorkflow = await getWorkflowStatus(workflowId);
      setWorkflow(updatedWorkflow);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel workflow';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getWorkflowStatus]);

  const startPolling = useCallback((workflowId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = window.setInterval(async () => {
      const updatedWorkflow = await getWorkflowStatus(workflowId);
      if (updatedWorkflow.status === 'completed' || updatedWorkflow.status === 'failed') {
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 5000);

    setPollingInterval(interval);
  }, [getWorkflowStatus, pollingInterval]);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const getStepStatus = useCallback((stepType: WorkflowStep['type']) => {
    if (!workflow) return 'pending';
    const step = workflow.steps.find(s => s.type === stepType);
    return step?.status || 'pending';
  }, [workflow]);

  const getStepProgress = useCallback((stepType: WorkflowStep['type']) => {
    if (!workflow) return 0;
    const step = workflow.steps.find(s => s.type === stepType);
    return step?.progress || 0;
  }, [workflow]);

  return {
    workflow,
    loading,
    error,
    startWorkflow,
    getWorkflowStatus,
    cancelWorkflow,
    startPolling,
    getStepStatus,
    getStepProgress
  };
} 