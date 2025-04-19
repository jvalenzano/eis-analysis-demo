import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import { ClassificationResult } from '../../services/aiClassificationService';

interface ClassificationResultsProps {
  results: ClassificationResult[];
  loading?: boolean;
  error?: string | null;
}

const ClassificationResults: React.FC<ClassificationResultsProps> = ({
  results,
  loading = false,
  error = null
}) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      case 'neutral':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Loading classification results...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (results.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No classification results available.
      </Alert>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Classification Results
      </Typography>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Comment ID</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Sentiment</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Key Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.commentId}>
                <TableCell>{result.commentId}</TableCell>
                <TableCell>{result.category}</TableCell>
                <TableCell>
                  <Chip
                    label={result.sentiment}
                    color={getSentimentColor(result.sentiment)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <LinearProgress
                    variant="determinate"
                    value={result.confidence * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {(result.confidence * 100).toFixed(1)}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {result.keyPoints.map((point, index) => (
                      <Chip
                        key={index}
                        label={point}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ClassificationResults; 