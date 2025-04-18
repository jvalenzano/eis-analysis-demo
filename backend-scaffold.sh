#!/bin/bash
# Script to create minimal backend structure for EIS Analysis Demo

# Create required directories if they don't exist
mkdir -p backend/api
mkdir -p backend/models
mkdir -p backend/schemas
mkdir -p backend/config

# Create main.py
cat << 'EOF' > backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="EIS Analysis API",
    description="API for Environmental Impact Statement analysis with Document AI and Vertex AI",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint to check API health."""
    return {
        "status": "online",
        "message": "EIS Analysis API is running",
        "version": "0.1.0"
    }

# Health check endpoint for Cloud Run
@app.get("/_ah/health")
async def health_check():
    """Health check endpoint for Cloud Run."""
    return {"status": "healthy"}

# Run application
if __name__ == "__main__":
    import uvicorn
    
    # Get host and port from environment or use defaults
    host = os.environ.get("API_HOST", "0.0.0.0")
    port = int(os.environ.get("API_PORT", "8000"))
    
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.environ.get("DEBUG", "False").lower() == "true"
    )
EOF

# Create requirements.txt
cat << 'EOF' > backend/requirements.txt
fastapi==0.100.0
uvicorn==0.22.0
pydantic==2.0.3
python-dotenv==1.0.0
google-cloud-documentai==2.20.1
google-cloud-storage==2.10.0
google-cloud-aiplatform==1.36.0
python-multipart==0.0.6
gunicorn==20.1.0
EOF

# Create a basic settings module
cat << 'EOF' > backend/config/settings.py
import os
from typing import Dict, Any, Optional
from pydantic import BaseSettings

class Settings(BaseSettings):
    """
    Application configuration settings.
    
    This class manages all configuration parameters for the application,
    with values loaded from environment variables or defaults.
    """
    
    # Project settings
    PROJECT_ID: str = os.environ.get("PROJECT_ID", "")
    REGION: str = os.environ.get("REGION", "us-central1")
    
    # Storage settings
    INPUT_BUCKET: str = os.environ.get("INPUT_BUCKET", "")
    OUTPUT_BUCKET: str = os.environ.get("OUTPUT_BUCKET", "")
    
    # API settings
    API_HOST: str = os.environ.get("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.environ.get("API_PORT", "8000"))
    
    # Document AI settings
    DOCUMENT_PROCESSOR_ID: str = os.environ.get("DOCUMENT_PROCESSOR_ID", "")
    DOCUMENT_PROCESSOR_LOCATION: str = os.environ.get("DOCUMENT_PROCESSOR_LOCATION", "us")
    
    # Application settings
    DEBUG: bool = os.environ.get("DEBUG", "False").lower() == "true"
    
    class Config:
        env_file = ".env"

# Create global settings instance
settings = Settings()
EOF

# Create __init__.py files for proper imports
touch backend/__init__.py
touch backend/api/__init__.py
touch backend/models/__init__.py
touch backend/schemas/__init__.py
touch backend/config/__init__.py

# Create Dockerfile
cat << 'EOF' > backend/Dockerfile
# Use the official Python image from Google
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PORT=8080 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

# Create and set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Run the web service
CMD exec gunicorn --bind :$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker --threads 8 main:app
EOF

echo "Backend scaffold created successfully!"
