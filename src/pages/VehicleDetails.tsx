import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Shield, Navigation, Users, Cog, Fuel, Gauge,
  Phone, MessageCircle, CheckCircle2, MapPin, Car,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Vehicle, Agency } from '@/lib/types';
import { formatCedi, PICKUP_HUBS } from '@/lib/utils';
import Header from '@/components/Header';

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<(Vehicle & { agency: Agency | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [rentalMode, setRentalMode] = useState<'self-drive' | 'chauffeur'>('self-drive');
  const [pickupHub, setPickupHub] = useState(PICKUP_HUBS[0]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('vehicles')
        .select('*, agency:agencies(*)')
        .eq('id', id!)
        .maybeSingle();
      if (data) {
        setVehicle(data as Vehicle & { agency: Agency | null });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen obsidian-bg">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-obsidian-700 rounded w-32" />
            <div className="aspect-[16/9] obsidian-surface rounded-2xl" />
            <div className="h-6 bg-obsidian-700 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen obsidian-bg flex items-center justify-center">
        <p className="text-muted">Vehicle not found.</p>
      </div>
    );
  }

  const agency = vehicle.agency;
  const dailyTotal = rentalMode === 'chauffeur' ? vehicle.daily_rate + vehicle.chauffeur_rate : vehicle.daily_rate;
  const deposit = Math.round(vehicle.daily_rate * 0.5);
  const img = vehicle.images?.[0] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

  const specs = [
    { icon: <Users className="w-5 h-5" />, label: 'Passengers', value: `${vehicle.passengers}` },
    { icon: <Cog className="w-5 h-5" />, label: 'Transmission', value: vehicle.transmission },
    { icon: <Gauge className="w-5 h-5" />, label: 'Drivetrain', value: vehicle.drivetrain },
    { icon: <Fuel className="w-5 h-5" />, label: 'Fuel', value: vehicle.fuel_type },
  ];

  return (
    <div className="min-h-screen obsidian-bg">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Back */}
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-muted hover:text-emerald transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>

        {/* Hero image */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden obsidian-card mb-6">
          <img src={img} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
          {/* Status badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {vehicle.instant_confirmation && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full obsidian-bg/80 backdrop-blur-md text-xs font-semibold text-emerald border border-emerald/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Instant Confirmation
              </div>
            )}
            {vehicle.gps_monitoring && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full obsidian-bg/80 backdrop-blur-md text-xs font-semibold text-emerald-light border border-emerald/20">
                <Navigation className="w-3.5 h-3.5" /> Live GPS Monitoring
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-heading mb-1">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              {vehicle.location && (
                <p className="text-sm text-muted flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {vehicle.location}
                </p>
              )}
            </div>

            {/* Operator trust card */}
            {agency && (
              <div className="obsidian-card rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald/10 flex items-center justify-center">
                      <Car className="w-6 h-6 text-emerald" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-heading">{agency.name}</h3>
                        {agency.is_superhost && (
                          <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs font-semibold">Superhost</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                        <span className="text-sm font-medium text-heading">{agency.rating}</span>
                        <span className="text-sm text-muted">({agency.trip_count} trips)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-9 h-9 rounded-lg obsidian-surface border obsidian-border flex items-center justify-center text-muted hover:text-emerald hover:border-emerald transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 rounded-lg obsidian-surface border obsidian-border flex items-center justify-center text-muted hover:text-emerald hover:border-emerald transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Verification badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {agency.dvla_verified && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald/10 text-emerald text-xs font-medium">
                      <Shield className="w-3 h-3" /> DVLA Verified
                    </div>
                  )}
                  {agency.gta_verified && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald/10 text-emerald text-xs font-medium">
                      <Shield className="w-3 h-3" /> GTA Licensed
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald/10 text-emerald text-xs font-medium">
                    <Shield className="w-3 h-3" /> {agency.insurance_provider}
                  </div>
                </div>
              </div>
            )}

            {/* Rental mode toggle */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Rental Mode</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRentalMode('self-drive')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    rentalMode === 'self-drive'
                      ? 'border-emerald bg-emerald/10'
                      : 'obsidian-border obsidian-card hover:border-emerald/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Car className="w-4 h-4 text-emerald" />
                    <span className="font-semibold text-heading text-sm">Self-Drive</span>
                  </div>
                  <p className="text-xs text-muted">Age 23+ & valid license</p>
                </button>
                <button
                  onClick={() => setRentalMode('chauffeur')}
                  disabled={!vehicle.chauffeur_available}
                  className={`p-4 rounded-xl border text-left transition-all disabled:opacity-40 ${
                    rentalMode === 'chauffeur'
                      ? 'border-emerald bg-emerald/10'
                      : 'obsidian-border obsidian-card hover:border-emerald/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-emerald" />
                    <span className="font-semibold text-heading text-sm">With Chauffeur</span>
                  </div>
                  <p className="text-xs text-muted">
                    {vehicle.chauffeur_available ? `+${formatCedi(vehicle.chauffeur_rate)}/day` : 'Not available'}
                  </p>
                </button>
              </div>
            </div>

            {/* Spec grid */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Essential Specs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {specs.map((spec, i) => (
                  <div key={i} className="obsidian-card rounded-xl p-4 text-center">
                    <div className="w-10 h-10 mx-auto rounded-lg bg-emerald/10 flex items-center justify-center text-emerald mb-2">
                      {spec.icon}
                    </div>
                    <p className="text-xs text-muted mb-0.5">{spec.label}</p>
                    <p className="text-sm font-semibold text-heading">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {vehicle.features.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full obsidian-card border obsidian-border text-sm text-heading">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald" /> {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pickup hub selection */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Pickup Hub</h3>
              <div className="space-y-2">
                {PICKUP_HUBS.map((hub) => (
                  <button
                    key={hub}
                    onClick={() => setPickupHub(hub)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      pickupHub === hub
                        ? 'border-emerald bg-emerald/10'
                        : 'obsidian-border obsidian-card hover:border-emerald/40'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      pickupHub === hub ? 'border-emerald' : 'obsidian-border border-obsidian-600'
                    }`}>
                      {pickupHub === hub && <div className="w-2.5 h-2.5 rounded-full bg-emerald" />}
                    </div>
                    <MapPin className="w-4 h-4 text-muted" />
                    <span className="text-sm font-medium text-heading">{hub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - pricing + booking */}
          <div className="lg:col-span-1">
            <div className="obsidian-card rounded-2xl p-5 sticky top-20">
              <h3 className="font-bold text-heading mb-4">Transparent Pricing</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Daily Lease</span>
                  <span className="text-heading font-medium">{formatCedi(vehicle.daily_rate)}</span>
                </div>
                {rentalMode === 'chauffeur' && vehicle.chauffeur_available && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Chauffeur Fee</span>
                    <span className="text-heading font-medium">{formatCedi(vehicle.chauffeur_rate)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Refundable Deposit</span>
                  <span className="text-heading font-medium">{formatCedi(deposit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Comprehensive Insurance</span>
                  <span className="text-emerald font-medium">Included</span>
                </div>
                <div className="border-t obsidian-border pt-3 flex justify-between">
                  <span className="text-heading font-semibold">Daily Total</span>
                  <span className="text-emerald font-bold">{formatCedi(dailyTotal)}</span>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate('/booking', {
                    state: {
                      vehicleId: vehicle.id,
                      rentalMode,
                      pickupHub,
                      dailyTotal,
                      deposit,
                    },
                  })
                }
                className="w-full py-3 rounded-xl bg-emerald text-obsidian-900 font-semibold hover:bg-emerald-light transition-colors mb-3"
              >
                Configure Booking
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted">
                <Shield className="w-3.5 h-3.5" />
                Zero hidden fees \u00b7 Free cancellation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
