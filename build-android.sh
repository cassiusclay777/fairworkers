#!/bin/bash

echo "========================================"
echo "FairWorkers - Android Build Script"
echo "========================================"
echo ""

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "ERROR: Java not found!"
    echo "Please install JDK 17+ from https://adoptium.net/"
    echo ""
    exit 1
fi

echo "[1/4] Building web application..."
cd frontend
pnpm build
if [ $? -ne 0 ]; then
    echo "ERROR: Web build failed!"
    exit 1
fi

echo ""
echo "[2/4] Syncing with Android project..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "ERROR: Capacitor sync failed!"
    exit 1
fi

echo ""
echo "[3/4] Building Android APK..."
cd android
./gradlew assembleDebug
if [ $? -ne 0 ]; then
    echo "ERROR: Android build failed!"
    echo ""
    echo "Common fixes:"
    echo "- Make sure JAVA_HOME is set correctly"
    echo "- Install Android SDK"
    echo "- Check ANDROID-BUILD.md for full setup instructions"
    exit 1
fi

echo ""
echo "[4/4] Success!"
echo ""
echo "========================================"
echo "APK Location:"
echo "$(pwd)/app/build/outputs/apk/debug/app-debug.apk"
echo "========================================"
echo ""
echo "To install on device:"
echo "  adb install app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Or copy the APK file to your phone and install manually"
echo ""
