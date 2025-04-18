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
