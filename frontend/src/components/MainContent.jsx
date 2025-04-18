import { Container, Paper, Typography, Box, Button, CircularProgress } from '@mui/material';
import { useState } from 'react';

/**
 * Main content component for the EIS Analysis Demo.
 * Provides a placeholder UI for the demo.
 */
const MainContent = () => {
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);

  const checkBackendStatus = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/`);
      const data = await response.json();
      setBackendStatus(data);
    } catch (error) {
      console.error('Error checking backend status:', error);
      setBackendStatus({ status: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Environmental Impact Statement Analysis
        </Typography>
        <Typography variant="body1" paragraph>
          Analyze public comments on Environmental Impact Statements using Google Cloud AI.
        </Typography>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={checkBackendStatus}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Check Backend Status'}
          </Button>
          
          {backendStatus && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Backend Status
              </Typography>
              <pre style={{ textAlign: 'left', overflow: 'auto' }}>
                {JSON.stringify(backendStatus, null, 2)}
              </pre>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default MainContent;
