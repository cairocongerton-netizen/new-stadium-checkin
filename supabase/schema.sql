-- New Stadium Guest Check-in Database Schema
-- This file contains the complete database schema for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
-- Stores unique user information with their disciplines
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  disciplines TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on updated_at for sorting
CREATE INDEX idx_users_updated_at ON users(updated_at DESC);

-- Visits Table
-- Records each visit with timestamp, reason, and disciplines at time of visit
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  reason_for_visit TEXT NOT NULL,
  disciplines_at_visit TEXT[] NOT NULL
);

-- Create index on user_id for faster joins
CREATE INDEX idx_visits_user_id ON visits(user_id);

-- Create index on timestamp for sorting and filtering
CREATE INDEX idx_visits_timestamp ON visits(timestamp DESC);

-- Create composite index for user + timestamp queries
CREATE INDEX idx_visits_user_timestamp ON visits(user_id, timestamp DESC);

-- Row Level Security (RLS) Policies
-- Enable RLS on both tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to users table
CREATE POLICY "Allow anonymous read access to users"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous insert access to users table
CREATE POLICY "Allow anonymous insert access to users"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous update access to users table
CREATE POLICY "Allow anonymous update access to users"
  ON users
  FOR UPDATE
  TO anon
  USING (true);

-- Allow anonymous read access to visits table
CREATE POLICY "Allow anonymous read access to visits"
  ON visits
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous insert access to visits table
CREATE POLICY "Allow anonymous insert access to visits"
  ON visits
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Add constraints to ensure data quality
ALTER TABLE users
  ADD CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT users_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 50),
  ADD CONSTRAINT users_disciplines_not_empty CHECK (array_length(disciplines, 1) > 0);

ALTER TABLE visits
  ADD CONSTRAINT visits_reason_length CHECK (char_length(reason_for_visit) >= 10 AND char_length(reason_for_visit) <= 500),
  ADD CONSTRAINT visits_disciplines_not_empty CHECK (array_length(disciplines_at_visit, 1) > 0);

-- Sample data for testing (optional - remove in production)
-- INSERT INTO users (email, name, disciplines) VALUES
--   ('john.doe@example.com', 'John Doe', ARRAY['Software', 'Hardware']),
--   ('jane.smith@example.com', 'Jane Smith', ARRAY['Creative']);

-- INSERT INTO visits (user_id, reason_for_visit, disciplines_at_visit) VALUES
--   ((SELECT id FROM users WHERE email = 'john.doe@example.com'), 'Working on a new project prototype', ARRAY['Software', 'Hardware']),
--   ((SELECT id FROM users WHERE email = 'jane.smith@example.com'), 'Meeting with the design team', ARRAY['Creative']);
