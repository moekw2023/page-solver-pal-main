@echo off
REM Quick test script to verify Gemini API is working with correct authentication
echo ========================================
echo Testing Gemini API Integration
echo ========================================
echo.

set API_KEY=AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc
set ENDPOINT=https://generativelanguage.googleapis.com/v1
set MODEL=gemini-2.5-flash

echo API Key: %API_KEY%
echo Endpoint: %ENDPOINT%
echo Model: %MODEL%
echo.
echo Testing with URL query parameter authentication...
echo URL: %ENDPOINT%/models/%MODEL%:generateContent?key=%API_KEY%
echo.

curl -X POST "%ENDPOINT%/models/%MODEL%:generateContent?key=%API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"contents\":[{\"parts\":[{\"text\":\"Say hello in 5 words or less\"}]}]}"

echo.
echo ========================================
echo If you see a response with "candidates"
echo and "text" content, the API is working!
echo ========================================
pause
