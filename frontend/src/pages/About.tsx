import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const About: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        About EIS Analysis
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Overview
        </Typography>
        <Typography paragraph>
          The Environmental Impact Statement (EIS) Analysis tool helps analyze public comments
          on Environmental Impact Statements using advanced AI technology from Google Cloud.
          This tool streamlines the process of understanding and categorizing public feedback
          on environmental assessments.
        </Typography>

        <Typography variant="h6" gutterBottom>
          Features
        </Typography>
        <Typography component="div">
          <ul>
            <li>Upload and manage EIS documents</li>
            <li>Automated document analysis using Google Cloud AI</li>
            <li>Smart classification of public comments</li>
            <li>Real-time progress monitoring</li>
            <li>Detailed analysis results and insights</li>
          </ul>
        </Typography>

        <Typography variant="h6" gutterBottom>
          Technology
        </Typography>
        <Typography paragraph>
          This application is built using modern web technologies including React,
          Material-UI, and Google Cloud AI services. It leverages advanced natural
          language processing to provide accurate and efficient analysis of
          environmental impact statements.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Contact
        </Typography>
        <Typography>
          For more information about this tool or to report issues, please contact
          the USDA Forest Service technology team.
        </Typography>
      </Paper>
    </Box>
  );
};

export default About; 