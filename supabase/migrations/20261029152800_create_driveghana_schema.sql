/*
# DriveGhana — Core Schema (retry)

Creates the full data model for the DriveGhana car rental marketplace.
Fixes a typo from the prior attempt (DROP POLICY vs CREATE POLICY on favorites insert).
Since the prior migration may have partially applied, this is idempotent.

1. New Tables
- profiles, agencies, vehicles, bookings, favorites, agency_applications
2. Security: RLS enabled on all; public read on agencies/vehicles; owner-scoped on the rest.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  dvla_verified boolean DEFAULT false,
  account_type text NOT NULL DEFAULT 'consumer',
  theme text NOT NULL DEFAULT 'obsidian-dark',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON profiles TO authenticated;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- AGENCIES
CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  logo_url text,
  rating numeric(2,1) DEFAULT 5.0,
  trip_count integer DEFAULT 0,
  locations text[] DEFAULT '{}',
  is_superhost boolean DEFAULT false,
  vehicle_count integer DEFAULT 0,
  phone text,
  email text,
  dvla_verified boolean DEFAULT true,
  gta_verified boolean DEFAULT true,
  insurance_provider text DEFAULT 'Hollard Insurance',
  description text,
  region text DEFAULT 'Greater Accra',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON agencies TO authenticated;
GRANT INSERT, UPDATE, DELETE ON agencies TO authenticated;
DROP POLICY IF EXISTS "select_agencies" ON agencies;
CREATE POLICY "select_agencies" ON agencies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_agency" ON agencies;
CREATE POLICY "insert_own_agency" ON agencies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_agency" ON agencies;
CREATE POLICY "update_own_agency" ON agencies FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_agency" ON agencies;
CREATE POLICY "delete_own_agency" ON agencies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  images text[] DEFAULT '{}',
  daily_rate numeric(10,2) NOT NULL,
  category text NOT NULL DEFAULT 'Sedan',
  transmission text NOT NULL DEFAULT 'Automatic',
  fuel_type text NOT NULL DEFAULT 'Petrol',
  passengers integer NOT NULL DEFAULT 5,
  drivetrain text DEFAULT '2WD',
  features text[] DEFAULT '{}',
  location text,
  chauffeur_available boolean DEFAULT false,
  chauffeur_rate numeric(10,2) DEFAULT 0,
  instant_confirmation boolean DEFAULT true,
  gps_monitoring boolean DEFAULT true,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON vehicles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON vehicles TO authenticated;
DROP POLICY IF EXISTS "select_vehicles" ON vehicles;
CREATE POLICY "select_vehicles" ON vehicles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_agency_vehicle" ON vehicles;
CREATE POLICY "insert_agency_vehicle" ON vehicles FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM agencies WHERE agencies.id = vehicles.agency_id AND agencies.user_id = auth.uid())
);
DROP POLICY IF EXISTS "update_agency_vehicle" ON vehicles;
CREATE POLICY "update_agency_vehicle" ON vehicles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM agencies WHERE agencies.id = vehicles.agency_id AND agencies.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM agencies WHERE agencies.id = vehicles.agency_id AND agencies.user_id = auth.uid())
);
DROP POLICY IF EXISTS "delete_agency_vehicle" ON vehicles;
CREATE POLICY "delete_agency_vehicle" ON vehicles FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM agencies WHERE agencies.id = vehicles.agency_id AND agencies.user_id = auth.uid())
);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  pickup_hub text,
  return_hub text,
  rental_mode text NOT NULL DEFAULT 'self-drive',
  total_cost numeric(10,2) NOT NULL DEFAULT 0,
  deposit numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'mtn_momo',
  payment_status text DEFAULT 'pending',
  booking_status text DEFAULT 'upcoming',
  driver_name text,
  driver_license text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON bookings TO authenticated;
DROP POLICY IF EXISTS "select_own_bookings" ON bookings;
CREATE POLICY "select_own_bookings" ON bookings FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM agencies WHERE agencies.id = bookings.agency_id AND agencies.user_id = auth.uid())
);
DROP POLICY IF EXISTS "insert_own_bookings" ON bookings;
CREATE POLICY "insert_own_bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_bookings" ON bookings;
CREATE POLICY "update_own_bookings" ON bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, vehicle_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON favorites TO authenticated;
DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- AGENCY APPLICATIONS
CREATE TABLE IF NOT EXISTS agency_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  tin text,
  operational_base text,
  gta_license text,
  dvla_accreditation text,
  fleet_size integer DEFAULT 1,
  category_tiers text[] DEFAULT '{}',
  executive_services text[] DEFAULT '{}',
  payout_method text,
  payout_number text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE agency_applications ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON agency_applications TO authenticated;
DROP POLICY IF EXISTS "select_own_applications" ON agency_applications;
CREATE POLICY "select_own_applications" ON agency_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_applications" ON agency_applications;
CREATE POLICY "insert_own_applications" ON agency_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_agency ON vehicles(agency_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_agencies_region ON agencies(region);
