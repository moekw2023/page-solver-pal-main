@echo off
echo ========================================
echo Google Gemini API - Bearer Token Test
echo ========================================
echo.

set API_KEY=AIzaSyDCa-t0nYCwJuoeJKWMS7qPHgbqIvv9tFc
set ENDPOINT=https://generativelanguage.googleapis.com/v1
set MODEL=gemini-1.5-flash
set URL=%ENDPOINT%/models/%MODEL%:generateContent

echo Configuration:
echo   Endpoint: %ENDPOINT%
echo   Model: %MODEL%
echo   Auth Method: Bearer Token (Secure)
echo.

echo Test 1: Simple Text Generation
echo ---------------------------------
echo.

REM Create request body in a temporary file
(
echo {
echo   "contents": [{
echo     "parts": [{
echo       "text": "Solve this math problem step by step: What is 2x + 5 = 15?"
echo     }]
echo   }]
echo }
) > request.json

echo Sending request with Bearer token...
echo.

curl -X POST "%URL%" ^
  -H "Authorization: Bearer %API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d @request.json

echo.
echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo Summary:
echo   Bearer token authentication is configured
echo   API endpoint: %ENDPOINT%
echo   Model: %MODEL%
echo.

del request.json

pause
