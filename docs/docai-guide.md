# Document AI Processor Setup Guide

This guide will walk you through creating a Document AI processor for the EIS Analysis Demo.

## What is Document AI?

Document AI is a Google Cloud document understanding solution that takes unstructured data from documents and transforms it into structured data. For the EIS Analysis Demo, we use it to extract text and identify comments in EIS documents.

## Create a Document AI Processor

1. **Open the Google Cloud Console**
   - Go to [console.cloud.google.com](https://console.cloud.google.com/)
   - Make sure project `forest-insights-457102` is selected

2. **Navigate to Document AI**
   - In the search bar at the top, search for "Document AI"
   - Click on "Document AI" in the results

3. **Create a Processor**
   - Click "Create Processor"
   - In the "Category" section, select "Document preconfigured processors"
   - Choose "Form Parser" (this processor type works well for extracting structured comments from EIS documents)
   - Enter a processor name: `eis-document-processor`
   - Select region: `us-central1` (make sure this matches your .env file)
   - Click "Create"

4. **Get the Processor ID**
   - After creation, you'll be redirected to the processor details page
   - Look for "Processor ID" in the details
   - Copy this ID

5. **Update Your Environment Configuration**
   - Open the `.env` file in your project directory
   - Update the `DOCUMENT_PROCESSOR_ID=` line with your new processor ID
   - Also ensure `DOCUMENT_PROCESSOR_LOCATION=us-central1` matches the region you selected

## Test the Processor (Optional)

You can test your processor directly in the Google Cloud Console:

1. On your processor's page, click "Test Processor"
2. Upload a sample EIS document (PDF or DOCX format)
3. View the extracted content to confirm it's properly identifying text

## Integration with Backend

The `DocumentProcessor` class in the backend code will automatically use this processor when properly configured. It includes fallback mechanisms for text extraction if Document AI is not available, but using Document AI provides better accuracy, especially for PDF documents.

## Troubleshooting

- If you receive errors about permissions, ensure your service account has the Document AI Processor User role
- If documents are not processing correctly, try testing with the UI tool first to verify processor functionality
- For PDF documents, ensure they contain selectable text (not just images of text)
