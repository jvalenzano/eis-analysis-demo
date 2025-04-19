import { useState, useCallback } from 'react';
import aiClassificationService, { ClassificationJob, ClassificationResult } from '../services/aiClassificationService';

export function useClassification() {
  const [classificationJob, setClassificationJob] = useState<ClassificationJob | null>(null);
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitForClassification = useCallback(async (documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const job = await aiClassificationService.submitForClassification(documentId);
      setClassificationJob(job);
      return job;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit for classification';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getClassificationStatus = useCallback(async (jobId: string) => {
    setLoading(true);
    setError(null);
    try {
      const job = await aiClassificationService.getClassificationStatus(jobId);
      setClassificationJob(job);
      if (job.status === 'completed' && job.results) {
        setResults(job.results);
      }
      return job;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get classification status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getResults = useCallback(async (documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const classificationResults = await aiClassificationService.getClassificationResults(documentId);
      setResults(classificationResults);
      return classificationResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get classification results';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    classificationJob,
    results,
    loading,
    error,
    submitForClassification,
    getClassificationStatus,
    getResults
  };
} 