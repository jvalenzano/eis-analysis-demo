#!/bin/bash
# EIS Analysis Demo - Application Deployment Script
# This script builds and deploys the frontend and backend to Cloud Run

set -e  # Exit on any error

# Configuration
PROJECT_ID="forest-insights-457102"
REGION="us-central1"
BACKEND_SERVICE_NAME="eis-analysis-backend"
FRONTEND_SERVICE_NAME="eis-analysis-frontend"
SERVICE_ACCOUNT="eis-analysis-workflow@${PROJECT_ID}.iam.gserviceaccount.com"

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Validate environment
if [ -z "$INPUT_BUCKET" ] || [ -z "$OUTPUT_BUCKET" ]; then
    echo "ERROR: INPUT_BUCKET and OUTPUT_BUCKET must be set in .env file"
    exit 1
fi

echo "Starting deployment for project: ${PROJECT_ID}"
echo "=================================================================================="

# Make sure gcloud is using the correct project
gcloud config set project ${PROJECT_ID}

echo "Step 1: Setting up Artifact Registry repository..."
echo "------------------------------------------"
# Create Artifact Registry repository if it doesn't exist
REPO_EXISTS=$(gcloud artifacts repositories list --filter="name:eis-analysis" --format="value(name)")
if [ -z "$REPO_EXISTS" ]; then
    gcloud artifacts repositories create eis-analysis \
        --repository-format=docker \
        --location=${REGION} \
        --description="Docker repository for EIS Analysis Demo"
fi

# Configure Docker to use Artifact Registry
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Repository URL
REPO_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/eis-analysis"

echo "Step 2: Building and pushing backend image..."
echo "------------------------------------------"
# Build backend Docker image
cd backend
docker build -t ${REPO_URL}/${BACKEND_SERVICE_NAME}:latest .

# Push to Artifact Registry
docker push ${REPO_URL}/${BACKEND_SERVICE_NAME}:latest

# Go back to root directory
cd ..

echo "Step 3: Building and pushing frontend image..."
echo "------------------------------------------"
# Build frontend Docker image
cd frontend
docker build -t ${REPO_URL}/${FRONTEND_SERVICE_NAME}:latest .

# Push to Artifact Registry
docker push ${REPO_URL}/${FRONTEND_SERVICE_NAME}:latest

# Go back to root directory
cd ..

echo "Step 4: Deploying backend to Cloud Run..."
echo "------------------------------------------"
# Deploy backend to Cloud Run
gcloud run deploy ${BACKEND_SERVICE_NAME} \
    --image=${REPO_URL}/${BACKEND_SERVICE_NAME}:latest \
    --platform=managed \
    --region=${REGION} \
    --allow-unauthenticated \
    --service-account=${SERVICE_ACCOUNT} \
    --set-env-vars="PROJECT_ID=${PROJECT_ID},REGION=${REGION},INPUT_BUCKET=${INPUT_BUCKET},OUTPUT_BUCKET=${OUTPUT_BUCKET},DOCUMENT_PROCESSOR_ID=${DOCUMENT_PROCESSOR_ID},DOCUMENT_PROCESSOR_LOCATION=${DOCUMENT_PROCESSOR_LOCATION}"

# Get backend URL
BACKEND_URL=$(gcloud run services describe ${BACKEND_SERVICE_NAME} --platform=managed --region=${REGION} --format="value(status.url)")

echo "Step 5: Deploying frontend to Cloud Run..."
echo "------------------------------------------"
# Deploy frontend to Cloud Run
gcloud run deploy ${FRONTEND_SERVICE_NAME} \
    --image=${REPO_URL}/${FRONTEND_SERVICE_NAME}:latest \
    --platform=managed \
    --region=${REGION} \
    --allow-unauthenticated \
    --service-account=${SERVICE_ACCOUNT} \
    --set-env-vars="VITE_API_URL=${BACKEND_URL}/api"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe ${FRONTEND_SERVICE_NAME} --platform=managed --region=${REGION} --format="value(status.url)")

echo "Step 6: Setting up Cloud Workflow..."
echo "------------------------------------------"
# Create workflow directory if it doesn't exist
mkdir -p workflows

# Create workflow YAML file
cat << EOF > workflows/eis_analysis_workflow.yaml
main:
  params: [input]
  steps:
    - init:
        assign:
          - jobId: \${input.jobId}
          - documentId: \${input.documentId}
          - userId: \${input.userId}
          - projectId: \${sys.get_env("GOOGLE_CLOUD_PROJECT_ID")}
          - region: \${sys.get_env("GOOGLE_CLOUD_REGION")}
          - inputBucket: \${sys.get_env("INPUT_BUCKET")}
          - outputBucket: \${sys.get_env("OUTPUT_BUCKET")}
          - backendUrl: \${sys.get_env("BACKEND_URL")}
      
    - logStart:
        call: sys.log
        args:
          text: \${"Starting analysis workflow for document: " + documentId + ", job: " + jobId}
          severity: INFO
      
    - updateStatus:
        call: http.post
        args:
          url: \${backendUrl + "/api/analysis/jobs/" + jobId + "/status"}
          auth:
            type: OIDC
          body:
            status: "PREPARING"
            progress: 0
            message: "Preparing to extract comments"
        result: statusUpdate
      
    - extractComments:
        call: http.post
        args:
          url: \${backendUrl + "/api/analysis/extract"}
          auth:
            type: OIDC
          body:
            jobId: \${jobId}
            documentId: \${documentId}
            bucketName: \${inputBucket}
        result: extractionResult
      
    - checkExtraction:
        switch:
          - condition: \${extractionResult.body.status == "ERROR"}
            next: handleError
          
    - updateExtractionStatus:
        call: http.post
        args:
          url: \${backendUrl + "/api/analysis/jobs/" + jobId + "/status"}
          auth:
            type: OIDC
          body:
            status: "EXTRACTING"
            progress: 20
            message: "Comments extracted successfully"
        result: statusUpdate
      
    - classifyComments:
        call: http.post
        args:
          url: \${backendUrl + "/api/analysis/classify"}
          auth:
            type: OIDC
          body:
            jobId: \${jobId}
            documentId: \${documentId}
        result: classificationResult
      
    - checkClassification:
        switch:
          - condition: \${classificationResult.body.status == "ERROR"}
            next: handleError
      
    - updateClassificationStatus:
        call: http.post
        args:
          url: \${backendUrl + "/api/analysis/jobs/" + jobId + "/status"}
          auth:
            type: OIDC
          body:
            status: "CLASSIFYING"
            progress: 40
            message: "Comments classified successfully"
        result: statusUpdate
      
    - analyzeSentiment:
        call: http.post
        args:
          url: \${backendUrl + "/api/analysis/sentiment"}
          auth:
            type: OIDC
          body:
            jobId: \${jobId}
            documentId: \${documentId}
        result: sentimentResult
      
    - checkSentiment:
        switch:
          - condition: \${sentimentResult.body.status == "ERROR"}
            next: handleError
      
    - updateSentimentStatus:
        call: http.post
        args:
          url: \${backendUrl + "/api/analysis/jobs/" + jobId + "/status"}
          auth:
            type: OIDC
          body:
            status: "ANALYZING_SENTIMENT"
            progress: 60
            message: "Sentiment analysis completed"
        result: statusUpdate
      
    - extractKeyConcerns:
        call: http.post
        args:
          url: \${backendUrl + "/api/analysis/concerns"}
          auth:
            type: OIDC
          body:
            jobId: \${jobId}
            documentId: \${documentId}
        result: concernsResult
      
    - checkConcerns:
        switch:
          - condition: \${concernsResult.body.status == "ERROR"}
            next: handleError
      
    - updateConcernsStatus:
        call: http.post
        args:
          url: \${backendUrl + "/api/analysis/jobs/" + jobId + "/status"}
          auth:
            type: OIDC
          body:
            status: "EXTRACTING_CONCERNS"
            progress: 80
            message: "Key concerns extracted"
        result: statusUpdate
      
    - aggregateResults:
        call: http.post
        args:
          url: \${backendUrl + "/api/analysis/aggregate"}
          auth:
            type: OIDC
          body:
            jobId: \${jobId}
            documentId: \${documentId}
        result: aggregationResult
      
    - updateFinalStatus:
        call: http.post
        args:
          url: \${backendUrl + "/api/analysis/jobs/" + jobId + "/status"}
          auth:
            type: OIDC
          body:
            status: "COMPLETED"
            progress: 100
            message: "Analysis completed successfully"
            resultPath: \${aggregationResult.body.resultPath}
        result: statusUpdate
      
    - returnSuccess:
        return:
          jobId: \${jobId}
          documentId: \${documentId}
          status: "COMPLETED"
          resultPath: \${aggregationResult.body.resultPath}
      
    - handleError:
        steps:
          - logError:
              call: sys.log
              args:
                text: \${"Error in analysis workflow for document: " + documentId + ", job: " + jobId}
                severity: ERROR
            
          - updateErrorStatus:
              call: http.post
              args:
                url: \${backendUrl + "/api/analysis/jobs/" + jobId + "/status"}
                auth:
                  type: OIDC
                body:
                  status: "ERROR"
                  progress: 0
                  message: "An error occurred during analysis"
              result: statusUpdate
            
          - returnError:
              return:
                jobId: \${jobId}
                documentId: \${documentId}
                status: "ERROR"
                error: "An error occurred during the analysis process"
EOF

# Deploy the workflow
gcloud workflows deploy eis-analysis-workflow \
    --source=workflows/eis_analysis_workflow.yaml \
    --location=${REGION} \
    --service-account=${SERVICE_ACCOUNT}

# Set workflow variables
gcloud workflows variables set BACKEND_URL ${BACKEND_URL} \
    --workflow=eis-analysis-workflow \
    --location=${REGION}

gcloud workflows variables set GOOGLE_CLOUD_PROJECT_ID ${PROJECT_ID} \
    --workflow=eis-analysis-workflow \
    --location=${REGION}

gcloud workflows variables set GOOGLE_CLOUD_REGION ${REGION} \
    --workflow=eis-analysis-workflow \
    --location=${REGION}

gcloud workflows variables set INPUT_BUCKET ${INPUT_BUCKET} \
    --workflow=eis-analysis-workflow \
    --location=${REGION}

gcloud workflows variables set OUTPUT_BUCKET ${OUTPUT_BUCKET} \
    --workflow=eis-analysis-workflow \
    --location=${REGION}

echo "=================================================================================="
echo "Deployment completed successfully!"
echo ""
echo "Application URLs:"
echo "- Frontend: ${FRONTEND_URL}"
echo "- Backend API: ${BACKEND_URL}/api"
echo ""
echo "You can now access the application at: ${FRONTEND_URL}"
echo "=================================================================================="
