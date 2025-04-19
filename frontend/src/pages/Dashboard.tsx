import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import DocumentSelector from '../components/documents/DocumentSelector';

const Dashboard: React.FC = () => {
  const handleAnalysisStarted = (jobId: string) => {
    console.log('Analysis started with job ID:', jobId);
  };

  const handleError = (message: string) => {
    console.error('Error:', message);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Environmental Impact Statement Analysis
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Analyze public comments on Environmental Impact Statements using Google Cloud AI.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <DocumentSelector
            onAnalysisStarted={handleAnalysisStarted}
            onError={handleError}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 