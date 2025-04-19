// frontend/src/components/MainContent.tsx
import React from 'react';
import { useState } from 'react';
import {
   Container,
   Paper,
   Typography,
   Box,
  Stepper, // Import Stepper components
  Step,
  StepLabel,
  Button
} from '@mui/material';
import DocumentSelector from './documents/DocumentSelector'; // Import the DocumentSelector

// Define props expected by this component
interface MainContentProps {
  onError: (message: string) => void; // Make onError required since we use it
}

/**
 * Main content component for the EIS Analysis Demo.
 * Handles the primary user interface structure, including a workflow stepper
 * and rendering the appropriate component for each step (like DocumentSelector).
 * Propagates error handling function down to children.
 */
const MainContent: React.FC<MainContentProps> = ({ onError }) => { // Receive onError prop
  // State to track the current active step in the analysis workflow
  const [activeStep, setActiveStep] = useState(0);
  // State to store the ID of the analysis job once started
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null);

  // Define the steps for the workflow
  const steps = ['Select Document', 'Configure Analysis', 'Review Results'];

  // Function to move to the next step
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Function to move to the previous step
  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(0, prevStep - 1)); // Prevent going below step 0
    // Optionally clear job ID when going back from configure step?
    if (activeStep === 1) {
         setAnalysisJobId(null);
    }
  };

  // Callback function passed to DocumentSelector
  // This is triggered when the analysis job is successfully initiated
  const handleAnalysisStarted = (jobId: string) => {
    console.log(`MainContent: Analysis started with Job ID: ${jobId}`);
    setAnalysisJobId(jobId); // Store the job ID
    handleNext(); // Move to the next step (Configure Analysis)
  };

  // Function to propagate errors up (e.g., to an App-level Snackbar)
  // This function itself might not be directly called here often,
  // but it's passed down to children who *will* call it.
  const handleError = (message: string) => {
    if (onError) {
      onError(message); // Call the handler passed down from App.tsx
    } else {
      // Fallback if no handler is provided (shouldn't happen if App passes it)
      console.error("MainContent Error (no handler):", message);
    }
  };

  return (
    // Use Container for max width and centering
    <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      {/* Use Paper for the main content area background and elevation */}
      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}> {/* Responsive padding */}
        {/* Main page title */}
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Environmental Impact Statement Analysis
        </Typography>
        {/* Introductory text */}
        <Typography variant="body1" paragraph color="text.secondary" align="center">
          Analyze public comments on Environmental Impact Statements using AI-powered tools.
        </Typography>

        {/* Stepper for workflow visualization */}
        <Box sx={{ width: '100%', my: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content area - Render component based on activeStep */}
        <Box sx={{ mt: 4 }}>
          {/* Step 0: Document Selection */}
          {activeStep === 0 && (
            // Pass the handleError function down to DocumentSelector
            <DocumentSelector
               onAnalysisStarted={handleAnalysisStarted}
               onError={handleError} // Pass down the error handler
            />
          )}

          {/* Step 1: Configure Analysis (Placeholder) */}
          {activeStep === 1 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Configure Analysis Parameters (Placeholder)
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Analysis has been initiated for Job ID: {analysisJobId || 'N/A'}.
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                (Future implementation could allow selecting specific AI models or analysis types here.)
              </Typography>
              {/* Button to proceed to results (for demo) */}
              <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
                Proceed to Results (Simulated)
              </Button>
            </Box>
          )}

          {/* Step 2: Review Results (Placeholder) */}
          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Review Analysis Results (Placeholder)
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Analysis results for Job ID: {analysisJobId || 'N/A'} would be displayed here.
              </Typography>
               {/* Components for charts, summaries, etc., would go here */}
            </Box>
          )}
        </Box>

        {/* Navigation Buttons (Back/Next) */}
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4, mt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            color="inherit"
            disabled={activeStep === 0} // Disable Back on first step
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} /> {/* Spacer */}

          {/* Hide Next button on the last step or if conditions aren't met */}
          {/* Currently, Next is shown on Configure step */}
          {activeStep === 1 && (
            <Button variant="contained" onClick={handleNext}>
               Proceed to Results (Simulated)
            </Button>
          )}
           {/* Consider adding a 'Reset' button maybe? */}

        </Box>
      </Paper>
    </Container>
  );
};

export default MainContent;
