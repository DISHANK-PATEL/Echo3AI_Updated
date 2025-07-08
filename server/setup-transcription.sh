#!/bin/bash

echo "Setting up transcription dependencies..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "Python is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check Python version
python_version=$(python -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "Python version: $python_version"

# Install pip if not available
if ! command -v pip &> /dev/null; then
    echo "pip is not installed. Please install pip."
    exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Test whisper installation
echo "Testing Whisper installation..."
python -c "import whisper; print('Whisper installed successfully')"

echo "Transcription setup complete!"
echo ""
echo "To test transcription, run:"
echo "python transcribe.py <path-to-audio-file>" 