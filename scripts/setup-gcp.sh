#!/bin/bash
# EIS Analysis Demo - GCP Environment Setup Script
# This script sets up all necessary GCP resources for the EIS Analysis Demo project

set -e  # Exit on any error

# Configuration
PROJECT_ID="forest-insights-457102"
REGION="us-central1"
INPUT_BUCKET="${PROJECT_ID}-input"
OUTPUT_BUCKET="${PROJECT_ID}-output"
SERVICE_ACCOUNT_NAME="eis-analysis-workflow"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Starting GCP setup for project: ${PROJECT_ID}"
echo "=================================================================================="

# Make sure gcloud is using the correct project
gcloud config set project ${PROJECT_ID}

echo "Step 1: Enabling required APIs..."
echo "------------------------------------------"
# Enable required APIs
gcloud services enable cloudbuild.googleapis.com \
    run.googleapis.com \
    storage.googleapis.com \
    documentai.googleapis.com \
    aiplatform.googleapis.com \
    workflows.googleapis.com \
    artifactregistry.googleapis.com

echo "Step 2: Creating storage buckets..."
echo "------------------------------------------"
# Create storage buckets if they don't exist
gsutil ls -b gs://${INPUT_BUCKET} > /dev/null 2>&1 || gsutil mb -l ${REGION} gs://${INPUT_BUCKET}
gsutil ls -b gs://${OUTPUT_BUCKET} > /dev/null 2>&1 || gsutil mb -l ${REGION} gs://${OUTPUT_BUCKET}

echo "Step 3: Creating service account..."
echo "------------------------------------------"
# Create service account if it doesn't exist
if ! gcloud iam service-accounts describe ${SERVICE_ACCOUNT_EMAIL} > /dev/null 2>&1; then
    gcloud iam service-accounts create ${SERVICE_ACCOUNT_NAME} \
        --display-name="EIS Analysis Workflow Service Account"
fi

echo "Step 4: Assigning IAM roles to service account..."
echo "------------------------------------------"
# Assign necessary roles to the service account
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/run.invoker"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/workflows.invoker"

echo "Step 5: Creating Document AI processor (setup only)..."
echo "------------------------------------------"
# Note: We'll just check if Document AI API is enabled and ready
gcloud services describe documentai.googleapis.com --format="value(state)" | grep -q ENABLED && \
    echo "Document AI API is enabled. You can create a processor in the console." || \
    echo "Document AI API is not fully enabled yet. Please check in the console."

echo "Step 6: Creating .env file template..."
echo "------------------------------------------"
# Create .env file template
cat << EOF > .env.example
# Google Cloud Project settings
PROJECT_ID=${PROJECT_ID}
REGION=${REGION}

# Storage settings
INPUT_BUCKET=${INPUT_BUCKET}
OUTPUT_BUCKET=${OUTPUT_BUCKET}

# Document AI settings
# To use Document AI, complete the following:
# 1. Enable Document AI API in your Google Cloud project (already done)
# 2. Create a processor and set its ID below
# 3. Grant appropriate IAM permissions (already done)
DOCUMENT_PROCESSOR_ID=
DOCUMENT_PROCESSOR_LOCATION=us-central1

# API settings
API_HOST=0.0.0.0
API_PORT=8000

# Application settings
DEBUG=True
EOF

# Copy example to actual .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file. Please update DOCUMENT_PROCESSOR_ID when you create a processor."
fi

echo "=================================================================================="
echo "GCP environment setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Create a Document AI processor in the Google Cloud Console"
echo "2. Update the DOCUMENT_PROCESSOR_ID in the .env file"
echo "3. Deploy the application using the deployment scripts"
echo ""
echo "Storage buckets created:"
echo "- Input bucket: gs://${INPUT_BUCKET}"
echo "- Output bucket: gs://${OUTPUT_BUCKET}"
echo ""
echo "Service account created:"
echo "- ${SERVICE_ACCOUNT_EMAIL}"
echo "=================================================================================="
