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
