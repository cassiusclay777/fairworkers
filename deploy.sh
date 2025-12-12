#!/bin/bash

# FairWorkers Quick Deploy Script
# Usage: ./deploy.sh [server-ip] [user]

set -e  # Exit on error

SERVER_IP=${1:-"your-server-ip"}
SERVER_USER=${2:-"root"}
PROJECT_NAME="fairworkers"
REMOTE_DIR="/var/www/$PROJECT_NAME"

echo "========================================="
echo "  FairWorkers Deployment Script"
echo "========================================="
echo ""
echo "Server: $SERVER_USER@$SERVER_IP"
echo "Remote directory: $REMOTE_DIR"
echo ""

# 1. Build frontend locally
echo "[1/5] Building frontend..."
cd frontend
npm install
npm run build
cd ..

# 2. Create deployment package
echo "[2/5] Creating deployment package..."
tar -czf fairworkers-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.db' \
  --exclude='logs' \
  backend/ \
  frontend/dist/ \
  Dockerfile \
  docker-compose.yml \
  .dockerignore \
  nginx.conf \
  .env.production

echo "Package size: $(du -h fairworkers-deploy.tar.gz | cut -f1)"

# 3. Upload to server
echo "[3/5] Uploading to server..."
scp fairworkers-deploy.tar.gz $SERVER_USER@$SERVER_IP:~/

# 4. Deploy on server
echo "[4/5] Deploying on server..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
  # Create directory
  mkdir -p /var/www/fairworkers
  cd /var/www/fairworkers

  # Extract
  tar -xzf ~/fairworkers-deploy.tar.gz

  # Setup .env if not exists
  if [ ! -f .env ]; then
    cp .env.production .env
    echo "⚠️  WARNING: Please edit .env file with production values!"
  fi

  # Check if Docker is installed
  if command -v docker &> /dev/null; then
    echo "Using Docker deployment..."
    docker-compose down
    docker-compose build
    docker-compose up -d
    echo "✅ Docker deployment complete!"
  else
    echo "Using PM2 deployment..."
    cd backend
    npm install --only=production
    pm2 restart fairworkers || pm2 start server.js --name fairworkers
    pm2 save
    echo "✅ PM2 deployment complete!"
  fi

  # Cleanup
  rm ~/fairworkers-deploy.tar.gz
ENDSSH

# 5. Health check
echo "[5/5] Health check..."
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP:3000/health || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo ""
  echo "========================================="
  echo "  ✅ DEPLOYMENT SUCCESSFUL!"
  echo "========================================="
  echo ""
  echo "Backend: http://$SERVER_IP:3000"
  echo "Frontend: http://$SERVER_IP"
  echo ""
  echo "Next steps:"
  echo "1. Point your domain to $SERVER_IP"
  echo "2. Setup SSL with Let's Encrypt"
  echo "3. Configure firewall"
  echo ""
else
  echo ""
  echo "⚠️  WARNING: Health check failed (HTTP $HTTP_CODE)"
  echo "Check server logs: ssh $SERVER_USER@$SERVER_IP 'docker-compose logs' or 'pm2 logs'"
  echo ""
fi

# Cleanup local files
rm fairworkers-deploy.tar.gz

echo "Deployment finished!"
