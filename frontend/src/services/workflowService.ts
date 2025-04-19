import axios from 'axios';

// Create API instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export interface WorkflowStep {
  id: string;
  type: 'analysis' | 'classification';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  result?: any;
}

export interface Workflow {
  id: string;
  documentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

// Store mock workflow state
let mockWorkflowState: Workflow | null = null;

const createMockWorkflow = (documentId: string): Workflow => ({
  id: `mock-workflow-${Math.random().toString(36).substr(2, 9)}`,
  documentId,
  status: 'running',
  steps: [
    {
      id: 'step-1',
      type: 'analysis',
      status: 'running',
      progress: 0,
    },
    {
      id: 'step-2',
      type: 'classification',
      status: 'pending',
      progress: 0,
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || true;

// Simulate workflow progress
const simulateWorkflowProgress = (workflow: Workflow) => {
  let currentStep = 0;
  const progressInterval = setInterval(() => {
    if (!mockWorkflowState || mockWorkflowState.status === 'completed' || mockWorkflowState.status === 'failed') {
      clearInterval(progressInterval);
      return;
    }

    const step = mockWorkflowState.steps[currentStep];
    if (step && step.status === 'running') {
      step.progress = Math.min((step.progress || 0) + 10, 100);
      
      if (step.progress >= 100) {
        step.status = 'completed';
        
        // Move to next step or complete workflow
        if (currentStep < mockWorkflowState.steps.length - 1) {
          currentStep++;
          mockWorkflowState.steps[currentStep].status = 'running';
        } else {
          mockWorkflowState.status = 'completed';
        }
      }
      
      mockWorkflowState.updatedAt = new Date().toISOString();
    }
  }, 2000); // Update every 2 seconds

  return workflow;
};

const workflowService = {
  /**
   * Start a new workflow for a document
   */
  async startWorkflow(documentId: string): Promise<Workflow> {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for startWorkflow');
      return new Promise((resolve) => {
        setTimeout(() => {
          mockWorkflowState = createMockWorkflow(documentId);
          simulateWorkflowProgress(mockWorkflowState);
          resolve(mockWorkflowState);
        }, 500);
      });
    }

    try {
      const response = await api.post<Workflow>('/workflows', { documentId });
      return response.data;
    } catch (error) {
      console.error('Error starting workflow:', error);
      throw new Error('Failed to start workflow');
    }
  },

  /**
   * Get the status of a workflow
   */
  async getWorkflowStatus(workflowId: string): Promise<Workflow> {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for getWorkflowStatus');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockWorkflowState || createMockWorkflow(workflowId));
        }, 500);
      });
    }

    try {
      const response = await api.get<Workflow>(`/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting workflow status:', error);
      throw new Error('Failed to get workflow status');
    }
  },

  /**
   * Get all workflows for a document
   */
  async getDocumentWorkflows(documentId: string): Promise<Workflow[]> {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for getDocumentWorkflows');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockWorkflowState ? [mockWorkflowState] : []);
        }, 500);
      });
    }

    try {
      const response = await api.get<Workflow[]>(`/documents/${documentId}/workflows`);
      return response.data;
    } catch (error) {
      console.error('Error getting document workflows:', error);
      throw new Error('Failed to get document workflows');
    }
  },

  /**
   * Cancel a running workflow
   */
  async cancelWorkflow(workflowId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for cancelWorkflow');
      return new Promise((resolve) => {
        setTimeout(() => {
          if (mockWorkflowState) {
            mockWorkflowState.status = 'failed';
            mockWorkflowState.steps = mockWorkflowState.steps.map(step => ({
              ...step,
              status: step.status === 'running' ? 'failed' : step.status
            }));
          }
          resolve();
        }, 500);
      });
    }

    try {
      await api.post(`/workflows/${workflowId}/cancel`);
    } catch (error) {
      console.error('Error canceling workflow:', error);
      throw new Error('Failed to cancel workflow');
    }
  }
};

export default workflowService; 