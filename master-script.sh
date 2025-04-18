#!/bin/bash
# Master execution script for EIS Analysis Demo

set -e

# Display header
echo "======================================================"
echo "  EIS Analysis Demo - Setup and Deployment Script"
echo "======================================================"
echo "This script will:"
echo "  1. Create backend scaffold"
echo "  2. Create frontend scaffold"
echo "  3. Check Document AI configuration"
echo "  4. Deploy to Google Cloud"
echo ""

# Check for required environment variables
if [ -z "$PROJECT_ID" ]; then
  echo "Setting PROJECT_ID environment variable to forest-insights-457102"
  export PROJECT_ID=forest-insights-457102
fi

if [ -z "$REGION" ]; then
  echo "Setting REGION environment variable to us-central1"
  export REGION=us-central1
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

# Check for Google Cloud SDK
if ! command_exists gcloud; then
  echo "❌ Google Cloud SDK (gcloud) not found."
  echo "Please install it from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check for Docker
if ! command_exists docker; then
  echo "❌ Docker not found."
  echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
  exit 1
fi

# Check for Python
if ! command_exists python3; then
  echo "❌ Python 3 not found."
  echo "Please install Python 3 from: https://www.python.org/downloads/"
  exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running."
  echo "Please start Docker Desktop and try again."
  exit 1
fi

echo "✅ All prerequisites are installed."

# Check if .env file exists, if not, check if .env.example exists and copy it
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please review the .env file and update as needed."
  else
    echo "⚠️ Neither .env nor .env.example found. Creating minimal .env file..."
    cat > .env << EOF
# Google Cloud Project settings
PROJECT_ID=$PROJECT_ID
REGION=$REGION

# Storage settings
INPUT_BUCKET=$PROJECT_ID-input
OUTPUT_BUCKET=$PROJECT_ID-output

# Document AI settings
DOCUMENT_PROCESSOR_ID=d2a89e31c0d743af
DOCUMENT_PROCESSOR_LOCATION=us-central1

# API settings
API_HOST=0.0.0.0
API_PORT=8000

# Application settings
DEBUG=True
EOF
    echo "Created minimal .env file."
  fi
fi

# Step 1: Create backend scaffold
echo ""
echo "Step 1: Creating backend scaffold..."
if [ -d "backend" ] && [ -f "backend/main.py" ]; then
  echo "⚠️ Backend already exists. Skipping scaffold creation."
else
  chmod +x backend-scaffold.sh
  ./backend-scaffold.sh
  echo "✅ Backend scaffold created successfully."
fi

# Step 2: Create frontend scaffold
echo ""
echo "Step 2: Creating frontend scaffold..."
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
  echo "⚠️ Frontend already exists. Skipping scaffold creation."
else
  chmod +x frontend-scaffold.sh
  ./frontend-scaffold.sh
  echo "✅ Frontend scaffold created successfully."
fi

# Step 3: Check Document AI configuration
echo ""
echo "Step 3: Checking Document AI configuration..."
python3 -m pip install google-cloud-documentai google-cloud-storage python-dotenv
python3 document-ai-test.py
if [ $? -ne 0 ]; then
  echo "❌ Document AI configuration check failed."
  echo "Please check your Document AI processor configuration in .env file."
  echo "You may need to create a new processor in the Google Cloud Console."
  echo "Continuing with deployment without Document AI integration..."
else
  echo "✅ Document AI configuration check passed."
fi

# Step 4: Deploy to Google Cloud
echo ""
echo "Step 4: Deploying to Google Cloud..."
read -p "Do you want to deploy the application to Google Cloud now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  chmod +x deployment-script.sh
  ./deployment-script.sh
  if [ $? -ne 0 ]; then
    echo "❌ Deployment failed."
    exit 1
  else
    echo "✅ Deployment successful."
  fi
else
  echo "Skipping deployment."
fi

echo ""
echo "======================================================"
echo "  EIS Analysis Demo - Setup Complete"
echo "======================================================"
echo ""
echo "You can now:"
echo "  1. Run the backend locally: cd backend && python main.py"
echo "  2. Run the frontend locally: cd frontend && npm install && npm run dev"
echo "  3. Deploy to Google Cloud: ./deployment-script.sh"
echo ""
echo "For more information, see the README.md file."
echo ""
