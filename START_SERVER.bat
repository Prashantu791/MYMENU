@echo off
title MYMENU Spring Boot Server
echo ========================================================
echo  Starting MYMENU Unified Spring Boot Application
echo  Backend APIs + Frontend Static Website on port 8080
echo ========================================================

rem Free port 8080 if an old Java or Tomcat process was left running
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Freeing port 8080 from process PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

cd /d "%~dp0BACKEND"
echo Starting Spring Boot backend...
java "@jvm_args.txt"
pause
