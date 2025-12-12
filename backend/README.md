# FairWorkers Backend API

> Ethical adult platform backend with CCBill payment processing, Socket.IO real-time features, and comprehensive security.

## 🚀 Quick Start

### Development (Local)

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example and fill in values)
cp .env.example .env

# Run development server
npm run dev

# Server will start on http://localhost:3001
```

### Production Deployment

See [DEPLOYMENT-CHECKLIST.md](../DEPLOYMENT-CHECKLIST.md) for complete deployment guide.

## 📦 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase) / SQLite (dev)
- **ORM:** Sequelize
- **Authentication:** JWT + Refresh Tokens
- **Real-time:** Socket.IO
- **Payments:** CCBill (adult-friendly gateway)
- **Security:** Helmet, CORS, Rate Limiting
- **Compliance:** Age Verification (18+, 2257)

## 🏗️ Project Structure

```
backend/
├── config/
│   ├── database.js          # Database connection (PostgreSQL/SQLite)
│   ├── logger.js            # Winston logger
│   └── constants.js         # App constants
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── ccbill.js            # CCBill payment integration
│   └── ageVerification.js   # Age verification (18+)
├── routes/
│   ├── auth.js              # Registration, login, refresh
│   ├── ccbill-payments.js   # CCBill payment flow
│   ├── wallet.js            # Wallet management
│   ├── workers.js           # Worker profiles
│   ├── bookings.js          # Booking system
│   ├── albums.js            # Media albums
│   ├── community.js         # Community features
│   └── security.js          # Panic button, reports
├── db-models/
│   ├── User.js              # User model
│   ├── Wallet.js            # Wallet model with escrow
│   ├── Transaction.js       # Payment transactions
│   ├── WorshipFund.js       # Solidarity fund (0.5%)
│   ├── Booking.js           # Booking model
│   └── index.js             # Model associations
├── database/
│   └── migrations/          # Database migrations
├── server.js                # Main entry point
├── vercel.json              # Vercel deployment config
└── package.json
```

## 🔑 Key Features

### 1. CCBill Payment Integration
- **One-time payments** and **recurring subscriptions**
- **Escrow wallet system** (7-day payout cycle for workers)
- **Webhook handling** for payment confirmations
- **Anonymous billing descriptors** for user discretion
- **Solidarity fund** (0.5% of transactions)

### 2. Real-time Features (Socket.IO)
- **Live chat** with read receipts
- **Video calls** (WebRTC signaling)
- **Live streaming** with viewer count
- **Online user status**
- **Typing indicators**

### 3. Security & Compliance
- **Age verification** (18+ mandatory, Yoti integration ready)
- **2257 compliance** for adult content
- **JWT authentication** with refresh tokens
- **Rate limiting** (100 req/15min)
- **Helmet security headers**
- **CORS protection**

### 4. Booking System
- **Flexible scheduling** with time slots
- **Deposit-based reservations**
- **Automatic refunds** on cancellation
- **Worker earnings tracking**

### 5. Worker Tools
- **Escrow wallet** with automatic payouts
- **Commission tracking** (15% platform fee)
- **Bonus tiers** for high earners
- **Panic button** for safety
- **Private albums** with purchase tracking

## 🔧 Environment Variables

See `.env.example` for all available options.

### Critical Variables:

```bash
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret

# CCBill
CCBILL_CLIENT_ACCOUNT=123456
CCBILL_SUBACC=0000
CCBILL_SALT=your_salt
CCBILL_API_KEY=your_key
CCBILL_API_SECRET=your_secret

# URLs
API_URL=https://your-backend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login (returns JWT + refresh token)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### CCBill Payments
- `POST /api/payments/ccbill/initialize` - Start payment flow
- `GET /api/payments/ccbill/success` - Payment success redirect
- `GET /api/payments/ccbill/decline` - Payment declined redirect
- `POST /api/payments/ccbill/webhook` - CCBill webhook (signature verified)
- `GET /api/payments/ccbill/:transactionId` - Get transaction status

### Wallet
- `GET /api/wallet` - Get wallet info
- `POST /api/wallet/topup` - Top-up wallet (redirects to CCBill)
- `GET /api/wallet/transactions` - Transaction history
- `GET /api/wallet/balance` - Quick balance check

### Workers
- `GET /api/workers` - Browse workers (filters: online, category)
- `GET /api/workers/:id` - Worker profile
- `POST /api/workers/profile` - Create/update worker profile

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List user bookings
- `PATCH /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Albums
- `GET /api/albums` - Browse albums
- `POST /api/albums` - Create album (workers only)
- `POST /api/albums/:id/purchase` - Purchase album access

### Community
- `POST /api/community/follow/:workerId` - Follow worker
- `GET /api/community/feed` - Community feed
- `POST /api/community/stories` - Post story

### Security
- `POST /api/security/panic` - Trigger panic button
- `POST /api/security/report` - Report user/content
- `POST /api/security/block` - Block user

### Health
- `GET /health` - Health check + system stats

## 🔐 Authentication

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

Example:
```bash
curl -H "Authorization: Bearer eyJhbG..." http://localhost:3001/api/wallet
```

## 🗃️ Database Migrations

```bash
# Run migrations
npx sequelize-cli db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Create new migration
npx sequelize-cli migration:generate --name my-migration
```

## 📊 Scheduled Jobs

### Weekly Payout (Sunday 2 AM)
- Automatically pays out workers with `pending_balance >= 500 CZK`
- Creates payout transactions via CCBill API
- Logs all payouts for audit

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test health endpoint
curl http://localhost:3001/health
```

## 🐛 Debugging

```bash
# Check logs
npm run dev

# Vercel logs (production)
vercel logs --prod

# Check database connection
node -e "require('./config/database').testConnection()"
```

## 📈 Monitoring

### Metrics to Track:
- **API Response Times** (via Vercel Analytics)
- **Database Queries** (Supabase Dashboard)
- **CCBill Transactions** (CCBill Merchant Dashboard)
- **WebSocket Connections** (Socket.IO admin UI)

## 🚨 Security Best Practices

1. **Never commit** `.env` files to Git
2. **Rotate JWT secrets** regularly in production
3. **Use HTTPS only** in production
4. **Validate CCBill webhook signatures** (already implemented)
5. **Rate limit** sensitive endpoints (already implemented)
6. **Monitor failed login attempts**

## 📝 License

MIT

## 👥 Support

For issues or questions:
- Check [DEPLOYMENT-CHECKLIST.md](../DEPLOYMENT-CHECKLIST.md)
- Open an issue on GitHub
- Contact: support@fairworkers.com

---

**Built with ❤️ for ethical adult work**
