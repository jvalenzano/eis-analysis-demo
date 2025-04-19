// frontend/src/components/documents/__tests__/DocumentCard.test.tsx

// Import necessary testing utilities and the component
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest'; // Import testing functions from vitest
import DocumentCard from '../DocumentCard'; // Import the component to test
import { Document } from '../../../types/document'; // Import the type definition

// Mock ThemeProvider if needed by styled components within DocumentCard
// Depending on setup, direct rendering might work, or you might need:
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// const theme = createTheme(); // Default theme
// const renderWithTheme = (ui) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

// Use vi.fn() for mock functions in Vitest
const mockSelectFn = vi.fn();
const mockPreviewFn = vi.fn();

// Define mock document data consistent with the Document type
const mockDocument: Document = {
  id: 'test-doc-1',
  name: 'Test Document Alpha',
  date: '2023-05-15T00:00:00Z', // Use ISO format or ensure parsing works
  size: 1024000, // 1 MB
  description: 'This is a test document description for testing rendering.',
  type: 'Draft EIS',
  // Optional fields can be omitted or included
  // url: 'http://example.com/doc1',
  // thumbnailUrl: 'http://example.com/thumb1.png'
};


// Group tests for the DocumentCard component
describe('DocumentCard Component', () => {

  // Reset mocks before each test
  beforeEach(() => {
    mockSelectFn.mockClear();
    mockPreviewFn.mockClear();
  });

  it('renders document name, description, and type correctly', () => {
    render(
      <DocumentCard
         document={mockDocument}
        isSelected={false}
        onSelect={mockSelectFn}
        onPreview={mockPreviewFn} // Pass preview handler
      />
    );
    // Check if key text elements are present
    expect(screen.getByText(mockDocument.name)).toBeInTheDocument();
    expect(screen.getByText(mockDocument.description)).toBeInTheDocument();
    expect(screen.getByText(mockDocument.type!)).toBeInTheDocument(); // Use non-null assertion if type is guaranteed
    // Check for formatted size and date (adjust format as needed)
    expect(screen.getByText('1.00 MB')).toBeInTheDocument(); // Based on formatFileSize helper
    // Date format might vary based on locale, test carefully
    // Example: Assuming US locale MM/DD/YYYY
    expect(screen.getByText(new Date(mockDocument.date).toLocaleDateString())).toBeInTheDocument();
  });

  it('calls onSelect with the document when the "Select" button is clicked', () => {
    render(
      <DocumentCard
         document={mockDocument}
        isSelected={false} // Ensure the button text is 'Select'
        onSelect={mockSelectFn}
        onPreview={mockPreviewFn}
      />
    );
    // Find the button by its text and click it
    const selectButton = screen.getByRole('button', { name: /Select/i }); // Case-insensitive match for 'Select'
    fireEvent.click(selectButton);

    // Verify onSelect was called once with the correct document object
    expect(mockSelectFn).toHaveBeenCalledTimes(1);
    expect(mockSelectFn).toHaveBeenCalledWith(mockDocument);
    // Verify onPreview was NOT called
    expect(mockPreviewFn).not.toHaveBeenCalled();
  });

  it('calls onPreview with the document when the "Preview" button is clicked', () => {
    render(
      <DocumentCard
         document={mockDocument}
        isSelected={false}
        onSelect={mockSelectFn}
        onPreview={mockPreviewFn} // Ensure preview handler is provided
      />
    );
     // Find the button by its text and click it
     const previewButton = screen.getByRole('button', { name: /Preview/i }); // Match 'Preview'
     fireEvent.click(previewButton);

     // Verify onPreview was called once with the correct document object
     expect(mockPreviewFn).toHaveBeenCalledTimes(1);
     expect(mockPreviewFn).toHaveBeenCalledWith(mockDocument);
      // Verify onSelect was NOT called
     expect(mockSelectFn).not.toHaveBeenCalled();
  });

  it('does not render the "Preview" button if onPreview prop is not provided', () => {
      render(
        <DocumentCard
           document={mockDocument}
          isSelected={false}
          onSelect={mockSelectFn}
          // onPreview prop is omitted here
        />
      );
      // Query for the button, expect it not to be found
      const previewButton = screen.queryByRole('button', { name: /Preview/i });
      expect(previewButton).not.toBeInTheDocument();
  });


  it('shows "Selected" button text and applies selected styles when isSelected is true', () => {
    render(
      <DocumentCard
         document={mockDocument}
        isSelected={true} // Set isSelected to true
        onSelect={mockSelectFn}
        onPreview={mockPreviewFn}
      />
    );
    // Check button text
    const selectedButton = screen.getByRole('button', { name: /Selected/i }); // Match 'Selected'
    expect(selectedButton).toBeInTheDocument();

    // Check that the 'Select' button text is NOT present
    const selectButton = screen.queryByRole('button', { name: /^Select$/i }); // Exact match for 'Select'
    expect(selectButton).not.toBeInTheDocument();

    // Note: Testing specific styles applied via styled-components or sx prop
    // often requires snapshot testing or more complex DOM inspection/assertions,
    // which might be beyond a "simple" test. Checking button text confirms state.
  });

});
