#!/bin/bash

# Smart Interview Backend Setup Script

echo "Setting up Smart Interview Backend..."

# Check Python version
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update .env file with your configuration"
fi

# Create uploads directory
mkdir -p uploads

# Initialize database
echo "Initializing database..."
flask init-db

echo "Setup complete!"
echo ""
echo "To start the development server, run:"
echo "source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "python run.py"
