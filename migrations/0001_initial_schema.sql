-- Initial schema migration (restructured according to AU (2) context)
-- Removes organizer_id from campaigns and author_id from stories.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'donor', -- donor, volunteer, beneficiary, charity_admin, system_admin
  avatar TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  goal_amount DECIMAL(10,2) NOT NULL,
  raised_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, paused, emergency
  urgent BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id VARCHAR REFERENCES campaigns(id) ON DELETE SET NULL,
  donor_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  anonymous BOOLEAN NOT NULL DEFAULT false,
  message TEXT,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stories (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  campaign_id VARCHAR REFERENCES campaigns(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  campaign_id VARCHAR REFERENCES campaigns(id) ON DELETE SET NULL,
  skills JSONB,
  availability TEXT,
  experience TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aid_requests (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, emergency
  status TEXT NOT NULL DEFAULT 'pending', -- pending, under_review, approved, rejected, fulfilled
  documents JSONB,
  location TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
