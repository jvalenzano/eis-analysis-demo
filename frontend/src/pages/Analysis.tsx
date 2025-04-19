import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import WorkflowManager from '../components/workflow/WorkflowManager';

const Analysis: React.FC = () => {
  const handleError = (message: string) => {
    console.error('Error:', message);
  };

  // TODO: Get the selected document ID from global state
  const selectedDocumentId = '1'; // Temporary hardcoded value

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analysis Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Monitor and manage your document analysis workflows.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <WorkflowManager
            documentId={selectedDocumentId}
            onError={handleError}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analysis; 