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

REM IMPORTANT: Clear PATH and rebuild to ensure JDK 21 is used
REM This prevents system JDK 25 from being picked up
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem"

REM Verify Java version (MUST be JDK 21)
echo.
echo Checking Java installation...
echo Expected: JDK 21
"%JAVA_HOME%\bin\java" -version
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
