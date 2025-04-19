import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Breadcrumbs,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircleIcon from '@mui/icons-material/Circle';
import { mockDocuments } from '../services/__mocks__/mockData';

const DocumentViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const document = mockDocuments.find(doc => doc.id === id);

  if (!document) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" color="error">
            Document not found
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Navigation */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            variant="outlined"
          >
            Back to Documents
          </Button>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              Documents
            </Link>
            <Typography color="text.primary">{document.title}</Typography>
          </Breadcrumbs>
        </Box>

        <Paper sx={{ p: 4 }}>
          {/* Document Header */}
          <Typography variant="h4" gutterBottom>
            {document.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Date: {document.date}
          </Typography>
          <Typography variant="body1" paragraph>
            {document.description}
          </Typography>

          {/* Project Location Image */}
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <img 
              src="https://storage.googleapis.com/eis-demo-images/forest-aerial.jpg" 
              alt="Project Area Map"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Figure 1: Project area overview
            </Typography>
          </Box>
          
          {/* Executive Summary */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Executive Summary
          </Typography>
          <Typography variant="body1" paragraph>
            {document.content?.summary}
          </Typography>
          
          {/* Key Issues */}
          <Typography variant="h5" gutterBottom>
            Key Issues
          </Typography>
          <List>
            {document.content?.keyIssues.map((issue, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CircleIcon sx={{ fontSize: 8 }} />
                </ListItemIcon>
                <ListItemText primary={issue} />
              </ListItem>
            ))}
          </List>

          {/* Environmental Consequences Table */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Environmental Consequences
          </Typography>
          <Typography variant="body1" paragraph>
            The following table summarizes the anticipated environmental effects and proposed mitigation measures:
          </Typography>
          <TableContainer component={Paper} sx={{ my: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Resource</strong></TableCell>
                  <TableCell><strong>Beneficial Effects</strong></TableCell>
                  <TableCell><strong>Adverse Effects</strong></TableCell>
                  <TableCell><strong>Mitigation Measures</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {document.content?.impactTable.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.resource}</TableCell>
                    <TableCell>{row.beneficial}</TableCell>
                    <TableCell>{row.adverse}</TableCell>
                    <TableCell>{row.mitigation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Implementation Timeline */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Implementation Timeline
          </Typography>
          <Box sx={{ my: 3, p: 3, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body1" component="div">
              {document.content?.timeline.map((phase, index) => (
                <React.Fragment key={index}>
                  <strong>{phase.phase}:</strong> {phase.activity}
                  <br />
                </React.Fragment>
              ))}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default DocumentViewer; 