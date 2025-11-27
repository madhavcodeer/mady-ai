@echo off
echo Starting Mady AI Server...
echo.
echo ---------------------------------------------------
echo    Mady AI - Intelligent Companion
echo    Powered by Gemini 2.0 Flash
echo ---------------------------------------------------
echo.
echo [1/2] Starting Backend Server...
start /B node server.js
timeout /t 3 >nul
echo.
echo [2/2] Launching Application in Browser...
start http://localhost:3000
echo.
echo Mady AI is running! 
echo Close this window to stop the server.
echo.
pause
taskkill /F /IM node.exe
