# FairWorkers - Set Android Environment Variables
# Tento skript nastaví trvalé environment variables pro Android development

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting Android Environment Variables" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"

# Set JAVA_HOME
Write-Host "Setting JAVA_HOME to: $javaHome" -ForegroundColor Yellow
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, [System.EnvironmentVariableTarget]::User)

# Set ANDROID_HOME
Write-Host "Setting ANDROID_HOME to: $androidHome" -ForegroundColor Yellow
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, [System.EnvironmentVariableTarget]::User)

# Get current PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)

# Add JAVA_HOME\bin if not already there
if ($currentPath -notlike "*$javaHome\bin*") {
    Write-Host "Adding JAVA_HOME\bin to PATH" -ForegroundColor Yellow
    $newPath = "$javaHome\bin;$currentPath"
    [System.Environment]::SetEnvironmentVariable("Path", $newPath, [System.EnvironmentVariableTarget]::User)
}

# Add Android SDK paths if not already there
$androidPaths = @(
    "$androidHome\platform-tools",
    "$androidHome\tools",
    "$androidHome\tools\bin"
)

foreach ($path in $androidPaths) {
    if ($currentPath -notlike "*$path*") {
        Write-Host "Adding $path to PATH" -ForegroundColor Yellow
        $currentPath = "$path;$currentPath"
        [System.Environment]::SetEnvironmentVariable("Path", $currentPath, [System.EnvironmentVariableTarget]::User)
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Please restart your terminal/PowerShell for changes to take effect." -ForegroundColor Yellow
Write-Host ""
Write-Host "Then you can run:" -ForegroundColor Cyan
Write-Host "  .\build-android.bat" -ForegroundColor White
Write-Host ""
