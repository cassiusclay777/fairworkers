# FairWorkers - Deployment Guide

## 🚀 Overview
This guide covers deploying FairWorkers to production:
- **Frontend**: Cloudflare Pages (fairworkers.dpdns.org)
- **Backend**: Railway.app (api.fairworkers.dpdns.org)
- **Database**: PostgreSQL on Railway

## 📋 Prerequisites
- [x] GitHub repository with FairWorkers code
- [x] Cloudflare account
- [x] Railway.app account
- [x] Custom domain: fairworkers.dpdns.org

---

## 🎯 Frontend Deployment (Cloudflare Pages)

### Step 1: Cloudflare Pages Setup
1. **Go to Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com/[ACCOUNT_ID]/workers-and-pages
   ```

2. **Create Application**
   - Click "Create application" → "Pages" → "Connect to Git"
   - Select your GitHub repository

3. **Configure Build Settings**
   ```
   Project name: fairworkers-frontend
   Production branch: main
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: frontend
   ```

4. **Environment Variables**
   Add these in Cloudflare Pages settings:
   ```
   VITE_API_URL = https://api.fairworkers.dpdns.org/api
   VITE_DEV_MODE = false
   ```

5. **Click "Save and Deploy"**

### Step 2: Custom Domain Setup
1. **After deployment**, go to project → "Custom domains"
2. **Click "Set up a custom domain"**
3. **Enter domain**: `fairworkers.dpdns.org`
4. **Cloudflare automatically creates DNS records**:
   ```
   Type: CNAME
   Name: fairworkers.dpdns.org
   Target: fairworkers-frontend.pages.dev
   Proxy: Enabled (orange cloud)
   ```

5. **SSL/TLS** automatically enabled

### Step 3: Automatic Deployments
- Every push to `main` branch = automatic redeploy
- Preview deployments for PRs
- Rollback available

---

## 🔧 Backend Deployment (Railway.app)

### Step 1: Railway Setup
1. **Go to Railway**
   ```
   https://railway.app
   ```

2. **Create New Project**
   - "Start a New Project" → "Deploy from GitHub repo"
   - Select FairWorkers repository

3. **Configure Settings**
   ```
   Root Directory: /backend
   Start Command: npm start
   ```

### Step 2: Database Setup
1. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically creates `DATABASE_URL`

2. **Environment Variables**
   Add these in Railway project settings:
   ```
   PORT = 3001
   JWT_SECRET = [generate strong random string]
   JWT_REFRESH_SECRET = [generate different strong random string]
   NODE_ENV = production
   DATABASE_URL = [automatically from PostgreSQL]
   ```

### Step 3: Custom Domain
1. **Go to Settings** → **Generate Domain**
2. **Set custom domain**: `api.fairworkers.dpdns.org`
3. **Railway provides target domain** (e.g., `up.app.railway.app`)

### Step 4: DNS Configuration
In Cloudflare DNS, add:
```
Type: CNAME
Name: api.fairworkers.dpdns.org
Target: [railway-generated-domain]
Proxy: Enabled
```

---

## 🗄️ Database Migration (SQLite → PostgreSQL)

### Migration Script
Run this script to migrate from SQLite to PostgreSQL:

```bash
# Install required packages
npm install pg sequelize

# Run migration script
cd backend
node scripts/migrate-to-postgres.js
```

### Manual Migration Steps
1. **Export SQLite data**:
   ```bash
   sqlite3 backend/fairworkers.db .dump > backup.sql
   ```

2. **Import to PostgreSQL**:
   ```bash
   psql $DATABASE_URL -f backup.sql
   ```

3. **Update database configuration** in `backend/config/database.js`

---

## 🔒 Environment Variables Checklist

### Frontend (Cloudflare Pages)
```env
VITE_API_URL=https://api.fairworkers.dpdns.org/api
VITE_DEV_MODE=false
```

### Backend (Railway)
```env
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
```

---

## 🧪 Testing Deployment

### Pre-Deployment Testing
```bash
# Frontend build test
cd frontend && npm run build

# Backend test
cd backend && npm run dev
# Check: http://localhost:3001/health

# CORS test
curl -H "Origin: https://fairworkers.dpdns.org" \
     -H "Access-Control-Request-Method: GET" \
     https://api.fairworkers.dpdns.org/health
```

### Post-Deployment Testing
1. **Frontend**: https://fairworkers.dpdns.org
   - [ ] Page loads without errors
   - [ ] SSL certificate valid (green lock)
   - [ ] Console shows no errors

2. **Backend**: https://api.fairworkers.dpdns.org/health
   - [ ] API responds with status OK
   - [ ] CORS headers present

3. **Integration Testing**
   - [ ] Login/Register flow works
   - [ ] Worker profiles load
   - [ ] AI Matchmaking functional
   - [ ] Real-time features work

---

## 🚨 Troubleshooting

### Common Issues

**Frontend Build Fails**
- Check `frontend/package.json` build script
- Verify all dependencies installed
- Check Vite configuration

**CORS Errors**
- Verify backend CORS configuration
- Check domain names in CORS origin list
- Test with curl command above

**Database Connection Issues**
- Verify `DATABASE_URL` format
- Check PostgreSQL connection string
- Test database connectivity

**SSL Certificate Issues**
- Wait for Cloudflare to provision certificates
- Check DNS propagation
- Verify domain ownership

---

## 📞 Support

### Cloudflare Pages
- Documentation: https://developers.cloudflare.com/pages/
- Status: https://www.cloudflarestatus.com/

### Railway.app
- Documentation: https://docs.railway.app/
- Support: support@railway.app

### FairWorkers
- Repository: https://github.com/[your-username]/fairworkers
- Issues: Create GitHub issue

---

## 🎉 Success Checklist

- [ ] Frontend deployed to Cloudflare Pages
- [ ] Custom domain configured
- [ ] Backend deployed to Railway
- [ ] PostgreSQL database connected
- [ ] DNS records configured
- [ ] SSL certificates active
- [ ] All features tested
- [ ] Monitoring set up

**Congratulations! 🚀 FairWorkers is now live in production!**
