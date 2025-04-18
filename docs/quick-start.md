# EIS Analysis Demo - Quick Start Guide

This guide will help you get started with the EIS Analysis Demo for analyzing Environmental Impact Statement (EIS) documents.

## Prerequisites

- Google Cloud Platform account with billing enabled
- `gcloud` CLI installed and configured
- Git
- Docker (for local development)

## Setup Instructions

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/YOUR-USERNAME/eis-analysis-demo.git
cd eis-analysis-demo
```

### 2. Set Up GCP Environment

Run the GCP setup script to create all necessary cloud resources:

```bash
chmod +x scripts/setup_gcp.sh
./scripts/setup_gcp.sh
```

This script will:
- Enable required APIs
- Create storage buckets
- Set up service accounts with appropriate permissions
- Create a template `.env` file

### 3. Create a Document AI Processor

Follow the [Document AI Processor Setup Guide](docai-guide.md) to create a processor for document analysis.

After creating the processor, update the `.env` file with your processor ID:

```
DOCUMENT_PROCESSOR_ID=your-processor-id-here
```

### 4. Deploy the Application

Run the deployment script to build and deploy the application:

```bash
chmod +x scripts/deploy_app.sh
./scripts/deploy_app.sh
```

This script will:
- Build Docker images for frontend and backend
- Push images to Artifact Registry
- Deploy services to Cloud Run
- Set up Cloud Workflow for orchestration

### 5. Verify the Deployment

Verify that everything is correctly deployed:

```bash
chmod +x scripts/verify_deployment.sh
./scripts/verify_deployment.sh
```

## Using the Application

Once deployed, you can access the application at the frontend URL provided by the deployment script.

### Analyzing an EIS Document

1. **Log in to the Application**
   - Open the frontend URL in your browser

2. **Select or Upload a Document**
   - Choose from available sample documents or upload your own EIS document

3. **Configure Analysis**
   - Set any analysis parameters (if applicable)

4. **View Results**
   - After processing, explore the analysis results:
     - Comment categories
     - Sentiment analysis
     - Key concerns
     - Detailed comment listings

## Local Development

For local development:

1. **Set up environment variables**
   - Copy `.env.example` to `.env` if you haven't already
   - Update the values as needed for your local environment

2. **Start the backend**
   - Navigate to the backend directory: `cd backend`
   - Create a virtual environment: `python -m venv venv`
   - Activate the virtual environment:
     - Windows: `venv\Scripts\activate`
     - macOS/Linux: `source venv/bin/activate`
   - Install dependencies: `pip install -r requirements.txt`
   - Start the server: `uvicorn main:app --reload`

3. **Start the frontend**
   - Navigate to the frontend directory: `cd frontend`
   - Install dependencies: `npm install`
   - Start the development server: `npm run dev`
   - Access the frontend at: `http://localhost:3000`

## Troubleshooting

### Common Issues

1. **Document AI Processor not working**
   - Ensure the processor ID is correct in your `.env` file
   - Check that the service account has the Document AI Processor User role
   - Verify that the document format is supported (PDF, DOCX, etc.)

2. **Analysis workflow fails**
   - Check the workflow execution logs in the Google Cloud Console
   - Verify that all environment variables are correctly set
   - Ensure that the service account has all required permissions

3. **Frontend cannot connect to backend**
   - Check that the `VITE_API_URL` environment variable is set correctly
   - Verify that CORS is enabled on the backend
   - Check network requests in the browser developer tools

### Getting Help

If you encounter issues not covered in this guide, please:
- Check the detailed documentation in the `docs` directory
- Open an issue in the GitHub repository
- Contact the project maintainers

## Next Steps

After getting familiar with the basic functionality, you can:
- Customize the analysis models by modifying the prompts in `backend/models/`
- Extend the frontend visualizations in `frontend/src/components/analysis/`
- Add more document types or analysis capabilities

Happy analyzing!