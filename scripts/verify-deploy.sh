#!/bin/bash
# EIS Analysis Demo - Deployment Verification Script
# This script verifies that all components of the EIS Analysis Demo are deployed correctly

set -e  # Exit on any error

# Configuration
PROJECT_ID="forest-insights-457102"
REGION="us-central1"
BACKEND_SERVICE_NAME="eis-analysis-backend"
FRONTEND_SERVICE_NAME="eis-analysis-frontend"
WORKFLOW_NAME="eis-analysis-workflow"
INPUT_BUCKET="${PROJECT_ID}-input"
OUTPUT_BUCKET="${PROJECT_ID}-output"

echo "Verifying deployment for project: ${PROJECT_ID}"
echo "=================================================================================="

# Make sure gcloud is using the correct project
gcloud config set project ${PROJECT_ID}

echo "Step 1: Verifying storage buckets..."
echo "------------------------------------------"
# Check if buckets exist
if gsutil ls -b gs://${INPUT_BUCKET} > /dev/null 2>&1; then
    echo "✅ Input bucket exists: gs://${INPUT_BUCKET}"
else
    echo "❌ Input bucket does not exist: gs://${INPUT_BUCKET}"
fi

if gsutil ls -b gs://${OUTPUT_BUCKET} > /dev/null 2>&1; then
    echo "✅ Output bucket exists: gs://${OUTPUT_BUCKET}"
else
    echo "❌ Output bucket does not exist: gs://${OUTPUT_BUCKET}"
fi

echo "Step 2: Verifying Cloud Run services..."
echo "------------------------------------------"
# Check if backend service exists
if gcloud run services describe ${BACKEND_SERVICE_NAME} --region=${REGION} --platform=managed > /dev/null 2>&1; then
    BACKEND_URL=$(gcloud run services describe ${BACKEND_SERVICE_NAME} --region=${REGION} --platform=managed --format="value(status.url)")
    echo "✅ Backend service is deployed at: ${BACKEND_URL}"
    
    # Test backend API
    if curl -s ${BACKEND_URL} | grep -q "online"; then
        echo "✅ Backend API is responding correctly"
    else
        echo "❌ Backend API is not responding as expected"
    fi
else
    echo "❌ Backend service is not deployed"
fi

# Check if frontend service exists
if gcloud run services describe ${FRONTEND_SERVICE_NAME} --region=${REGION} --platform=managed > /dev/null 2>&1; then
    FRONTEND_URL=$(gcloud run services describe ${FRONTEND_SERVICE_NAME} --region=${REGION} --platform=managed --format="value(status.url)")
    echo "✅ Frontend service is deployed at: ${FRONTEND_URL}"
    
    # Test frontend
    if curl -s -I ${FRONTEND_URL} | grep -q "200 OK"; then
        echo "✅ Frontend is responding correctly"
    else
        echo "❌ Frontend is not responding as expected"
    fi
else
    echo "❌ Frontend service is not deployed"
fi

echo "Step 3: Verifying workflow..."
echo "------------------------------------------"
# Check if workflow exists
if gcloud workflows describe ${WORKFLOW_NAME} --location=${REGION} > /dev/null 2>&1; then
    echo "✅ Workflow is deployed"
    
    # Check if workflow variables are set
    VARIABLES=$(gcloud workflows variables list --workflow=${WORKFLOW_NAME} --location=${REGION} --format="table(name,value)")
    echo "Workflow variables:"
    echo "${VARIABLES}"
else
    echo "❌ Workflow is not deployed"
fi

echo "Step 4: Verifying Document AI processor..."
echo "------------------------------------------"
# List Document AI processors
PROCESSORS=$(gcloud documentai processors list --location=${REGION} --format="table(displayName,name,state)")
echo "Document AI processors:"
echo "${PROCESSORS}"

echo "Step 5: Verifying service account..."
echo "------------------------------------------"
# Check if service account exists
SERVICE_ACCOUNT="eis-analysis-workflow@${PROJECT_ID}.iam.gserviceaccount.com"
if gcloud iam service-accounts describe ${SERVICE_ACCOUNT} > /dev/null 2>&1; then
    echo "✅ Service account exists: ${SERVICE_ACCOUNT}"
    
    # List roles
    ROLES=$(gcloud projects get-iam-policy ${PROJECT_ID} --flatten="bindings[].members" --filter="bindings.members:${SERVICE_ACCOUNT}" --format="table(bindings.role)")
    echo "Service account roles:"
    echo "${ROLES}"
else
    echo "❌ Service account does not exist: ${SERVICE_ACCOUNT}"
fi

echo "=================================================================================="
echo "Deployment verification completed!"
echo ""
echo "If all checks passed, your EIS Analysis Demo is ready to use."
echo "If any checks failed, please review the error messages and fix the issues."
echo "=================================================================================="
