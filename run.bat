@echo off
title SmartSearch E-Commerce Store Launcher
cd /d "%~dp0"
cls
echo ==============================================================================
echo   SMARTSEARCH: AI-POWERED E-COMMERCE SEARCH & RECOMMENDATION SYSTEM
echo   B.Tech Mini-Project: ADSA + DMGT + OOPJ + Python AI
echo ==============================================================================
echo.
echo [*] Checking Python environment...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    py --version >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [!] Python is not found in PATH! Please install Python 3.8+ or add it to PATH.
        pause
        exit /b 1
    ) else (
        set PY_CMD=py
    )
) else (
    set PY_CMD=python
)

echo [+] Python found. Starting SmartSearch Server on http://localhost:8000 ...
echo [*] Opening your default web browser in 2 seconds...

start "" /B cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8000"

%PY_CMD% server.py
pause
