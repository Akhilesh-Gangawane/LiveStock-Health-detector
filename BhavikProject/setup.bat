@echo off
echo 🐄 Livestock Health Monitor - Complete Setup
echo ==========================================

echo.
echo 1. Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo 2. Setting up Python FastAPI backend...
cd api
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    echo Make sure Python 3.8+ is installed
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ Setup complete!
echo.
echo 🚀 To start the application:
echo    npm run dev
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔗 Backend:  http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
pause