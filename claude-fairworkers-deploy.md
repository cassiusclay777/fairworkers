# FairWorkers Backend Deployment Prompt for Claude Desktop

```
/clear
```

Jsi expert na Node.js/Express/Sequelize/Docker deployment a payment gateway integrace. Mám hotový **FairWorkers backend** - komplexní REST API s JWT autentifikací, Socket.IO real-time chat, WebRTC video hovory, wallet systém s escrow, booking systém, bezpečnostní features (panic button, 2FA, blocks/reports). Stack: Node.js, Express.js, Sequelize ORM, PostgreSQL, Socket.IO, WebRTC. Vše je na GitHub.

**KRITICKÉ OMEZENÍ**: Stripe ZAKAZUJE adult content (pornography, escorts, pay-per-view, live cams, sexual services). Projekt je erotická platforma (15% provize) - musíme nahradit Stripe za **CCBill** (high-risk gateway speciálně pro adult/NSFW content).

## CÍЛЬ PROJEKTU (Do 4 hodin)
Nasadit funkční MVP na produkci s reálnými platbami, age verification a compliance. Backend musí být:
- ✅ Live na Vercel / Railway / Cloudflare
- ✅ Database: Supabase PostgreSQL (EU, free tier)
- ✅ CCBill payment processing (místo Stripe)
- ✅ Socket.IO + Redis adapter pro scalování
- ✅ Age verification middleware (2257 compliance)
- ✅ Anonymous billing descriptors pro diskrétnost
- ✅ Wallet escrow: 7denní cyklus výplat

---

## ČÁST 1: NAHRAZENÍ STRIPE → CCBILL

### 1.1 Odstraň všechny Stripe reference
```bash
# V project struktuře:
src/
├── middleware/
│   ├── stripe.js          # ← DELETE
│   ├── ccbill.js          # ← CREATE (viz níže)
├── routes/
│   ├── payments.js        # ← REWRITE (Stripe → CCBill)
├── models/
│   ├── Transaction.js     # Zachej, jen update fieldy
```

### 1.2 Nový soubor: `src/middleware/ccbill.js`
```javascript
const crypto = require('crypto');
const axios = require('axios');

const CCBILL_API_URL = 'https://api.ccbill.com/api/3.0';
const CCBILL_BILLING_URL = 'https://billing.ccbill.com/do/express/express.php';

// Verify incoming webhook signature from CCBill
const verifyCCBillSignature = (req) => {
  const { clientAccno, clientSubacc, initialPrice, salt } = req.body;
  const hashStr = `${clientAccno}:${clientSubacc}:${initialPrice}`;
  const signature = crypto.createHmac('md5', process.env.CCBILL_SALT)
    .update(hashStr)
    .digest('hex');
  
  return signature === req.headers['x-ccbill-signature'];
};

// Generate CCBill subscription/transaction link
const generateCCBillLink = async (userId, amount, description, subscriptionDays = 0) => {
  const params = {
    clientAccno: process.env.CCBILL_CLIENT_ACCOUNT,
    clientSubacc: process.env.CCBILL_SUBACC,
    currency: 'CZK', // Czech Koruna
    initialPrice: amount,
    recurringPrice: subscriptionDays ? amount : 0,
    recurringPeriod: subscriptionDays || 0,
    description: description,
    redirectUrl: `${process.env.API_URL}/api/payments/ccbill/success`,
    declineUrl: `${process.env.API_URL}/api/payments/ccbill/decline`,
    salt: process.env.CCBILL_SALT,
    userId: userId, // Custom field for tracking
    anonymous: 1, // Anonymous billing
    disableOtherCC: 0, // Allow other payment methods
  };

  // Generate signature
  const hashStr = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  
  const signature = crypto.createHmac('sha256', process.env.CCBILL_SALT)
    .update(hashStr)
    .digest('hex');
  
  const url = `${CCBILL_BILLING_URL}?${new URLSearchParams(params).toString()}&signature=${signature}`;
  return url;
};

// Verify completed payment via CCBill API
const verifyPaymentWithCCBill = async (transactionId) => {
  try {
    const response = await axios.get(
      `${CCBILL_API_URL}/transactions/${transactionId}`,
      {
        auth: {
          username: process.env.CCBILL_API_KEY,
          password: process.env.CCBILL_API_SECRET,
        }
      }
    );
    return response.data.transaction;
  } catch (error) {
    console.error('CCBill verification error:', error);
    return null;
  }
};

module.exports = {
  verifyCCBillSignature,
  generateCCBillLink,
  verifyPaymentWithCCBill,
};
```

### 1.3 Nový soubor: `src/routes/ccbill-payments.js`
```javascript
const express = require('express');
const router = express.Router();
const { User, Wallet, Transaction, WorshipFund } = require('../models');
const { 
  verifyCCBillSignature, 
  generateCCBillLink, 
  verifyPaymentWithCCBill 
} = require('../middleware/ccbill');
const { authenticate } = require('../middleware/auth');
const cron = require('node-cron');

// 1. INITIATE PAYMENT - redirect ke CCBill
router.post('/initialize', authenticate, async (req, res) => {
  try {
    const { amount, type, serviceId } = req.body; // type: 'credit_topup' | 'booking_deposit'
    
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Min amount: 100 CZK' });
    }

    // Create pending transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      amount: amount,
      type: type,
      status: 'pending',
      gateway: 'ccbill',
      serviceId: serviceId,
    });

    // Generate CCBill payment link
    const paymentUrl = await generateCCBillLink(
      req.user.id,
      amount,
      `FairWorkers ${type}`,
      0 // One-time payment, no recurring
    );

    res.json({
      transactionId: transaction.id,
      paymentUrl: paymentUrl,
      amount: amount,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ error: 'Payment setup failed' });
  }
});

// 2. SUCCESS REDIRECT - CCBill redirects here after payment
router.get('/success', async (req, res) => {
  try {
    const { transactionId, approval } = req.query;
    
    if (!approval) {
      return res.redirect(`${process.env.FRONTEND_URL}/payments/failed`);
    }

    // Verify payment with CCBill API
    const payment = await verifyPaymentWithCCBill(transactionId);
    if (!payment || payment.status !== 'approved') {
      return res.redirect(`${process.env.FRONTEND_URL}/payments/failed`);
    }

    // Update transaction
    const transaction = await Transaction.findByPk(transactionId);
    await transaction.update({ status: 'completed', ccbillRef: payment.id });

    // Credit wallet
    const wallet = await Wallet.findOne({ where: { userId: transaction.userId } });
    await wallet.increment('balance', { by: transaction.amount });

    // 0.5% solidarity fund
    const solidarityAmount = Math.round(transaction.amount * 0.005);
    await WorshipFund.create({
      amount: solidarityAmount,
      fromTransactionId: transaction.id,
      type: 'platform_fee',
    });

    res.redirect(`${process.env.FRONTEND_URL}/payments/success?transactionId=${transactionId}`);
  } catch (error) {
    console.error('Payment success error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payments/error`);
  }
});

// 3. DECLINE REDIRECT
router.get('/decline', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/payments/declined`);
});

// 4. WEBHOOK - CCBill sends updates here
router.post('/webhook', async (req, res) => {
  try {
    if (!verifyCCBillSignature(req)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { eventType, transactionId, amount, status } = req.body;

    if (eventType === 'charge_approved') {
      const transaction = await Transaction.findByPk(transactionId);
      if (transaction && transaction.status === 'pending') {
        await transaction.update({ status: 'completed' });

        // Credit wallet immediately
        const wallet = await Wallet.findOne({ where: { userId: transaction.userId } });
        await wallet.increment('balance', { by: amount });
      }
    }

    if (eventType === 'charge_declined') {
      await Transaction.update(
        { status: 'failed' },
        { where: { id: transactionId } }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// 5. GET TRANSACTION STATUS
router.get('/:transactionId', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.transactionId);
    
    if (!transaction || transaction.userId !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// 6. SCHEDULED PAYOUT (cron) - Every 7 days
cron.schedule('0 2 * * 0', async () => {
  console.log('[PAYOUT] Running weekly payout cycle...');
  try {
    const workers = await User.findAll({ where: { role: 'worker' } });
    
    for (const worker of workers) {
      const wallet = await Wallet.findOne({ where: { userId: worker.id } });
      
      if (wallet.pending_balance >= 500) { // Min 500 CZK for payout
        // Create payout transaction via CCBill API
        const payout = await axios.post(
          `${CCBILL_API_URL}/payouts`,
          {
            amount: wallet.pending_balance,
            bankAccount: worker.bankAccount, // Worker must set this in profile
            currency: 'CZK',
          },
          {
            auth: {
              username: process.env.CCBILL_API_KEY,
              password: process.env.CCBILL_API_SECRET,
            }
          }
        );

        // Update wallet
        await wallet.decrement('pending_balance', { by: wallet.pending_balance });
        await Transaction.create({
          userId: worker.id,
          amount: wallet.pending_balance,
          type: 'payout',
          status: 'completed',
          gateway: 'ccbill',
          ccbillRef: payout.data.payoutId,
        });

        console.log(`[PAYOUT] Paid out ${wallet.pending_balance} CZK to worker ${worker.id}`);
      }
    }
  } catch (error) {
    console.error('[PAYOUT] Error:', error);
  }
});

module.exports = router;
```

---

## ČÁST 2: ENVIRONMENT VARIABLES (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_password
POSTGRES_DB=fairworkers

# JWT & Security
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# CCBill Integration (CRITICAL)
CCBILL_CLIENT_ACCOUNT=12345
CCBILL_SUBACC=0
CCBILL_SALT=your_ccbill_salt_from_dashboard
CCBILL_API_KEY=your_api_key
CCBILL_API_SECRET=your_api_secret

# URLs
API_URL=https://your-app.vercel.app
FRONTEND_URL=https://your-frontend-domain.com

# Redis (for Socket.IO + scaling)
REDIS_URL=redis://user:password@redis.upstash.io:12345

# Age Verification (Yoti integration - optional but recommended for compliance)
YOTI_CLIENT_SDK_ID=your_yoti_sdk_id
YOTI_PEM_FILE_PATH=./certs/yoti_private.pem

# File Upload (AWS S3 or similar)
AWS_S3_BUCKET=fairworkers-media
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Email Service (SendGrid or similar)
SENDGRID_API_KEY=your_key

# Node environment
NODE_ENV=production
PORT=3001
```

---

## ČÁST 3: DEPLOYMENT NA VERCEL

### 3.1 Nový soubor: `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb",
        "runtime": "nodejs20.x"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "CCBILL_CLIENT_ACCOUNT": "@ccbill_client_account",
    "CCBILL_SUBACC": "@ccbill_subacc",
    "CCBILL_SALT": "@ccbill_salt",
    "CCBILL_API_KEY": "@ccbill_api_key",
    "CCBILL_API_SECRET": "@ccbill_api_secret",
    "REDIS_URL": "@redis_url",
    "API_URL": "https://your-app.vercel.app",
    "NODE_ENV": "production"
  }
}
```

### 3.2 Nový soubor: `package.json` (ensure dependencies)
```json
{
  "name": "fairworkers-backend",
  "version": "1.0.0",
  "description": "Ethical adult platform backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "sequelize-cli db:migrate",
    "migrate:prod": "NODE_ENV=production sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.2",
    "pg": "^8.11.3",
    "socket.io": "^4.7.2",
    "socket.io-redis": "^6.1.1",
    "jsonwebtoken": "^9.1.2",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2",
    "node-cron": "^3.0.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "redis": "^4.6.11",
    "multer": "^1.4.5-lts.1",
    "aws-sdk": "^2.1572.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "sequelize-cli": "^6.6.2"
  }
}
```

### 3.3 Aktualizuj `server.js` - přidej CCBill routes
```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
  adapter: require('socket.io-redis'),
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workers', require('./routes/workers'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/payments/ccbill', require('./routes/ccbill-payments')); // ← NEW
app.use('/api/wallet', require('./routes/wallet'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

server.listen(process.env.PORT || 3001, () => {
  console.log(`FairWorkers API running on port ${process.env.PORT || 3001}`);
});
```

---

## ČÁST 4: SUPABASE SETUP (Database)

### 4.1 Sequelize config: `config/database.js`
```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

module.exports = sequelize;
```

### 4.2 Create migrations (if not exists)
```bash
npx sequelize-cli migration:generate --name create-transactions
npx sequelize-cli migration:generate --name create-wallets
npx sequelize-cli migration:generate --name create-worship-fund
```

Migration example: `migrations/XXXXXX-create-transactions.js`
```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      userId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      type: { type: Sequelize.ENUM('credit_topup', 'booking_deposit', 'payout', 'service_payment'), allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
      gateway: { type: Sequelize.STRING, defaultValue: 'ccbill' },
      ccbillRef: { type: Sequelize.STRING },
      serviceId: { type: Sequelize.UUID },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('transactions');
  }
};
```

---

## ČÁST 5: COMPLIANCE & SECURITY

### 5.1 Age verification middleware: `middleware/ageVerification.js`
```javascript
const axios = require('axios');

const ageVerificationRequired = async (req, res, next) => {
  const user = req.user;
  
  // Skip if already verified
  if (user.ageVerified && user.ageVerifiedAt > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) {
    return next();
  }

  // Redirect to Yoti verification flow
  if (process.env.YOTI_CLIENT_SDK_ID) {
    return res.json({
      requiresVerification: true,
      yotiSDKId: process.env.YOTI_CLIENT_SDK_ID,
      redirectUrl: `https://your-app.vercel.app/verify/age?token=${user.id}`,
    });
  }

  return res.status(403).json({ error: 'Age verification required' });
};

module.exports = { ageVerificationRequired };
```

### 5.2 Anonymous billing descriptors (GDPR/discretion)
```javascript
// In CCBill payment link generation, use:
description: 'FW Services' // instead of 'FairWorkers Adult Services'
anonymous: 1 // Hide company name in billing statement
```

---

## ČÁST 6: DEPLOYMENT CHECKLIST

```
[ ] 1. Supabase account: supabase.com → New Project → Copy DATABASE_URL
[ ] 2. CCBill account: ccbill.com → Merchant signup → Get API credentials
[ ] 3. Redis setup: Upstash.com → Create database → Copy REDIS_URL
[ ] 4. .env file: Copy-paste all vars from ČÁST 2
[ ] 5. Replace Stripe routes with CCBill routes (ČÁST 1)
[ ] 6. npm install (install all new dependencies)
[ ] 7. npx sequelize-cli db:migrate --env production
[ ] 8. Vercel CLI: vercel login → vercel
[ ] 9. Set secrets: vercel env add DATABASE_URL → paste → enter secrets
[ ] 10. Deploy: git push → Vercel auto-deploys
[ ] 11. Test payment flow: POST /api/payments/ccbill/initialize
[ ] 12. Monitor webhooks: CCBill dashboard → verify /api/payments/ccbill/webhook
[ ] 13. Test payout cron: Check logs every Sunday 2 AM CET
```

---

## ČÁST 7: QUICK START COMMANDS

```bash
# Install all deps
npm install

# Create .env from template
cp .env.example .env
# Edit .env with real values

# Run migrations (local)
npx sequelize-cli db:migrate

# Test locally
npm run dev
# Visit: http://localhost:3001/health

# Deploy to Vercel
npm install -g vercel
vercel login
vercel --prod

# Monitor in production
vercel logs --prod
```

---

## POZNÁMKY PRO CLAUDEA

- CCBill je JEDINÁ volba pro adult business v ČR s EU zásahu
- Stripe MUSÍ být odstraněn – je to mandatory compliance
- Escrow wallet systém = legitimita + trust u modelek
- Payout cron musí běžet automaticky každý týden (Sunday 2 AM UTC)
- Age verification je povinná (2257 compliance)
- Anonymous billing je kritické pro user retention (diskrétnost)
- Socket.IO + Redis adapter je povinný pro scale (room chat, video hangouts)

**Dej si čas s testováním webhook signatury z CCBill – je to nejčastější bug.** 🚀

---

**Vygenerováno: Prosinec 2025 | FairWorkers Backend Deployment v1**
