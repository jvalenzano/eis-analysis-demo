// frontend/src/components/documents/DocumentCard.tsx
import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description'; // Default Icon
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // PDF Icon
import ArticleIcon from '@mui/icons-material/Article'; // Text/Other Icon
import { Document } from '../../types/document'; // Import the Document type

// Helper to format file size in a readable format
const formatFileSize = (bytes: number): string => {
  if (bytes < 0) return 'N/A'; // Handle potential invalid sizes
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; // Added TB
  // Handle potential log(0) or negative bytes
  const i = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(k)) : 0;
  // Ensure index i is within the bounds of the sizes array
  const capped_i = Math.min(i, sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, capped_i)).toFixed(2)) + ' ' + sizes[capped_i];
};

// Helper to get an appropriate icon based on document type or name
const getDocumentIcon = (docType?: string, docName?: string) => {
    const nameLower = docName?.toLowerCase() || '';
    const typeLower = docType?.toLowerCase() || '';

    if (typeLower.includes('pdf') || nameLower.endsWith('.pdf')) {
        return <PictureAsPdfIcon sx={{ fontSize: 40, mr: 2 }} color="error" />;
    }
    if (typeLower.includes('text') || typeLower.includes('comments') || nameLower.endsWith('.txt')) {
        return <ArticleIcon sx={{ fontSize: 40, mr: 2 }} color="action" />;
    }
    // Add more specific icons based on types if needed
    // if (typeLower.includes('draft')) return <SomeDraftIcon />;
    return <DescriptionIcon sx={{ fontSize: 40, mr: 2 }} color="primary" />; // Default
}


// Style for selected card using styled HOC
const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isSelected', // Prevent isSelected prop from reaching DOM
})<{ isSelected?: boolean }>(({ theme, isSelected }) => ({ // Use template literal for theme access
  height: '100%', // Ensure cards in a row have same height
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between', // Push actions to bottom
  transition: theme.transitions.create(['border', 'box-shadow'], { // Smooth transition
      duration: theme.transitions.duration.short,
  }),
  border: isSelected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`, // Use theme divider color
  boxShadow: isSelected ? theme.shadows[6] : theme.shadows[1], // Slightly more shadow when selected
  '&:hover': {
    boxShadow: isSelected ? theme.shadows[8] : theme.shadows[3], // Increase shadow on hover
    borderColor: isSelected ? theme.palette.primary.dark : theme.palette.grey[400], // Subtle border highlight on hover
  },
}));


interface DocumentCardProps {
  document: Document;
  isSelected: boolean;
  onSelect: (document: Document) => void;
  onPreview?: (document: Document) => void; // Make preview optional
}

/**
 * Component to display a document as a card with selection capability.
 */
const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  isSelected,
  onSelect,
  onPreview
}) => {
  // Basic check for valid date string before formatting
  const displayDate = document.date && !isNaN(Date.parse(document.date))
      ? new Date(document.date).toLocaleDateString()
      : 'N/A';

  return (
    // Use the styled Card component
    <StyledCard isSelected={isSelected}>
      <CardContent sx={{ flexGrow: 1 }}> {/* Allow content to grow */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {/* Use helper function for icon */}
           {getDocumentIcon(document.type, document.name)}
           {/* Use Typography that prevents overly long names from breaking layout */}
          <Typography variant="h6" component="div" title={document.name} noWrap>
            {document.name}
          </Typography>
        </Box>

        {document.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '3em' /* Reserve space */ }}>
             {/* Simple truncation example */}
            {document.description.length > 100 ? document.description.substring(0, 97) + '...' : document.description}
          </Typography>
        )}

        {/* Use Box for layout consistency */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Date:
          </Typography>
          <Typography variant="body2">
            {displayDate}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Size:
          </Typography>
          <Typography variant="body2">
            {formatFileSize(document.size)}
          </Typography>
        </Box>

        {document.type && (
          <Box sx={{ mt: 2 }}>
            {/* Make chip clickable maybe? For filtering? */}
            <Chip label={document.type} size="small" variant="outlined"/>
          </Box>
        )}
      </CardContent>

      {/* Keep actions separate */}
      <CardActions sx={{ pt: 0 }}> {/* Remove padding top if content grows */}
        <Button
           size="small"
           onClick={() => onSelect(document)} // Ensure it calls onSelect
           color={isSelected ? "primary" : "inherit"}
           variant={isSelected ? "contained" : "text"} // Use contained variant when selected
           sx={{ fontWeight: isSelected ? 'bold' : 'normal' }} // Make text bold when selected
        >
          {isSelected ? 'Selected' : 'Select'}
        </Button>
        {/* Only show preview button if onPreview handler is provided */}
        {onPreview && (
          <Button
             size="small"
             onClick={() => onPreview(document)} // Ensure it calls onPreview
             // Optionally disable if selected? Or keep enabled?
             // disabled={isSelected}
          >
            Preview
          </Button>
        )}
      </CardActions>
    </StyledCard>
  );
};

export default DocumentCard;
