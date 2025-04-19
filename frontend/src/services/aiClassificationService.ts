import axios from 'axios';
import { useApi } from '../hooks/useApi';

export interface ClassificationResult {
  commentId: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keyPoints: string[];
}

export interface ClassificationJob {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  results?: ClassificationResult[];
  error?: string;
}

const aiClassificationService = {
  /**
   * Submit a document for AI classification
   */
  async submitForClassification(documentId: string): Promise<ClassificationJob> {
    const { api } = useApi();
    try {
      const response = await api.post<ClassificationJob>(`/documents/${documentId}/classify`);
      return response.data;
    } catch (error) {
      console.error('Error submitting document for classification:', error);
      throw new Error('Failed to submit document for classification');
    }
  },

  /**
   * Get the status of a classification job
   */
  async getClassificationStatus(jobId: string): Promise<ClassificationJob> {
    const { api } = useApi();
    try {
      const response = await api.get<ClassificationJob>(`/classification/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting classification status:', error);
      throw new Error('Failed to get classification status');
    }
  },

  /**
   * Get classification results for a document
   */
  async getClassificationResults(documentId: string): Promise<ClassificationResult[]> {
    const { api } = useApi();
    try {
      const response = await api.get<ClassificationResult[]>(`/documents/${documentId}/classification-results`);
      return response.data;
    } catch (error) {
      console.error('Error getting classification results:', error);
      throw new Error('Failed to get classification results');
    }
  }
};

export default aiClassificationService; 