import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import documentService from '../../services/documentService';

interface DocumentUploadProps {
  onUploadSuccess: (document: any) => void;
  onError: (message: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess, onError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      setError('Please upload a PDF or document file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadedDocument = await documentService.uploadDocument(file);
      onUploadSuccess(uploadedDocument);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload New Document
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Select File'}
          <input
            type="file"
            hidden
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
        </Button>
        <Typography variant="body2" color="text.secondary">
          Supported formats: PDF, DOC, DOCX (Max 10MB)
        </Typography>
      </Box>
    </Paper>
  );
};

export default DocumentUpload; 