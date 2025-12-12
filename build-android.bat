@echo off
echo ========================================
echo FairWorkers - Android Build Script
echo ========================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java not found!
    echo Please install JDK 17+ from https://adoptium.net/
    echo.
    pause
    exit /b 1
)

echo [1/4] Building web application...
cd frontend
call pnpm build
if %errorlevel% neq 0 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Syncing with Android project...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Building Android APK...
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Android build failed!
    echo.
    echo Common fixes:
    echo - Make sure JAVA_HOME is set correctly
    echo - Install Android SDK
    echo - Check ANDROID-BUILD.md for full setup instructions
    pause
    exit /b 1
)

echo.
echo [4/4] Success!
echo.
echo ========================================
echo APK Location:
echo %CD%\app\build\outputs\apk\debug\app-debug.apk
echo ========================================
echo.
echo To install on device:
echo   adb install app\build\outputs\apk\debug\app-debug.apk
echo.
echo Or copy the APK file to your phone and install manually
echo.
pause
