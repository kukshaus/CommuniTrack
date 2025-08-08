@echo off
echo ========================================
echo CommuniTrack Setup Script
echo ========================================
echo.

echo 1. Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo.
echo 2. Setting up environment file...
if not exist .env.local (
    copy env.template .env.local
    echo .env.local created from template
) else (
    echo .env.local already exists
)

echo.
echo 3. Starting MongoDB with Docker (optional)...
docker-compose up -d mongodb >nul 2>&1
if %errorlevel% neq 0 (
    echo Info: Docker/MongoDB not available - app will use in-memory storage for demo.
    echo This is perfect for testing the application!
) else (
    echo MongoDB container started successfully
)

echo.
echo 4. Waiting for MongoDB to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Open http://localhost:3001 (or the port shown in terminal)
echo.
echo The app will work in demo mode with sample data if MongoDB is not available.
echo.
echo Optional MongoDB setup:
echo - Install Docker Desktop and run: docker-compose up -d mongodb
echo - MongoDB Express: http://localhost:8081 (admin/admin)
echo - Edit .env.local for custom MongoDB connection
echo.
pause
