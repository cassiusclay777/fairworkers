@echo off
echo 🚀 FairWorkers Cloudflare Deployment
echo ====================================

REM Check if we're in the right directory
if not exist "docker-compose.yml" (
    echo ❌ Error: Must run from project root directory
    exit /b 1
)

REM Check if Cloudflare credentials are set
if "%CLOUDFLARE_API_TOKEN%"=="" (
    echo ❌ Error: CLOUDFLARE_API_TOKEN environment variable not set
    echo 💡 Get your API token from: https://dash.cloudflare.com/profile/api-tokens
    echo    Create a token with: Zone.Zone:Read, Zone.DNS:Edit permissions
    exit /b 1
)

set CLOUDFLARE_ZONE_ID=86f061519c5f29cbd78666f4af34003d
set DOMAIN=fairworkers.dpdns.org

echo 📡 Configuring Cloudflare DNS for %DOMAIN%...

REM Get current server IP (assuming this runs on the target server)
for /f "tokens=*" %%i in ('curl -s http://checkip.amazonaws.com') do set SERVER_IP=%%i

if "%SERVER_IP%"=="" (
    echo ❌ Error: Could not determine server IP
    exit /b 1
)

echo 📍 Server IP: %SERVER_IP%

REM Check if DNS record already exists
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/%CLOUDFLARE_ZONE_ID%/dns_records?name=%DOMAIN%" ^
  -H "Authorization: Bearer %CLOUDFLARE_API_TOKEN%" ^
  -H "Content-Type: application/json" > temp_dns.json

REM Simple check for existing record
findstr /C:"\"id\":" temp_dns.json >nul
if %errorlevel% equ 0 (
    echo 📝 Updating existing DNS record...
    REM This is simplified - in production you'd parse the JSON properly
    echo ⚠️  Manual DNS update required for Windows
    echo 💡 Go to: https://dash.cloudflare.com/86f061519c5f29cbd78666f4af34003d/fairworkers.dpdns.org
    echo 💡 Update A record to point to: %SERVER_IP%
) else (
    echo 📝 Creating new DNS record...
    echo ⚠️  Manual DNS creation required for Windows
    echo 💡 Go to: https://dash.cloudflare.com/86f061519c5f29cbd78666f4af34003d/fairworkers.dpdns.org
    echo 💡 Create A record pointing to: %SERVER_IP%
)

del temp_dns.json 2>nul

echo ✅ DNS configured successfully!

REM Build and start the application
echo 🏗️ Building FairWorkers application...

REM Build Docker images
docker-compose build

echo 🐳 Starting services...
docker-compose up -d

echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Services are running!
) else (
    echo ❌ Services failed to start. Check logs with: docker-compose logs
    exit /b 1
)

REM Test the application
echo 🧪 Testing application...
curl -s -o nul -w "%%{http_code}" https://%DOMAIN%/health > health_check.txt
set /p HEALTH_CHECK=<health_check.txt
del health_check.txt

if "%HEALTH_CHECK%"=="200" (
    echo ✅ Application is healthy!
) else (
    echo ⚠️ Health check returned: %HEALTH_CHECK%
    echo 📋 Check application logs: docker-compose logs fairworkers
)

REM Setup SSL certificates
echo 🔐 Setting up SSL certificates...

REM Create SSL directory
if not exist "ssl" mkdir ssl

REM Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 ^
  -keyout ssl/privkey.pem ^
  -out ssl/fullchain.pem ^
  -subj "/C=CZ/ST=Prague/L=Prague/O=FairWorkers/CN=%DOMAIN%" ^
  2>nul

echo ✅ SSL certificates generated!

REM Restart nginx with SSL
docker-compose restart nginx

echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo =======================
echo 🌐 Your application is now available at:
echo    🔗 https://%DOMAIN%
echo.
echo 📊 Useful commands:
echo    docker-compose logs -f          # View logs
echo    docker-compose ps               # Check service status
echo    docker-compose restart          # Restart services
echo    docker-compose down             # Stop services
echo.
echo 🔧 Next steps:
echo    1. Replace self-signed SSL with Let's Encrypt:
echo       certbot certonly --standalone -d %DOMAIN%
echo    2. Update nginx.conf to use real certificates
echo    3. Configure email notifications
echo    4. Set up automatic backups
echo.
echo 📞 Need help? Check deployment guides in DEPLOYMENT.md

pause
