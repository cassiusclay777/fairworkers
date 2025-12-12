// Application-wide constants

// Commission and payment constants
const PLATFORM_COMMISSION_RATE = 0.15; // 15% commission
const MAX_WALLET_TOPUP = 50000; // 50,000 CZK maximum top-up

// Authentication constants
const MIN_PASSWORD_LENGTH = 8;
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

// Message constants
const MAX_MESSAGE_LENGTH = 5000;

// Pagination
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// File upload limits
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Rating constants
const MIN_RATING = 1;
const MAX_RATING = 5;

// Booking constants
const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// User roles
const USER_ROLES = {
  WORKER: 'worker',
  CLIENT: 'client',
  ADMIN: 'admin'
};

// Transaction types
const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  PAYMENT: 'payment',
  REFUND: 'refund',
  COMMISSION: 'commission'
};

module.exports = {
  PLATFORM_COMMISSION_RATE,
  MAX_WALLET_TOPUP,
  MIN_PASSWORD_LENGTH,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  MAX_MESSAGE_LENGTH,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MIN_RATING,
  MAX_RATING,
  BOOKING_STATUSES,
  USER_ROLES,
  TRANSACTION_TYPES
};
