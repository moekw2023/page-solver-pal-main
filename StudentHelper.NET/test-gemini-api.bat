@echo off
REM Test Google Gemini API - List Available Models

set API_KEY=AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc

echo Testing Gemini API Connection...
echo.
echo Available models:
curl "https://generativelanguage.googleapis.com/v1beta/models?key=%API_KEY%"

echo.
echo.
echo Testing specific models:
echo.
echo 1. gemini-pro:
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro?key=%API_KEY%"

echo.
echo.
echo 2. gemini-1.5-pro:
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro?key=%API_KEY%"

echo.
echo.
echo 3. gemini-1.5-pro-latest:
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest?key=%API_KEY%"

echo.
echo.
pause
