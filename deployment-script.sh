#!/bin/bash
# Updated deployment script for EIS Analysis Demo

set -e

# Check environment variables
if [ -z "$PROJECT_ID" ]; then
  echo "ERROR: PROJECT_ID environment variable is not set"
  echo "Please run: export PROJECT_ID=forest-insights-457102"
  exit 1
fi

if [ -z "$REGION" ]; then
  REGION="us-central1"
  echo "Using default region: $REGION"
fi

echo "Deploying EIS Analysis Demo to project: $PROJECT_ID in region: $REGION"

# Validate backend directory
if [ ! -d "backend" ] || [ ! -f "backend/main.py" ]; then
  echo "ERROR: Backend directory or main.py not found."
  echo "Please run the scaffold scripts first."
  exit 1
fi

# Validate frontend directory
if [ ! -d "frontend" ] || [ ! -f "frontend/package.json" ]; then
  echo "ERROR: Frontend directory or package.json not found."
  echo "Please run the scaffold scripts first."
  exit 1
fi

# 1. Set up Docker repository
echo "Setting up Artifact Registry..."
gcloud artifacts repositories create eis-containers \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker repository for EIS Analysis Demo" \
  || echo "Repository already exists, continuing..."

# 2. Set Docker config
echo "Configuring Docker..."
gcloud auth configure-docker $REGION-docker.pkg.dev

# 3. Build and push backend image
echo "Building and pushing backend Docker image..."
cd backend
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/eis-containers/eis-backend:latest .
docker push $REGION-docker.pkg.dev/$PROJECT_ID/eis-containers/eis-backend:latest
cd ..

# 4. Build and push frontend image
echo "Building and pushing frontend Docker image..."
cd frontend
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/eis-containers/eis-frontend:latest .
docker push $REGION-docker.pkg.dev/$PROJECT_ID/eis-containers/eis-frontend:latest
cd ..

# 5. Deploy backend to Cloud Run
echo "Deploying backend to Cloud Run..."
gcloud run deploy eis-backend \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/eis-containers/eis-backend:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="PROJECT_ID=$PROJECT_ID,REGION=$REGION,INPUT_BUCKET=$PROJECT_ID-input,OUTPUT_BUCKET=$PROJECT_ID-output,DOCUMENT_PROCESSOR_ID=$(grep DOCUMENT_PROCESSOR_ID .env | cut -d'=' -f2),DOCUMENT_PROCESSOR_LOCATION=$(grep DOCUMENT_PROCESSOR_LOCATION .env | cut -d'=' -f2)"

# 6. Get backend URL
BACKEND_URL=$(gcloud run services describe eis-backend --region=$REGION --format="value(status.url)")
echo "Backend deployed at: $BACKEND_URL"

# 7. Create a temporary nginx.conf with the actual backend URL
cat > frontend/nginx.conf << EOF
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Serve static files
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass $BACKEND_URL;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 8. Build and push frontend image again with updated nginx.conf
echo "Rebuilding frontend with updated nginx.conf..."
cd frontend
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/eis-containers/eis-frontend:latest .
docker push $REGION-docker.pkg.dev/$PROJECT_ID/eis-containers/eis-frontend:latest
cd ..

# 9. Deploy frontend to Cloud Run
echo "Deploying frontend to Cloud Run..."
gcloud run deploy eis-frontend \
  --image=$REGION-docker.pkg.dev/$PROJECT_ID/eis-containers/eis-frontend:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="BACKEND_URL=$BACKEND_URL"

# 10. Get frontend URL
FRONTEND_URL=$(gcloud run services describe eis-frontend --region=$REGION --format="value(status.url)")
echo "Frontend deployed at: $FRONTEND_URL"

echo "Deployment completed successfully!"
echo "Your application is available at: $FRONTEND_URL"
