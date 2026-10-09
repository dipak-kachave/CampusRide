@echo off
title CampusRide - Starting Servers
echo ===================================================
echo   Starting CampusRide RCPIT Mobility Platform
echo ===================================================

echo [1/2] Starting Backend API Server (Port 5000)...
start "CampusRide Backend (Port 5000)" cmd /k "cd /d %~dp0server && node src/index.js"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend Vite Server (Port 5173)...
start "CampusRide Frontend (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ===================================================
echo   Servers launched!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo   Admin:    dipakka974@gmail.com / Dipak@2007
echo ===================================================
pause
