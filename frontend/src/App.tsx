// frontend/src/App.tsx (or App.jsx) - Updated for Step 21
import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Snackbar, Alert } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
// Assuming Header exists or is created
import Header from './components/Header'
// Import the NEW Footer component
import Footer from './components/Footer'
import MainContent from './components/MainContent'

// Define notification type constants
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

// Define the structure for notification state
interface NotificationState {
  open: boolean;
  message: string;
  type: NotificationType;
}

// Define the Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4285F4', // Google Blue
    },
    secondary: {
      main: '#34A853', // Google Green
    },
    error: {
      main: '#EA4335', // Google Red
    },
    warning: {
      main: '#FBBC05', // Google Yellow
    },
  },
});

function App() {
  // State to manage the notification (Snackbar)
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'info'
 });

  // Function to trigger showing the notification snackbar
  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({
      open: true,
      message,
      type
   });
  };

  // Function to handle closing the snackbar
  const handleCloseNotification = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({
      ...notification,
      open: false
   });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Main layout using Flexbox column */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header /> {/* Render Header */}
        {/* Pass the showNotification function down as the onError prop */}
        <MainContent onError={(message) => showNotification(message, 'error')} />
        <Footer /> {/* <<< RENDER THE NEW FOOTER HERE */}

        {/* Snackbar component for displaying notifications */}
        <Snackbar
           open={notification.open}
           autoHideDuration={6000}
           onClose={handleCloseNotification}
           anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
             onClose={handleCloseNotification}
             severity={notification.type}
             variant="filled"
             sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  )
}

export default App
