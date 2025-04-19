// frontend/src/App.tsx (or App.jsx) - Updated for Step 21
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from './theme';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import About from './pages/About';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
