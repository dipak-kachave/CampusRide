@echo off
title CampusRide - Live Public Share
echo ===================================================
echo   CampusRide - Generating Live Public Share Link
echo ===================================================
echo.
echo Make sure start-campusride.bat is running in the background!
echo.
echo Starting secure public tunnel on port 5173...
echo.
npx --yes localtunnel --port 5173
pause
