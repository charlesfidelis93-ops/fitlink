-- ============================================
-- FITLINK DATABASE SCHEMA + RLS POLICIES
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  share_token TEXT UNIQUE NOT NULL,
  edit_pin_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  chest NUMERIC(5,1),
  waist NUMERIC(5,1),
  hip NUMERIC(5,1),
  shoulder NUMERIC(5,1),
  neck NUMERIC(5,1),
  arm NUMERIC(5,1),
  thigh NUMERIC(5,1),
  inseam NUMERIC(5,1),
  height NUMERIC(5,1),
  fit_preference TEXT CHECK (fit_preference IN ('slim', 'regular', 'relaxed')),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pin_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  locked_until TIMESTAMPTZ,
  last_attempt TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE UNIQUE INDEX idx_profiles_share_token ON profiles(share_token);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_measurements_profile_id ON measurements(profile_id);
CREATE UNIQUE INDEX idx_pin_attempts_session_profile ON pin_attempts(session_id, profile_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_attempts ENABLE ROW LEVEL SECURITY;

-- USERS: Only self accessible
CREATE POLICY "users_self_only" ON users
  FOR ALL TO authenticated
  USING (id = auth.uid());

-- PROFILES: Owner full access
CREATE POLICY "profiles_owner_all" ON profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- PROFILES: Public read via share_token (service role only - handled server-side)
-- No direct public RLS - we use service role in server actions only

-- MEASUREMENTS: Owner full access
CREATE POLICY "measurements_owner_all" ON measurements
  FOR ALL TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- PIN ATTEMPTS: Owner access
CREATE POLICY "pin_attempts_owner_all" ON pin_attempts
  FOR ALL TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update measurements.updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER measurements_updated_at
  BEFORE UPDATE ON measurements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SERVICE ROLE FUNCTIONS (called server-side)
-- These bypass RLS - only called from server actions
-- ============================================

-- Get profile by share token (public read - server-side only)
CREATE OR REPLACE FUNCTION get_profile_by_token(p_token TEXT)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  gender TEXT,
  created_at TIMESTAMPTZ
) SECURITY DEFINER AS $$
BEGIN
  -- Validate token format (minimum 40 chars, alphanumeric)
  IF length(p_token) < 40 OR p_token !~ '^[a-zA-Z0-9_-]+$' THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT p.id, p.display_name, p.gender, p.created_at
  FROM profiles p
  WHERE p.share_token = p_token;
END;
$$ LANGUAGE plpgsql;

-- Get measurements by profile_id (public read - server-side only)
CREATE OR REPLACE FUNCTION get_measurements_by_profile(p_profile_id UUID)
RETURNS TABLE (
  chest NUMERIC,
  waist NUMERIC,
  hip NUMERIC,
  shoulder NUMERIC,
  neck NUMERIC,
  arm NUMERIC,
  thigh NUMERIC,
  inseam NUMERIC,
  height NUMERIC,
  fit_preference TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT m.chest, m.waist, m.hip, m.shoulder, m.neck,
         m.arm, m.thigh, m.inseam, m.height,
         m.fit_preference, m.notes, m.updated_at
  FROM measurements m
  WHERE m.profile_id = p_profile_id;
END;
$$ LANGUAGE plpgsql;
