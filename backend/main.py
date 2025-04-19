# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from contextlib import asynccontextmanager
# Import the routers from the api directory
from backend.api import documents, analysis
from backend.config.settings import settings # Import settings

# Configure logging
# Use settings to determine log level
log_level = logging.DEBUG if settings.DEBUG else logging.INFO
logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup and shutdown events (lifespan context manager)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code to run on startup
    logger.info("Starting EIS Analysis API...")
    logger.info(f"Debug mode: {settings.DEBUG}")

    # Example check: Log crucial settings on startup
    logger.info(f"Project ID: {settings.PROJECT_ID}")
    logger.info(f"Input Bucket: {settings.INPUT_BUCKET}")
    logger.info(f"Document AI Processor ID: {settings.DOCUMENT_PROCESSOR_ID}")

    # Check environment variables (optional, but good practice)
    if not settings.PROJECT_ID:
        logger.warning("PROJECT_ID environment variable not set")

    if not settings.INPUT_BUCKET or not settings.OUTPUT_BUCKET:
        logger.warning("INPUT_BUCKET or OUTPUT_BUCKET environment variables not set")

    # Check Document AI configuration
    if not settings.DOCUMENT_PROCESSOR_ID:
        logger.warning("DOCUMENT_PROCESSOR_ID not set. Document AI features will be limited.")
    else:
        logger.info("Document AI processor is configured.")

    yield
    # Code to run on shutdown
    logger.info("Shutting down EIS Analysis API.")


# Create FastAPI application with lifespan management
app = FastAPI(
    title="EIS Analysis API",
    description="API for Environmental Impact Statement comment analysis",
    version="0.1.0",
    lifespan=lifespan # Add the lifespan context manager
)

# Add CORS middleware
# Use specific origins in production instead of "*"
origins = [
    "http://localhost:5173", # Allow default Vite dev server
    "http://localhost:3000", # Common React dev server port
    "*" # Keep wildcard for broader development access if needed, but restrict in prod
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Allow specific origins or "*"
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# Include the API routers
app.include_router(documents.router)
app.include_router(analysis.router)

# Root endpoint (remains the same)
@app.get("/")
async def root():
    """Root endpoint to check API health."""
    return {
        "status": "online",
        "message": "EIS Analysis API is running",
        "version": "0.1.0"
    }

# Health check endpoint for Cloud Run (remains the same)
@app.get("/_ah/health")
async def health_check():
    """Health check endpoint for Cloud Run."""
    # Could add more sophisticated checks here later (e.g., DB connection)
    return {"status": "healthy"}


# Run application using Uvicorn when script is executed directly
if __name__ == "__main__":
    import uvicorn

    # Host and port are now read from settings
    host = settings.API_HOST
    port = settings.API_PORT

    logger.info(f"Starting Uvicorn development server on {host}:{port}")
    uvicorn.run(
        "main:app", # Point to the FastAPI app instance
        host=host,
        port=port,
        reload=settings.DEBUG, # Enable reload only in debug mode
        log_level=log_level # Pass log level to uvicorn
    )

