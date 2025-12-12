#!/bin/bash

# FairWorkers Cloudflare Deployment Script
# Automaticky nastaví DNS a spustí aplikaci na fairworkers.dpdns.org

set -e  # Exit on error

echo "🚀 FairWorkers Cloudflare Deployment"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# Check if Cloudflare credentials are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable not set"
    echo "💡 Get your API token from: https://dash.cloudflare.com/profile/api-tokens"
    echo "   Create a token with: Zone.Zone:Read, Zone.DNS:Edit permissions"
    exit 1
fi

CLOUDFLARE_ZONE_ID="86f061519c5f29cbd78666f4af34003d"
DOMAIN="fairworkers.dpdns.org"

echo "📡 Configuring Cloudflare DNS for $DOMAIN..."

# Get current server IP (assuming this runs on the target server)
SERVER_IP=$(curl -s http://checkip.amazonaws.com)

if [ -z "$SERVER_IP" ]; then
    echo "❌ Error: Could not determine server IP"
    exit 1
fi

echo "📍 Server IP: $SERVER_IP"

# Check if DNS record already exists
EXISTING_RECORD=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?name=$DOMAIN" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json")

RECORD_ID=$(echo "$EXISTING_RECORD" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$RECORD_ID" ]; then
    echo "📝 Updating existing DNS record..."
    curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$SERVER_IP\",\"ttl\":1,\"proxied\":true}" > /dev/null
else
    echo "📝 Creating new DNS record..."
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records" \
      -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$SERVER_IP\",\"ttl\":1,\"proxied\":true}" > /dev/null
fi

echo "✅ DNS configured successfully!"

# Build and start the application
echo "🏗️ Building FairWorkers application..."

# Build Docker images
docker-compose build

echo "🐳 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
else
    echo "❌ Services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Test the application
echo "🧪 Testing application..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/health || true)

if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ Application is healthy!"
else
    echo "⚠️ Health check returned: $HEALTH_CHECK"
    echo "📋 Check application logs: docker-compose logs fairworkers"
fi

# Setup SSL certificates (Let's Encrypt)
echo "🔐 Setting up SSL certificates..."

# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate for initial setup (replace with Let's Encrypt later)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem \
  -out ssl/fullchain.pem \
  -subj "/C=CZ/ST=Prague/L=Prague/O=FairWorkers/CN=$DOMAIN" \
  2>/dev/null

echo "✅ SSL certificates generated!"

# Restart nginx with SSL
docker-compose restart nginx

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo "🌐 Your application is now available at:"
echo "   🔗 https://$DOMAIN"
echo ""
echo "📊 Useful commands:"
echo "   docker-compose logs -f          # View logs"
echo "   docker-compose ps               # Check service status"
echo "   docker-compose restart          # Restart services"
echo "   docker-compose down             # Stop services"
echo ""
echo "🔧 Next steps:"
echo "   1. Replace self-signed SSL with Let's Encrypt:"
echo "      certbot certonly --standalone -d $DOMAIN"
echo "   2. Update nginx.conf to use real certificates"
echo "   3. Configure email notifications"
echo "   4. Set up automatic backups"
echo ""
echo "📞 Need help? Check deployment guides in DEPLOYMENT.md"
