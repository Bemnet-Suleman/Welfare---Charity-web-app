-- initial schema migration generated manually

-- extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  role text NOT NULL DEFAULT 'donor',
  avatar text,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE campaigns (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  category text NOT NULL,
  goal_amount decimal(10,2) NOT NULL,
  raised_amount decimal(10,2) NOT NULL DEFAULT 0,
  organizer_id varchar NOT NULL REFERENCES users(id),
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'active',
  urgent boolean DEFAULT false,
  location text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE donations (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id varchar NOT NULL REFERENCES campaigns(id),
  donor_id varchar REFERENCES users(id),
  amount decimal(10,2) NOT NULL,
  anonymous boolean DEFAULT false,
  message text,
  payment_method text NOT NULL,
  transaction_id text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE stories (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image text,
  author_id varchar NOT NULL REFERENCES users(id),
  campaign_id varchar REFERENCES campaigns(id),
  published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE volunteers (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL REFERENCES users(id),
  campaign_id varchar REFERENCES campaigns(id),
  skills jsonb,
  availability text,
  experience text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);
