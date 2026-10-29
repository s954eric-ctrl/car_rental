export type Agency = {
  id: string;
  user_id: string | null;
  name: string;
  logo_url: string | null;
  rating: number;
  trip_count: number;
  locations: string[];
  is_superhost: boolean;
  vehicle_count: number;
  phone: string | null;
  email: string | null;
  dvla_verified: boolean;
  gta_verified: boolean;
  insurance_provider: string;
  description: string | null;
  region: string;
  created_at: string;
};

export type Vehicle = {
  id: string;
  agency_id: string;
  make: string;
  model: string;
  year: number;
  images: string[];
  daily_rate: number;
  category: string;
  transmission: string;
  fuel_type: string;
  passengers: number;
  drivetrain: string;
  features: string[];
  location: string | null;
  chauffeur_available: boolean;
  chauffeur_rate: number;
  instant_confirmation: boolean;
  gps_monitoring: boolean;
  available: boolean;
  created_at: string;
  agency?: Agency;
};

export type Booking = {
  id: string;
  user_id: string;
  vehicle_id: string;
  agency_id: string;
  start_date: string;
  end_date: string;
  pickup_hub: string | null;
  return_hub: string | null;
  rental_mode: string;
  total_cost: number;
  deposit: number;
  payment_method: string;
  payment_status: string;
  booking_status: string;
  driver_name: string | null;
  driver_license: string | null;
  created_at: string;
  vehicle?: Vehicle;
  agency?: Agency;
};

export type Favorite = {
  id: string;
  user_id: string;
  vehicle_id: string;
  created_at: string;
  vehicle?: Vehicle;
};

export type AgencyApplication = {
  id: string;
  user_id: string;
  business_name: string;
  tin: string | null;
  operational_base: string | null;
  gta_license: string | null;
  dvla_accreditation: string | null;
  fleet_size: number;
  category_tiers: string[];
  executive_services: string[];
  payout_method: string | null;
  payout_number: string | null;
  status: string;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  dvla_verified: boolean;
  account_type: string;
  theme: string;
  created_at: string;
};
