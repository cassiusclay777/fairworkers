# FairWorkers - Quick Start Guide

## ✅ Fáze 1 DOKONČENA!

Všechny základní komponenty pro authentication a databázovou integraci byly úspěšně implementovány.

## 🚀 Jak spustit projekt

### Předpoklady

1. **PostgreSQL** musí běžet na `localhost:5432`
2. **Node.js** verze 18+
3. **pnpm** verze 8+

### Krok 1: Nastavit PostgreSQL databázi

```bash
# Připojit se k PostgreSQL
psql -U postgres

# Vytvořit databázi
CREATE DATABASE fairworkers;

# Importovat schema
\c fairworkers
\i "fairworkers/backend/database/schema.sql"

# Nebo použít psql přímo:
psql -U postgres -d fairworkers -f "fairworkers/backend/database/schema.sql"
```

**DŮLEŽITÉ:** Pokud používáte jiné PostgreSQL heslo než `postgres`, upravte `.env` soubor v backend složce:
```env
DB_PASSWORD=vase_heslo_zde
```

### Krok 2: Nainstalovat dependencies

```bash
# Z root složky
pnpm install

# Nebo manuálně:
cd "fairworkers/backend"
pnpm install

cd ../frontend
pnpm install
```

### Krok 3: Spustit aplikaci

**Option A: Automatické spuštění (doporučeno)**
```bash
# Z root složky - spustí backend i frontend
pnpm dev
```

**Option B: Manuální spuštění**
```bash
# Terminál 1 - Backend
cd "fairworkers/backend"
node server.js

# Terminál 2 - Frontend
cd "fairworkers/frontend"
pnpm dev
```

### Krok 4: Testování

Otevřete v prohlížeči:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/health
- **Demo endpoint**: http://localhost:3000/api/demo/compare

## 🧪 Testování authentication

### Registrace nového uživatele

1. Klikněte na "Začít vydělávat" nebo "Registrovat se"
2. Vyplňte formulář:
   - Email: `test@example.com`
   - Heslo: `test12345` (min 8 znaků)
   - Role: Worker nebo Client
3. Klikněte "Vytvořit účet"

### Přihlášení

1. Klikněte na "Přihlásit se"
2. Použijte stejné údaje jako při registraci
3. Po přihlášení uvidíte své jméno v navigaci

### API Endpoints k testování

**Health check:**
```bash
curl http://localhost:3000/health
```

**Registrace:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@test.com",
    "password": "password123",
    "role": "worker",
    "username": "test_worker"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worker@test.com",
    "password": "password123"
  }'
```

**Get current user (vyžaduje token):**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get workers list:**
```bash
curl http://localhost:3000/api/workers
```

## ✅ Co bylo implementováno (Fáze 1)

### Backend
- ✅ PostgreSQL database connection (Sequelize)
- ✅ Sequelize modely (User, WorkerProfile, ClientProfile, Service, Booking)
- ✅ JWT Authentication system
- ✅ Authentication middleware (requireRole, authenticateToken, optionalAuth)
- ✅ Auth API routes (/register, /login, /me, /refresh, /logout)
- ✅ Workers routes propojené s databází
- ✅ Payments routes (kalkulační funkce)
- ✅ Security routes
- ✅ Community routes
- ✅ .env configuration
- ✅ Server auto-sync database models

### Frontend
- ✅ Axios instance s JWT interceptors
- ✅ AuthContext pro správu uživatelského stavu
- ✅ Register komponenta (plně funkční)
- ✅ Login komponenta (plně funkční)
- ✅ Integrované do App.jsx s conditional rendering
- ✅ Token refresh mechanismus
- ✅ Auto-redirect po registraci/loginu
- ✅ .env configuration

## 🔧 Troubleshooting

### Backend se nespustí
1. Zkontrolujte, že PostgreSQL běží: `psql -U postgres -c "SELECT version();"`
2. Zkontrolujte `.env` heslo pro databázi
3. Zkontrolujte console output pro konkrétní chyby

### Frontend se nespustí
1. Zkontrolujte, že dependencies jsou nainstalované: `pnpm install`
2. Zkontrolujte port 5173 není obsazený: `lsof -i :5173` (Mac/Linux) nebo `netstat -ano | findstr :5173` (Windows)

### Databáze se nepřipojí
1. Zkontrolujte PostgreSQL běží na portu 5432
2. Zkontrolujte databáze `fairworkers` existuje: `psql -U postgres -l`
3. Zkontrolujte heslo v `.env` souhlasí s PostgreSQL heslem

### CORS chyby
- Backend a frontend musí běžet současně
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## 📊 Co dělat dál

Backend je připraven na:
- Booking systém implementaci
- File upload (profilové fotky)
- Stripe platební integrace
- Email notifikace
- SMS safety alerts

Frontend potřebuje:
- Worker Dashboard
- Client Dashboard
- Booking flow UI
- Profile management UI
- Service management UI

## 🎉 Gratulujeme!

Fáze 1 (Foundation) je kompletní! Máte plně funkční authentication systém s JWT tokeny, databázovým připojením a základními API endpoints.
