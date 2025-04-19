#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# Determine script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Project root is one level up from scripts
PROJECT_ROOT_DIR="$( cd "${SCRIPT_DIR}/.." &> /dev/null && pwd )"
BACKEND_DIR="${PROJECT_ROOT_DIR}/backend" # Define backend dir path

# Check if BACKEND_DIR exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "Error: Backend directory not found at ${BACKEND_DIR}"
    exit 1
fi

echo "Project root directory: $PROJECT_ROOT_DIR"
cd "$PROJECT_ROOT_DIR" # <<< CHANGE: Stay in project root

# Activate virtual environment if it exists within the backend directory
VENV_PATH="${BACKEND_DIR}/venv"
if [ -d "$VENV_PATH" ]; then
    echo "Activating virtual environment..."
    if [ -f "${VENV_PATH}/bin/activate" ]; then
        source "${VENV_PATH}/bin/activate"
    elif [ -f "${VENV_PATH}/Scripts/activate" ]; then # For Windows Git Bash/WSL perhaps
        source "${VENV_PATH}/Scripts/activate"
    else
        echo "Warning: activate script not found in standard locations within ${VENV_PATH}"
    fi
else
    echo "Note: No virtual environment found at ${VENV_PATH}"
fi

# Install requirements if a marker file doesn't exist
# Check requirements.txt in backend directory
REQUIREMENTS_FILE="${BACKEND_DIR}/requirements.txt"
MARKER_FILE="${BACKEND_DIR}/.requirements_installed"
if [ ! -f "$MARKER_FILE" ]; then
    echo "Installing requirements from ${REQUIREMENTS_FILE}..."
    if [ -f "$REQUIREMENTS_FILE" ]; then
        pip install -r "$REQUIREMENTS_FILE"
        touch "$MARKER_FILE" # Create marker file on success
    else
        echo "Warning: requirements.txt not found in ${BACKEND_DIR}. Skipping installation."
    fi
else
     echo "Requirements already installed (marker file found)."
fi


# Set environment variables if .env file exists in the project root
ENV_FILE="${PROJECT_ROOT_DIR}/.env"
if [ -f "$ENV_FILE" ]; then
    echo "Loading environment variables from ${ENV_FILE}..."
    export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
    echo ".env file loaded."
else
    echo "Note: .env file not found at ${ENV_FILE}. Relying on system environment variables."
fi


# Start the development server using uvicorn from project root
echo "Starting FastAPI development server (Uvicorn)..."
# Check if DEBUG is set to true in the environment
if [[ "$(printenv DEBUG | tr '[:upper:]' '[:lower:]')" == "true" ]]; then
    echo "Debug mode enabled (reload)."
    RELOAD_FLAG="--reload"
    # Specify reload directory explicitly when not running from module dir
    RELOAD_DIRS_FLAG="--reload-dir ${BACKEND_DIR}"
else
    echo "Debug mode disabled."
    RELOAD_FLAG=""
    RELOAD_DIRS_FLAG=""
fi

# <<< CHANGE: Run uvicorn pointing to backend.main:app from project root
python -m uvicorn backend.main:app $RELOAD_FLAG $RELOAD_DIRS_FLAG --host 0.0.0.0 --port 8000 --log-level info

