@echo off
title SmartSearch Java Core CLI Demonstration (OOPJ / ADSA / DMGT)
cls
echo ==============================================================================
echo   SMARTSEARCH: JAVA CORE ENGINE (ADSA AVL TREE + DMGT SET ALGEBRA)
echo ==============================================================================
echo.
echo [*] Compiling Java source files...
if not exist "bin" mkdir "bin"

javac -d bin src/main/java/com/smartsearch/model/*.java src/main/java/com/smartsearch/adsa/*.java src/main/java/com/smartsearch/dmgt/*.java src/main/java/com/smartsearch/engine/*.java src/main/java/com/smartsearch/Main.java

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Compilation failed or JDK not in PATH.
    echo [!] Make sure Java JDK 11+ is installed and 'javac' is in your system PATH.
    echo [!] You can still run the web application using 'run.bat' or 'python server.py'.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo [+] Compilation successful! Running Java Demonstration...
echo.
java -cp bin com.smartsearch.Main
echo.
pause
