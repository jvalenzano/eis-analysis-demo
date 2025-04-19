// frontend/src/components/documents/DocumentList.tsx
import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton,
  CircularProgress,
  TextField,
  InputAdornment,
  Button,
  styled,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Document } from '../../types/document';

// Create a styled ListItem for better layout control
const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0
  }
}));

// Create a styled content container
const ContentContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  padding: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

interface DocumentListProps {
  documents: Document[];
  selectedDocument: Document | null;
  onSelectDocument: (document: Document) => void;
  onPreviewDocument: (document: Document) => void;
  loading: boolean;
  error: string | null;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  selectedDocument,
  onSelectDocument,
  onPreviewDocument,
  loading,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = useMemo(() => {
    if (!searchTerm) return documents;
    
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return documents.filter(doc =>
      doc.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      doc.description.toLowerCase().includes(lowerCaseSearchTerm) ||
      doc.date.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [documents, searchTerm]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search documents..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {filteredDocuments.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography>
            {searchTerm ? 'No documents match your search.' : 'No documents available'}
          </Typography>
        </Box>
      ) : (
        <List>
          {filteredDocuments.map((document) => (
            <StyledListItem key={document.id}>
              <ContentContainer 
                elevation={selectedDocument?.id === document.id ? 2 : 0}
                sx={{ 
                  borderLeft: (theme) => 
                    selectedDocument?.id === document.id 
                      ? `4px solid ${theme.palette.primary.main}`
                      : '4px solid transparent'
                }}
              >
                <Box sx={{ flex: 1, pr: 2 }}>
                  <ListItemButton
                    onClick={() => onSelectDocument(document)}
                    sx={{ 
                      display: 'block',
                      p: 0
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {document.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {document.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {document.date}
                    </Typography>
                  </ListItemButton>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  alignSelf: 'stretch',
                  pl: 2,
                  borderLeft: (theme) => `1px solid ${theme.palette.divider}`
                }}>
                  <Button
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewDocument(document);
                    }}
                    sx={{ 
                      minWidth: 100,
                      height: 36
                    }}
                  >
                    Preview
                  </Button>
                </Box>
              </ContentContainer>
            </StyledListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default DocumentList;
