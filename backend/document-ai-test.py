import os
from dotenv import load_dotenv
from google.cloud import documentai_v1 as documentai

# Load environment variables
load_dotenv()

def test_document_ai():
    try:
        # Get configuration from environment variables
        project_id = os.getenv("PROJECT_ID")
        location = os.getenv("DOCUMENT_PROCESSOR_LOCATION")
        processor_id = os.getenv("DOCUMENT_PROCESSOR_ID")

        if not all([project_id, location, processor_id]):
            raise ValueError("Missing required environment variables")

        # Initialize the Document AI client
        client = documentai.DocumentProcessorServiceClient()
        
        # Format the processor name
        processor_name = f"projects/{project_id}/locations/{location}/processors/{processor_id}"
        
        # Test the connection by getting processor information
        processor = client.get_processor(name=processor_name)
        
        print(f"Successfully connected to Document AI!")
        print(f"Processor Name: {processor.name}")
        print(f"Processor Type: {processor.type_}")
        print(f"Processor State: {processor.state}")
        
    except Exception as e:
        print(f"Error testing Document AI: {str(e)}")

if __name__ == "__main__":
    test_document_ai() 