# EIS Analysis Demo - Architecture Overview

## Introduction

The EIS Analysis Demo is an AI-powered application designed to help Forest Service personnel analyze public comments on Environmental Impact Statements (EIS). The system uses Google Cloud services to extract, classify, and analyze comments, providing insights through an intuitive user interface.

## System Architecture

![Architecture Diagram](https://i.imgur.com/UiJ0ZTa.png)

### Key Components

1. **Frontend Application**
   - React.js based web application with Material UI
   - Deployed on Cloud Run
   - Provides document selection, analysis configuration, and visualization

2. **Backend API**
   - FastAPI Python application
   - Deployed on Cloud Run
   - Provides RESTful endpoints for document management and analysis

3. **Document Processing**
   - Document AI for text extraction from PDF/DOCX files
   - Custom processing logic for identifying comments

4. **AI Analysis Pipeline**
   - Vertex AI for comment classification, sentiment analysis, and key concern extraction
   - Uses LLM models (e.g., text-bison@002) for natural language understanding

5. **Storage**
   - Cloud Storage buckets for document storage and analysis results
   - Input bucket: `forest-insights-457102-input`
   - Output bucket: `forest-insights-457102-output`

6. **Workflow Orchestration**
   - Cloud Workflows for coordinating the multi-step analysis process
   - Handles job management, status updates, and error handling

## Data Flow

1. **Document Upload & Selection**
   - User uploads or selects an EIS document via the frontend
   - Document is stored in Cloud Storage input bucket

2. **Comment Extraction**
   - Backend initiates a workflow for document processing
   - Document AI extracts text and identifies comment sections
   - Extracted comments are stored for analysis

3. **Comment Analysis**
   - Vertex AI models analyze each comment for:
     - Category classification (water quality, wildlife, recreation, etc.)
     - Sentiment analysis (positive, neutral, negative)
   - Models extract key concerns across all comments

4. **Results Visualization**
   - Analysis results are sent to the frontend
   - Frontend visualizes results through charts, tables, and summaries
   - Users can explore specific comments, categories, and concerns

## Security & Access Control

- Cloud Run services are publicly accessible but can be restricted if needed
- Service account with specific IAM roles controls access to GCP resources
- Environment variables manage configuration and sensitive settings

## Scaling Considerations

- Cloud Run automatically scales based on traffic
- Batch processing for large documents with many comments
- Vertex AI handles concurrent model inference requests

## Monitoring & Logging

- Cloud Logging captures application logs
- Cloud Monitoring tracks service health and performance
- Workflow execution history provides analysis job tracking

## Local Development vs. Production

- Local development uses mock data and optional Document AI integration
- Production deployment utilizes full GCP service integration
- Environment variables control feature enablement
