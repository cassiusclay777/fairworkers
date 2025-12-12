# ⚡ Quick Deploy Guide

Nejrychlejší způsob jak dostat FairWorkers na server za 5 minut.

## 🎯 Option 1: Docker (NEJJEDNODUŠŠÍ)

### Co potřebuješ:
- VPS server (Ubuntu/Debian)
- SSH přístup
- Doménu nasměrovanou na server IP

### Krok za krokem:

```bash
# 1. Na LOKÁLNÍM PC - přejmenuj projekt
cd c:\Users\patri\AppData\Local\Temp\apk-editor-studio\apk
mv fairworkers fairworkers-prod

# 2. Zkopíruj na server
scp -r fairworkers-prod root@tvuj-server.cz:~/

# 3. Připoj se na server
ssh root@tvuj-server.cz

# 4. Nainstaluj Docker (pokud ještě nemáš)
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin

# 5. Vygeneruj bezpečné klíče
cd ~/fairworkers-prod
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# 6. Uprav .env soubor
cp .env.production .env
nano .env

# Změň tyto hodnoty:
# API_URL=https://tvuj-server.cz
# FRONTEND_URL=https://tvuj-server.cz
# JWT_SECRET=<vygenerovaný klíč>
# JWT_REFRESH_SECRET=<vygenerovaný klíč>
# SESSION_SECRET=<vygenerovaný klíč>

# 7. Spusť aplikaci
docker-compose up -d

# 8. Zkontroluj že běží
docker ps
curl http://localhost:3000/health

# 9. SSL certifikát (HTTPS)
apt install certbot
certbot certonly --standalone -d tvuj-server.cz
# Certifikáty budou v /etc/letsencrypt/live/tvuj-server.cz/

# 10. Uprav docker-compose.yml - změň nginx volumes na:
#   - /etc/letsencrypt/live/tvuj-server.cz:/etc/nginx/ssl:ro

# 11. Restart s Nginx
docker-compose down
docker-compose up -d

# 12. Otevři firewall
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

**HOTOVO!** Aplikace běží na `https://tvuj-server.cz`

---

## 🚀 Option 2: Klasický Deploy (bez Dockeru)

### Příprava serveru:

```bash
# 1. Připoj se na server
ssh root@tvuj-server.cz

# 2. Nainstaluj Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 3. Nainstaluj PM2
npm install -g pm2

# 4. Nainstaluj Nginx
apt install -y nginx certbot python3-certbot-nginx
```

### Deploy aplikace:

```bash
# 5. Vytvoř složku
mkdir -p /var/www/fairworkers
cd /var/www/fairworkers

# 6. Na LOKÁLNÍM PC - zkompiluj frontend
cd c:\Users\patri\AppData\Local\Temp\apk-editor-studio\apk\fairworkers\frontend
npm install
npm run build
# Výsledek je v dist/ složce

# 7. Nahraj na server (z lokálního PC)
scp -r backend root@tvuj-server.cz:/var/www/fairworkers/
scp -r frontend/dist root@tvuj-server.cz:/var/www/fairworkers/public
scp .env.production root@tvuj-server.cz:/var/www/fairworkers/backend/.env

# 8. Na serveru - nainstaluj backend dependencies
cd /var/www/fairworkers/backend
npm install --only=production

# 9. Uprav .env
nano .env
# Změň API_URL, JWT_SECRET atd. (viz Option 1)

# 10. Spusť backend s PM2
pm2 start server.js --name fairworkers
pm2 save
pm2 startup  # Auto-start při restartu serveru

# 11. Nastav Nginx
nano /etc/nginx/sites-available/fairworkers
```

Vlož tuto konfiguraci:

```nginx
server {
    listen 80;
    server_name tvuj-server.cz;

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000;
    }

    # Frontend
    location / {
        root /var/www/fairworkers/public;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# 12. Aktivuj Nginx config
ln -s /etc/nginx/sites-available/fairworkers /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 13. Získej SSL certifikát
certbot --nginx -d tvuj-server.cz

# 14. Otevři firewall
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

**HOTOVO!** Aplikace běží na `https://tvuj-server.cz`

---

## 🔐 Po Deploymentu - DŮLEŽITÉ!

### 1. Změň demo hesla
```bash
# Přihlaš se do aplikace a změň hesla pro:
petra.k@fairworkers.com
lucie.m@fairworkers.com
# atd... nebo smaž demo účty
```

### 2. Nastav automatické backupy
```bash
# Vytvoř backup script
nano /root/backup-fairworkers.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p /root/backups

# Docker
docker cp fairworkers-app:/app/fairworkers.db /root/backups/db_$DATE.db

# Nebo PM2
cp /var/www/fairworkers/backend/fairworkers.db /root/backups/db_$DATE.db

# Smaž staré backupy (>30 dní)
find /root/backups -name "*.db" -mtime +30 -delete
```

```bash
chmod +x /root/backup-fairworkers.sh

# Přidej do cronu (každý den ve 3:00)
crontab -e
# Přidej řádek:
0 3 * * * /root/backup-fairworkers.sh
```

### 3. Monitoring
```bash
# Sleduj logy

# Docker:
docker-compose logs -f

# PM2:
pm2 logs fairworkers
pm2 monit

# Nginx:
tail -f /var/log/nginx/access.log
```

### 4. Updates
```bash
# Docker:
cd ~/fairworkers-prod
git pull  # pokud používáš git
docker-compose down
docker-compose build
docker-compose up -d

# PM2:
cd /var/www/fairworkers/backend
git pull
npm install --only=production
pm2 restart fairworkers
```

---

## 🆘 Troubleshooting

### Backend neběží
```bash
# Docker:
docker-compose logs fairworkers

# PM2:
pm2 logs fairworkers
```

### Port 3000 obsazený
```bash
lsof -i :3000
kill -9 <PID>
```

### Nginx 502 Bad Gateway
```bash
# Zkontroluj že backend běží
curl http://localhost:3000/health

# Restartuj backend
docker-compose restart  # nebo pm2 restart fairworkers
```

### SSL certifikát nefunguje
```bash
# Zkontroluj certbot
certbot certificates

# Obnov certifikát
certbot renew

# Test auto-renewal
certbot renew --dry-run
```

---

## 📊 Užitečné příkazy

```bash
# Status aplikace
docker ps                    # Docker
pm2 status                   # PM2

# Restart
docker-compose restart       # Docker
pm2 restart fairworkers      # PM2

# Stop
docker-compose down          # Docker
pm2 stop fairworkers         # PM2

# Logy
docker-compose logs -f       # Docker
pm2 logs fairworkers         # PM2

# CPU/RAM usage
docker stats                 # Docker
pm2 monit                    # PM2

# Backup databáze
docker cp fairworkers-app:/app/fairworkers.db ./backup.db
```

---

**Potřebuješ pomoc?** Detailní deployment guide je v [DEPLOYMENT.md](DEPLOYMENT.md)
