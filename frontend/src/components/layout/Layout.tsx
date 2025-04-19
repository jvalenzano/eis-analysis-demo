import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
} from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="home"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <CloudIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EIS Analysis Demo
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ 
              textTransform: 'none',
              fontWeight: isActive('/') ? 'bold' : 'normal',
              borderBottom: isActive('/') ? '2px solid white' : 'none'
            }}
          >
            DASHBOARD
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/analysis')}
            sx={{ 
              textTransform: 'none',
              fontWeight: isActive('/analysis') ? 'bold' : 'normal',
              borderBottom: isActive('/analysis') ? '2px solid white' : 'none'
            }}
          >
            ANALYSIS
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/about')}
            sx={{ 
              textTransform: 'none',
              fontWeight: isActive('/about') ? 'bold' : 'normal',
              borderBottom: isActive('/about') ? '2px solid white' : 'none'
            }}
          >
            ABOUT
          </Button>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            Environmental Impact Statement Analysis Demo (c) USDA Forest Service {new Date().getFullYear()}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Powered by Google Cloud AI
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 