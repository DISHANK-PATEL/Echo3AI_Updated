# Transcription Setup Guide

This guide will help you set up the transcription functionality for the Echo3AI podcast platform.

## Prerequisites

1. **Python 3.8 or higher** - Required for Whisper transcription
2. **pip** - Python package manager
3. **Node.js** - For the backend server

## Installation Steps

### 1. Install Python Dependencies

Navigate to the server directory and install the required Python packages:

```bash
cd server
pip install -r requirements.txt
```

Or use the setup script:

```bash
chmod +x setup-transcription.sh
./setup-transcription.sh
```

### 2. Verify Installation

Test that Whisper is working correctly:

```bash
python -c "import whisper; print('Whisper installed successfully')"
```

### 3. Test Transcription

You can test the transcription with a sample audio file:

```bash
python transcribe.py path/to/your/audio-file.mp3
```

## Supported File Formats

The transcription system supports the following formats:
- **Video**: MP4, WebM, MOV, AVI
- **Audio**: MP3, WAV, M4A

## Troubleshooting

### Common Issues

1. **Python not found**
   - Ensure Python is installed and in your PATH
   - Try using `python3` instead of `python`

2. **Whisper installation fails**
   - Make sure you have sufficient disk space (Whisper models are large)
   - Try installing with: `pip install --upgrade openai-whisper`

3. **Transcription timeout**
   - Large files may take longer to process
   - The timeout is set to 5 minutes by default

4. **Memory issues**
   - Whisper requires significant RAM for processing
   - Close other applications if you encounter memory errors

### Logs

Check the server logs for detailed error information:
- Look for "Transcription failed" messages
- Check Python stderr output for specific errors

## Performance Notes

- **First run**: Whisper will download the model (~1GB) on first use
- **Processing time**: Depends on file length and system performance
- **Model size**: Using "base" model for faster processing

## Configuration

You can modify the transcription settings in `transcribe.py`:
- Change model size (tiny, base, small, medium, large)
- Adjust timeout settings in `server/index.js` 