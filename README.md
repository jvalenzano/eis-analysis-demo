# EIS Analysis Demo

An AI-powered tool for analyzing public comments on Environmental Impact Statements.

## Overview

This project provides Forest Service personnel with a streamlined way to analyze public feedback on Draft Environmental Impact Statements (EIS). The tool categorizes comments, analyzes sentiment, and generates insights to support informed decision-making.

## Features

- **Comment Selection**: Choose from available EIS document comments  
- **AI-Powered Analysis**: Automatically categorize comments into relevant themes  
- **Sentiment Analysis**: Understand public sentiment on different aspects of the proposal  
- **Key Concerns Identification**: Extract and summarize primary public concerns  
- **Visual Results**: View insights through intuitive charts and summaries

## Getting Started

### Prerequisites

- Google Cloud Platform account with billing enabled  
- Node.js 16+ and npm (for frontend development)  
- Python 3.8+ (for backend components)  
- Docker (for containerized deployment)

### Installation

1. Clone the repository:  
     
   git clone https://github.com/yourusername/eis-analysis-demo.git  
     
   cd eis-analysis-demo  
     
2. Set up environment variables:  
     
   cp .env.example .env  
     
   \# Edit .env with your GCP project details and API keys  
     
3. Install dependencies:  
     
   \# Frontend  
     
   cd frontend  
     
   npm install  
     
   \# Backend  
     
   cd ../backend  
     
   pip install \-r requirements.txt  
     
4. Configure Google Cloud resources:  
     
   \# Run setup script  
     
   ./scripts/setup\_gcp\_resources.sh

### Running Locally

1. Start the backend:  
     
   cd backend  
     
   python app.py  
     
2. Start the frontend:  
     
   cd frontend  
     
   npm start  
     
3. Access the application at `http://localhost:3000`

## Architecture

The application follows a layered architecture:

1. **Frontend Layer**: User interface for interaction and visualization  
2. **Orchestration Layer**: Google Cloud Workflows for process management  
3. **AI Processing Layer**:  
   - Document AI for preprocessing (optional)  
   - Vertex AI LLMs for classification and sentiment analysis  
4. **Visualization Layer**: Data presentation and insights

## Development

See [PLANNING.md](http://./PLANNING.md) for architectural details and project vision.

For development tasks and progress, refer to [TASK.md](http://./TASK.md).

## Testing

Run tests with:

\# Frontend tests

cd frontend

npm test

\# Backend tests

cd backend

pytest

## Deployment

### Development Environment

./scripts/deploy\_dev.sh

### Production Environment

./scripts/deploy\_prod.sh

## Contributing

1. Review [PLANNING.md](http://./PLANNING.md) for project context  
2. Check [TASK.md](http://./TASK.md) for current tasks and priorities  
3. Create a new branch for your feature  
4. Submit a pull request with comprehensive description of changes

## License

This project is licensed under the Apache 2.0 License \- see the [LICENSE](http://LICENSE) file for details.

## Acknowledgments

- USDA Forest Service for project requirements and domain expertise  
- Google Cloud Platform for infrastructure and AI services


