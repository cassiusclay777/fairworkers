@echo off
echo ========================================
echo FairWorkers - Android Build (Fixed Paths)
echo ========================================
echo.

REM Set correct JAVA_HOME (using JDK 21 - more stable for Android)
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot
echo JAVA_HOME set to: %JAVA_HOME%

REM Set ANDROID_HOME (Android SDK path)
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
echo ANDROID_HOME set to: %ANDROID_HOME%

REM Add to PATH
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%PATH%

REM Verify Java
echo.
echo Checking Java installation...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java not working!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting build...
echo ========================================
echo.

REM Call the main build script
call build-android.bat
