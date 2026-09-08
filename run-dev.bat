@echo off
echo ===================================================
echo   AI Creator Dashboard - Development Launcher
echo ===================================================
echo Launching Backend Server on port 5000...
start "AI Creator Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo Launching Frontend Application on port 3000...
start "AI Creator Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Done! Web App will be available at http://localhost:3000
