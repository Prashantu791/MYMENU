@echo off
title Free Port 8080
echo ========================================================
echo  Checking for processes occupying Port 8080...
echo ========================================================
set FOUND=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    set FOUND=1
    echo Found process with PID: %%a on port 8080. Terminating...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo Failed to stop PID %%a. You may need to run as Administrator.
    ) else (
        echo Successfully stopped PID %%a. Port 8080 is now free!
    )
)

if %FOUND%==0 (
    echo Port 8080 is already free! No lingering process found.
)
echo ========================================================
pause
