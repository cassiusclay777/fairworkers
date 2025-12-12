# FairWorkers Deployment Checklist

## ✅ DOKONČENO - Přehled implementace

### 1. CCBill Payment Integration
- ✅ Vytvořen `backend/middleware/ccbill.js` - CCBill middleware pro generování platebních odkazů a verifikaci
- ✅ Vytvořen `backend/routes/ccbill-payments.js` - Kompletní payment flow s webhook support
- ✅ Odstraněna Stripe závislost z `package.json`
- ✅ Aktualizovány Transaction modely pro podporu CCBill

### 2. Database Setup
- ✅ Aktualizován `backend/config/database.js` pro podporu PostgreSQL (Supabase) i SQLite (dev)
- ✅ Vytvořeny migrace:
  - `20251212000001-create-transactions.js`
  - `20251212000002-create-wallets.js`
  - `20251212000003-create-worship-fund.js`
- ✅ Vytvořen `backend/db-models/WorshipFund.js` model
- ✅ Aktualizován `backend/db-models/Wallet.js` s pending_balance a total_earned

### 3. Security & Compliance
- ✅ Vytvořen `backend/middleware/ageVerification.js` - Age verification (18+, 2257 compliance)
- ✅ Aktualizován `backend/middleware/auth.js` s authenticate alias

### 4. Server Configuration
- ✅ Aktualizován `backend/server.js` s CCBill routes
- ✅ Vytvořen `backend/vercel.json` pro Vercel deployment
- ✅ Vytvořeny `.env` soubory pro backend a frontend

### 5. Dependencies
- ✅ Přidány do package.json:
  - `axios` - Pro HTTP requesty (CCBill API)
  - `node-cron` - Pro scheduled payouts
  - `redis` - Pro Socket.IO scaling
- ✅ Odstraněn `stripe`
- ✅ Spuštěn `npm install`

### 6. Testing
- ✅ Server běží lokálně bez chyb
- ✅ Databáze úspěšně připojena a synchronizována

---

## 🚀 DEPLOYMENT STEPS

### Krok 1: Supabase Database Setup

1. Přejděte na [supabase.com](https://supabase.com)
2. Vytvořte nový projekt (vyberte EU region)
3. Zkopírujte DATABASE_URL z Project Settings → Database → Connection string
4. Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Krok 2: CCBill Account Setup

1. Přejděte na [ccbill.com](https://ccbill.com)
2. Zaregistrujte merchant účet (vyplňte informace o adult content platformě)
3. Po schválení získejte z CCBill dashboardu:
   - `CCBILL_CLIENT_ACCOUNT` (např. 123456)
   - `CCBILL_SUBACC` (sub-account, obvykle 0000)
   - `CCBILL_SALT` (webhook signature salt)
   - `CCBILL_API_KEY` (API credentials)
   - `CCBILL_API_SECRET`

### Krok 3: Redis Setup (Optional ale doporučené pro production)

1. Přejděte na [upstash.com](https://upstash.com)
2. Vytvořte Redis database
3. Zkopírujte REDIS_URL

### Krok 4: Nastavení Environment Variables

#### Backend (.env)
```bash
NODE_ENV=production
PORT=3001
API_URL=https://your-backend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long
JWT_REFRESH_SECRET=your_refresh_secret_also_32_chars

# CCBill (Replace with real values!)
CCBILL_CLIENT_ACCOUNT=123456
CCBILL_SUBACC=0000
CCBILL_SALT=your_real_salt
CCBILL_API_KEY=your_real_api_key
CCBILL_API_SECRET=your_real_api_secret
CCBILL_API_URL=https://api.ccbill.com/api/3.0

# Redis (optional)
REDIS_URL=redis://user:password@redis.upstash.io:12345

# Platform Settings
PLATFORM_COMMISSION_RATE=0.15
MINIMUM_PAYOUT_AMOUNT=500
SOLIDARITY_FUND_RATE=0.005
```

#### Frontend (.env)
```bash
VITE_API_URL=https://your-backend.vercel.app/api
VITE_DEV_MODE=false
```

### Krok 5: Spuštění Database Migrations (Production)

```bash
cd backend
NODE_ENV=production npx sequelize-cli db:migrate
```

### Krok 6: Deploy na Vercel

#### Backend Deployment:

```bash
cd backend
npm install -g vercel
vercel login
vercel --prod
```

Během deploymentu nastavte environment variables:
- Vercel CLI se zeptá na environment variables
- Nebo je nastavte přes Vercel dashboard: Project Settings → Environment Variables

#### Důležité Vercel Environment Variables:
```
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
CCBILL_CLIENT_ACCOUNT
CCBILL_SUBACC
CCBILL_SALT
CCBILL_API_KEY
CCBILL_API_SECRET
REDIS_URL
API_URL (nastavte na váš Vercel backend URL)
FRONTEND_URL (nastavte na váš frontend URL)
NODE_ENV=production
```

#### Frontend Deployment:

```bash
cd frontend
vercel --prod
```

### Krok 7: Configure CCBill Webhooks

1. V CCBill dashboardu jděte na Webhooks/IPN
2. Nastavte webhook URL: `https://your-backend.vercel.app/api/payments/ccbill/webhook`
3. Aktivujte následující události:
   - `charge_approved`
   - `charge_declined`
   - `subscription_created`
   - `subscription_cancelled`

### Krok 8: Test Payment Flow

1. POST `/api/payments/ccbill/initialize` s valid JWT tokenem
2. Otestujte platbu přes CCBill test sandbox
3. Ověřte, že webhook správně aktualizuje transakce

---

## 🔍 PRODUCTION MONITORING

### Health Check Endpoints:
- Backend: `https://your-backend.vercel.app/health`

### Logs:
```bash
vercel logs --prod
```

### CCBill Dashboard:
- Sledujte transakce v real-time
- Kontrolujte webhook delivery status

---

## 📝 DŮLEŽITÉ POZNÁMKY

### CCBill Compliance:
- ✅ Anonymous billing descriptors aktivovány (discretion)
- ✅ Age verification middleware implementováno (2257 compliance)
- ✅ Escrow wallet system (7denní payout cycle)

### Security:
- ✅ Helmet middleware pro security headers
- ✅ Rate limiting aktivní
- ✅ JWT authentication s refresh tokens
- ✅ Webhook signature verification

### Scaling:
- Redis adapter připraven pro Socket.IO
- Vercel automaticky scaluje backend funkce
- Database connection pooling nakonfigurováno

---

## 🐛 TROUBLESHOOTING

### Problem: "Cannot connect to database"
**Solution:** Zkontrolujte DATABASE_URL v Vercel environment variables

### Problem: "CCBill webhook signature invalid"
**Solution:** Ověřte, že CCBILL_SALT je správný v Vercel env vars

### Problem: "Module not found"
**Solution:** Spusťte `npm install` znovu a push změny

### Problem: "Port already in use" (local dev)
**Solution:** V `.env` změňte PORT na jiný (např. 3002)

---

## ✅ DEPLOYMENT CHECKLIST

```
[ ] Supabase project vytvořen a DATABASE_URL získán
[ ] CCBill merchant account schválen a credentials získány
[ ] Redis database vytvořena (optional)
[ ] Backend .env soubor nakonfigurován s production values
[ ] Frontend .env soubor nakonfigurován
[ ] Database migrations spuštěny na production DB
[ ] Backend deploynut na Vercel
[ ] Frontend deploynut na Vercel
[ ] Vercel environment variables nastaveny
[ ] CCBill webhooks nakonfigurovány
[ ] Payment flow otestován v sandbox
[ ] Health check endpoints fungují
[ ] Age verification testováno
[ ] Payout cron job ověřen (Sunday 2 AM)
```

---

## 📞 SUPPORT

- CCBill Support: support@ccbill.com
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support

---

**🎉 Gratulujeme! FairWorkers backend je nyní připraven pro produkční nasazení s CCBill payment processing!**
