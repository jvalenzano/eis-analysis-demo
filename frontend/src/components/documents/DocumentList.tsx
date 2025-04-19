// frontend/src/components/documents/DocumentList.tsx
import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemButton, CircularProgress } from '@mui/material';
import { Document } from '../../types/document';

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

  if (documents.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No documents available</Typography>
      </Box>
    );
  }

  return (
    <List>
      {documents.map((document) => (
        <ListItem
          key={document.id}
          disablePadding
          secondaryAction={
            <ListItemButton onClick={() => onPreviewDocument(document)}>
              Preview
            </ListItemButton>
          }
        >
          <ListItemButton
            selected={selectedDocument?.id === document.id}
            onClick={() => onSelectDocument(document)}
          >
            <ListItemText
              primary={document.title}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    {document.description}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2" color="text.secondary">
                    {document.date}
                  </Typography>
                </>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default DocumentList;
