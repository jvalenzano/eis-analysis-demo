import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme';
import DocumentViewer from './pages/DocumentViewer';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/*',
    element: <App />,
  },
  {
    path: '/viewer/:id',
    element: <DocumentViewer />,
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
); 