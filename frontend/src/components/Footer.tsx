import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

/**
 * Footer component for the application.
 */
const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'Environmental Impact Statement Analysis Demo (c) '}
          <Link color="inherit" href="#">
            USDA Forest Service
          </Link>{' '}
          {new Date().getFullYear()}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Powered by Google Cloud AI
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 