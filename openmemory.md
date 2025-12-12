# FairWorkers - Project Guide

## Overview
FairWorkers je etická platforma pro modelky s férovou provizí 15% (oproti 40% u konkurence). Projekt kombinuje moderní webové technologie s důrazem na bezpečnost, transparentnost a férové podmínky pro pracovnice.

**Project ID:** Fashion77-max/fairworkers

## Architecture

### Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Socket.IO
- **Database:** SQLite (development) / PostgreSQL (production)
- **Real-time:** WebRTC video chat, live streaming, Socket.IO chat
- **Authentication:** JWT tokens + refresh tokens
- **File Storage:** Local uploads with image processing

### Project Structure
```
fairworkers/
├── backend/                 # Express API server
│   ├── config/             # Database, logger, constants
│   ├── db-models/          # Sequelize models
│   ├── middleware/         # Auth, rate limiting, upload
│   ├── models/             # Business logic models
│   ├── routes/             # API endpoints
│   ├── scripts/            # Database seeding
│   └── uploads/            # File storage
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # Auth context
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # API client, utilities
└── apk/                    # Android app (separate project)
```

## User Defined Namespaces
- [Leave blank - user populates]

## Components

### Backend Core Components
- **Authentication System** - JWT-based auth with refresh tokens
- **Worker Management** - Profile management, availability, ratings
- **Payment System** - Wallet, transactions, payouts
- **Booking System** - Service reservations and scheduling
- **Real-time Communication** - Chat, video calls, live streaming
- **Media Management** - Albums, stories, file uploads
- **Security System** - Rate limiting, input sanitization, panic button

### Frontend Core Components
- **Landing Page** - Hero section, calculator, benefits showcase
- **Authentication** - Login/Register modals with form validation
- **Worker Directory** - Profile cards with filtering and search
- **Dashboard** - Analytics and management for workers
- **Real-time Features** - Chat, video calls, live streaming
- **Media Components** - Albums, stories, wishlist
- **Booking System** - Service booking flow

## Patterns

### API Design Pattern
- RESTful endpoints with consistent error handling
- JWT authentication middleware
- Input validation and sanitization
- Rate limiting for security
- File upload with processing

### Frontend Architecture
- Context-based state management (AuthContext)
- Lazy loading for performance optimization
- Responsive design with Tailwind CSS
- Component-based architecture with hooks
- Error boundaries for graceful error handling

### Real-time Communication
- Socket.IO for chat and notifications
- WebRTC for video calls and streaming
- Room-based architecture for streams
- Active user tracking

### Database Schema
- **Users** - Base user accounts with roles
- **WorkerProfiles** - Extended worker information
- **Bookings** - Service reservations
- **Messages** - Chat history
- **Albums** - Media collections
- **Transactions** - Payment records
- **Ratings** - User reviews

## Key Features

### Core Business Value
- **15% Commission** - Significantly lower than industry standard (40%)
- **Transparent Pricing** - Clear earnings calculator
- **Fast Payouts** - 7-day payment processing
- **Safety Features** - Panic button, verification system

### Technical Features
- **Real-time Chat** - Instant messaging between users
- **Video Calls** - WebRTC-based private calls
- **Live Streaming** - Real-time content streaming
- **Media Management** - Albums, stories, wishlist
- **Analytics** - Performance tracking and insights
- **Mobile Responsive** - Optimized for all devices

## Development Workflow

### Setup
1. Backend: `cd backend && npm install`
2. Frontend: `cd frontend && npm install`
3. Database: SQLite auto-created, schema in `backend/database/schema.sql`
4. Environment: Copy `.env.example` to `.env`

### Running
- Backend: `npm run dev` (port 3001)
- Frontend: `npm run dev` (port 5173)
- Production: Docker deployment available

### Testing
- API endpoints documented in `API-OVERVIEW.md`
- Health check: `/health`
- Demo comparison: `/api/demo/compare`

## Security Considerations
- JWT token authentication
- Input sanitization for XSS protection
- Rate limiting on API endpoints
- File upload security checks
- SQL injection prevention via Sequelize ORM
- CORS configuration for frontend access

## Deployment
- Docker containerization available
- Cloudflare deployment scripts
- Environment-based configuration
- Static file serving in production

## Current Status
✅ **Completed:**
- Full backend API with authentication
- Frontend landing page with calculator
- Real-time chat and video call infrastructure
- Database models and relationships
- Basic worker profiles and booking system
- Frontend API integration (authentication + worker list)
- Worker list API connected to frontend
- Demo data seeding script ready

🚧 **In Progress:**
- Enhanced UI/UX features
- Production deployment preparation

📋 **Next Steps:**
- Implement booking flow integration
- Add payment system integration
- Test real-time features
- Deploy to production
