#!/bin/bash

echo "🐄 Livestock Health Monitor - Complete Setup"
echo "=========================================="

echo ""
echo "1. Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

echo ""
echo "2. Setting up Python FastAPI backend..."
cd api

# Check for Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PIP_CMD="pip3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    PIP_CMD="pip"
else
    echo "❌ Python not found. Please install Python 3.8+"
    exit 1
fi

$PIP_CMD install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    echo "Make sure Python 3.8+ is installed"
    exit 1
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   npm run dev"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔗 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"