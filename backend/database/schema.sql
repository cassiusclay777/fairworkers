-- FairWorkers Platform Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('worker', 'client', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended', 'banned');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE safety_check_status AS ENUM ('scheduled', 'completed', 'missed', 'emergency');
CREATE TYPE incident_status AS ENUM ('reported', 'investigating', 'resolved', 'closed');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- Users table (workers, clients, admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    status user_status NOT NULL DEFAULT 'pending',

    -- Profile info
    username VARCHAR(100) UNIQUE,
    display_name VARCHAR(150),
    phone VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,

    -- Verification
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    identity_verified verification_status DEFAULT 'unverified',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,

    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Worker profiles (additional info for sex workers)
CREATE TABLE worker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Professional info
    stage_name VARCHAR(100),
    age INTEGER,
    location VARCHAR(255),
    languages TEXT[], -- Array of languages spoken

    -- Services & Pricing
    hourly_rate DECIMAL(10, 2),
    minimum_booking_hours INTEGER DEFAULT 1,

    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    accepts_new_clients BOOLEAN DEFAULT TRUE,

    -- Stats
    total_bookings INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    response_time_minutes INTEGER DEFAULT 60,

    -- Safety
    safety_score DECIMAL(3, 2) DEFAULT 5.0,
    requires_verification BOOLEAN DEFAULT FALSE,

    -- Financial
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    pending_payout DECIMAL(12, 2) DEFAULT 0,
    lifetime_earnings DECIMAL(12, 2) DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services offered by workers
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    -- Options
    requires_deposit BOOLEAN DEFAULT FALSE,
    deposit_amount DECIMAL(10, 2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client profiles
CREATE TABLE client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Verification
    verification_level INTEGER DEFAULT 0,
    trusted_client BOOLEAN DEFAULT FALSE,

    -- Stats
    total_bookings INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    no_show_count INTEGER DEFAULT 0,

    -- Trust score
    trust_score DECIMAL(3, 2) DEFAULT 5.0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Parties involved
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,

    -- Booking details
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,

    -- Location
    location TEXT,

    -- Status
    status booking_status DEFAULT 'pending',

    -- Pricing
    service_price DECIMAL(10, 2) NOT NULL,
    platform_commission DECIMAL(10, 2) NOT NULL,
    worker_earnings DECIMAL(10, 2) NOT NULL,

    -- Notes
    client_notes TEXT,
    worker_notes TEXT,

    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments & Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Related entities
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    payer_id UUID NOT NULL REFERENCES users(id),
    payee_id UUID REFERENCES users(id),

    -- Payment details
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CZK',
    status payment_status DEFAULT 'pending',

    -- Payment method
    payment_method VARCHAR(50), -- 'stripe', 'paypal', 'bank_transfer'
    payment_provider_id VARCHAR(255), -- Stripe payment intent ID

    -- Breakdown
    gross_amount DECIMAL(12, 2) NOT NULL,
    platform_fee DECIMAL(12, 2) DEFAULT 0,
    solidarity_contribution DECIMAL(12, 2) DEFAULT 0,
    net_amount DECIMAL(12, 2) NOT NULL,

    -- Metadata
    description TEXT,
    metadata JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts to workers
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Payout details
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CZK',
    status payout_status DEFAULT 'pending',

    -- Method
    payout_method VARCHAR(50), -- 'bank_transfer', 'stripe'
    bank_account_id VARCHAR(255),

    -- Timing
    is_instant BOOLEAN DEFAULT FALSE,
    instant_fee DECIMAL(10, 2),

    -- Processing
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Provider info
    provider_payout_id VARCHAR(255),

    -- Metadata
    period_start DATE,
    period_end DATE,
    transaction_ids UUID[],

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews & Ratings
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Related entities
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),

    -- Rating
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

    -- Review content
    title VARCHAR(200),
    comment TEXT,

    -- Flags
    is_verified_booking BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT FALSE,

    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(booking_id, reviewer_id)
);

-- Safety incidents & reports
CREATE TABLE safety_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Reporter
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT TRUE,

    -- Related entities
    reported_user_id UUID REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),

    -- Incident details
    incident_type VARCHAR(100), -- 'harassment', 'safety_concern', 'violence', etc.
    severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    status incident_status DEFAULT 'reported',

    -- Description
    description TEXT NOT NULL,
    location TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE,

    -- Evidence
    evidence_urls TEXT[],

    -- Resolution
    assigned_to UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safety checks (for worker safety)
CREATE TABLE safety_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Worker
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),

    -- Schedule
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_time TIMESTAMP WITH TIME ZONE,
    status safety_check_status DEFAULT 'scheduled',

    -- Check details
    check_type VARCHAR(50), -- 'automatic', 'manual', 'emergency'
    location TEXT,

    -- Response
    worker_safe BOOLEAN,
    response_notes TEXT,

    -- Emergency
    emergency_triggered BOOLEAN DEFAULT FALSE,
    emergency_contacts_notified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trusted contacts (for emergency notifications)
CREATE TABLE trusted_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,
    relationship VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),

    is_primary BOOLEAN DEFAULT FALSE,
    notify_on_emergency BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community posts (anonymous forum)
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Author (optional - can be anonymous)
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT TRUE,

    -- Post content
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50), -- 'legal', 'health', 'safety', 'general'

    -- Engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,

    -- Moderation
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community comments
CREATE TABLE community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Related post
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,

    -- Author (optional - can be anonymous)
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT TRUE,

    -- Comment content
    content TEXT NOT NULL,

    -- Engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,

    -- Moderation
    is_hidden BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages (in-app chat)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Conversation
    conversation_id UUID NOT NULL,

    -- Sender & receiver
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),

    -- Message content
    content TEXT NOT NULL,

    -- Metadata
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Related entities
    booking_id UUID REFERENCES bookings(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker availability calendar
CREATE TABLE worker_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Time slot
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Specific dates
    specific_date DATE,
    is_available BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Solidarity fund contributions
CREATE TABLE solidarity_fund (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Contribution
    transaction_id UUID REFERENCES transactions(id),
    contributor_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,

    -- Disbursement (when fund is used)
    is_disbursed BOOLEAN DEFAULT FALSE,
    disbursed_to UUID REFERENCES users(id),
    disbursed_at TIMESTAMP WITH TIME ZONE,
    disbursement_reason TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification documents
CREATE TABLE verification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    document_type VARCHAR(50), -- 'id_card', 'passport', 'selfie', etc.
    file_url TEXT NOT NULL,

    status verification_status DEFAULT 'pending',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,

    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_bookings_worker ON bookings(worker_id);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_transactions_booking ON transactions(booking_id);
CREATE INDEX idx_transactions_payer ON transactions(payer_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_safety_incidents_reported_user ON safety_incidents(reported_user_id);
CREATE INDEX idx_safety_checks_worker ON safety_checks(worker_id);
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
