#!/bin/bash
# Script to create minimal frontend structure for EIS Analysis Demo

# Create required directories
mkdir -p frontend/src/components
mkdir -p frontend/src/pages
mkdir -p frontend/src/services
mkdir -p frontend/public

# Create package.json
cat << 'EOF' > frontend/package.json
{
  "name": "eis-analysis-demo",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.11.16",
    "@mui/material": "^5.13.4",
    "axios": "^1.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.2",
    "recharts": "^2.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
EOF

# Create vite.config.js
cat << 'EOF' > frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
});
EOF

# Create index.html
cat << 'EOF' > frontend/index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EIS Analysis Demo</title>
    <meta name="description" content="Environmental Impact Statement Analysis using AI" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# Create favicon.svg
cat << 'EOF' > frontend/public/favicon.svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="4" fill="#4285F4"/>
  <path d="M6 12H18M12 6V18" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>
EOF

# Create main.jsx
cat << 'EOF' > frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
EOF

# Create App.jsx
cat << 'EOF' > frontend/src/App.jsx
import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Header from './components/Header';
import MainContent from './components/MainContent';

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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <MainContent />
      </Box>
    </ThemeProvider>
  );
}

export default App;
EOF

# Create index.css
cat << 'EOF' > frontend/src/index.css
:root {
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #1a1a1a;
  background-color: #fafafa;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}
EOF

# Create Header component
cat << 'EOF' > frontend/src/components/Header.jsx
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';

/**
 * Header component for the EIS Analysis Demo application.
 * Displays the application title and main navigation.
 */
const Header = () => {
  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar>
        <CloudIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          EIS Analysis Demo
        </Typography>
        <Box>
          <Button color="inherit">Dashboard</Button>
          <Button color="inherit">Analysis</Button>
          <Button color="inherit">About</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
EOF

# Create MainContent component
cat << 'EOF' > frontend/src/components/MainContent.jsx
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
EOF

# Create Dockerfile
cat << 'EOF' > frontend/Dockerfile
# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Create production build
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

# Create nginx.conf
cat << 'EOF' > frontend/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        # In production, this would be set to the Cloud Run service URL
        proxy_pass ${BACKEND_URL};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Create .env.development
cat << 'EOF' > frontend/.env.development
VITE_API_URL=http://localhost:8000
EOF

echo "Frontend scaffold created successfully!"
