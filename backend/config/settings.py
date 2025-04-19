import os
from typing import Dict, Any, Optional
from pydantic_settings import BaseSettings # Changed 'pydantic' to 'pydantic_settings'from pydantic import BaseSettings

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
