@echo off
echo ==============================================
echo        Starting CampusRide Platform...
echo ==============================================
echo.

echo [1/2] Starting Backend Server (Port 5000)...
start "CampusRide Backend Server" cmd /k "cd /d "%~dp0server" && npm run start"

echo.
echo [2/2] Starting Frontend Client (Port 5173)...
start "CampusRide Frontend Client" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ==============================================
echo CampusRide is launching!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo ==============================================
timeout /t 5 >nul
start http://localhost:5173
