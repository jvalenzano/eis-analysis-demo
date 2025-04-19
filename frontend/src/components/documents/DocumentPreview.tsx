// frontend/src/components/documents/DocumentPreview.tsx
import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Document } from '../../types/document';

interface DocumentPreviewProps {
  document: Document;
  onClose: () => void;
  onError: (message: string) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose, onError }) => {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Document Preview</Typography>
        <Button onClick={onClose}>Close</Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {document.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {document.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Date: {document.date}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          href={document.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Full Document
        </Button>
      </Box>
    </Paper>
  );
};

export default DocumentPreview;
