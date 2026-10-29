import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Calendar, MapPin, User,
  CreditCard, Phone, Wallet, Shield, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Vehicle, Agency } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatCedi, daysBetween, PICKUP_HUBS, RETURN_HUBS, PAYMENT_METHODS } from '@/lib/utils';
import Header from '@/components/Header';

const STEPS = ['Dates & Hubs', 'Driver Info', 'Payment'];

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { vehicleId, rentalMode: initialMode, pickupHub: initialHub, deposit } =
    (location.state as Record<string, unknown>) || {};

  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState<(Vehicle & { agency: Agency | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupHub, setPickupHub] = useState((initialHub as string) || PICKUP_HUBS[0]);
  const [returnHub, setReturnHub] = useState(RETURN_HUBS[0]);
  const [rentalMode] = useState((initialMode as string) || 'self-drive');
  const [driverName, setDriverName] = useState(profile?.full_name || '');
  const [driverLicense, setDriverLicense] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mtn_momo');

  useEffect(() => {
    async function load() {
      if (!vehicleId) {
        navigate('/explore');
        return;
      }
      const { data } = await supabase
        .from('vehicles')
        .select('*, agency:agencies(*)')
        .eq('id', vehicleId as string)
        .maybeSingle();
      if (data) setVehicle(data as Vehicle & { agency: Agency | null });
      setLoading(false);
    }
    load();
  }, [vehicleId, navigate]);

  const days = startDate && endDate ? daysBetween(startDate, endDate) : 0;
  const ratePerDay = rentalMode === 'chauffeur' && vehicle ? vehicle.daily_rate + vehicle.chauffeur_rate : vehicle?.daily_rate ?? 0;
  const totalCost = days * ratePerDay;
  const depositAmount = deposit ? (deposit as number) : Math.round((vehicle?.daily_rate ?? 0) * 0.5);

  async function handleSubmit() {
    if (!vehicle || !user) return;
    setSubmitting(true);
    const { data } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        vehicle_id: vehicle.id,
        agency_id: vehicle.agency_id,
        start_date: startDate,
        end_date: endDate,
        pickup_hub: pickupHub,
        return_hub: returnHub,
        rental_mode: rentalMode,
        total_cost: totalCost,
        deposit: depositAmount,
        payment_method: paymentMethod,
        payment_status: 'paid',
        booking_status: 'upcoming',
        driver_name: driverName,
        driver_license: driverLicense,
      })
      .select('*')
      .maybeSingle();
    setSubmitting(false);
    if (data) {
      navigate('/handover', { state: { bookingId: data.id } });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen obsidian-bg">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-obsidian-700 rounded w-1/2" />
            <div className="h-40 bg-obsidian-700 rounded-2xl" />
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

  const canProceed = () => {
    if (step === 0) return startDate && endDate;
    if (step === 1) return driverName && driverLicense;
    return true;
  };

  const paymentIcon: Record<string, React.ReactNode> = {
    phone: <Phone className="w-5 h-5" />,
    card: <CreditCard className="w-5 h-5" />,
    wallet: <Wallet className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen obsidian-bg">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Back */}
        <button
          onClick={() => (step > 0 ? setStep(step - 1) : navigate(`/vehicle/${vehicle.id}`))}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-emerald transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> {step > 0 ? 'Previous Step' : 'Back to Vehicle'}
        </button>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-emerald' : 'text-muted'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < step ? 'bg-emerald text-obsidian-900' : i === step ? 'border-2 border-emerald bg-emerald/10 text-emerald' : 'border-2 border-obsidian-600 text-muted'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-emerald' : 'bg-obsidian-700'}`} />}
            </div>
          ))}
        </div>

        {/* Vehicle summary */}
        <div className="obsidian-card rounded-2xl p-4 flex items-center gap-4 mb-6">
          <img
            src={vehicle.images?.[0] || ''}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-20 h-16 rounded-lg object-cover obsidian-surface"
          />
          <div className="flex-1">
            <h3 className="font-bold text-heading">{vehicle.make} {vehicle.model}</h3>
            <p className="text-xs text-muted">{vehicle.year} \u00b7 {vehicle.category} \u00b7 {rentalMode === 'chauffeur' ? 'With Chauffeur' : 'Self-Drive'}</p>
          </div>
          <div className="text-right">
            <p className="text-emerald font-bold">{formatCedi(ratePerDay)}</p>
            <p className="text-xs text-muted">per day</p>
          </div>
        </div>

        {/* Step 0: Dates & Hubs */}
        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Trip Schedule
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading focus:border-emerald focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Return Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading focus:border-emerald focus:outline-none text-sm"
                  />
                </div>
              </div>
              {days > 0 && (
                <p className="text-xs text-emerald mt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {days} days \u00b7 2-hour complimentary grace period on return
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Pickup & Return Hubs
              </h3>
              <label className="block text-xs text-muted mb-1.5">Pickup Location</label>
              <select
                value={pickupHub}
                onChange={(e) => setPickupHub(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading focus:border-emerald focus:outline-none text-sm mb-3"
              >
                {PICKUP_HUBS.map((hub) => <option key={hub} value={hub}>{hub}</option>)}
              </select>
              <label className="block text-xs text-muted mb-1.5">Return Location</label>
              <select
                value={returnHub}
                onChange={(e) => setReturnHub(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading focus:border-emerald focus:outline-none text-sm"
              >
                {RETURN_HUBS.map((hub) => <option key={hub} value={hub}>{hub}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 1: Driver Info */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Driver Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Kofi Mensah"
                    className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">DVLA Driver's License Number</label>
                  <input
                    type="text"
                    value={driverLicense}
                    onChange={(e) => setDriverLicense(e.target.value)}
                    placeholder="GH DVLA B148XXXXX9"
                    className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm"
                  />
                </div>
                {driverLicense.length >= 4 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald/10 border border-emerald/20 text-emerald text-xs">
                    <Shield className="w-3.5 h-3.5" />
                    DVLA license verified: GH DVLA {driverLicense.slice(0, 4)}\u2022\u2022\u2022{driverLicense.slice(-1)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Method
              </h3>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      paymentMethod === method.id
                        ? 'border-emerald bg-emerald/10'
                        : 'obsidian-border obsidian-card hover:border-emerald/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      paymentMethod === method.id ? 'bg-emerald text-obsidian-900' : 'obsidian-surface text-muted'
                    }`}>
                      {paymentIcon[method.icon]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-heading">{method.label}</p>
                      <p className="text-xs text-muted">{method.description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${paymentMethod === method.id ? 'text-emerald' : 'text-muted'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Cost summary */}
            <div className="obsidian-card rounded-2xl p-5">
              <h3 className="font-bold text-heading mb-3">Total Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">{formatCedi(ratePerDay)} \u00d7 {days} days</span>
                  <span className="text-heading">{formatCedi(totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Refundable Deposit</span>
                  <span className="text-heading">{formatCedi(depositAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald">
                  <span>Comprehensive Insurance</span>
                  <span>Included</span>
                </div>
                <div className="border-t obsidian-border pt-2 flex justify-between">
                  <span className="font-bold text-heading">Total</span>
                  <span className="font-bold text-emerald">{formatCedi(totalCost + depositAmount)}</span>
                </div>
                <p className="text-xs text-muted flex items-center gap-1.5 pt-1">
                  <Shield className="w-3.5 h-3.5" /> Zero hidden fees \u00b7 Escrow-protected
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-3 rounded-xl obsidian-card border obsidian-border text-muted hover:text-heading transition-colors text-sm font-medium"
            >
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald text-obsidian-900 font-semibold hover:bg-emerald-light transition-colors disabled:opacity-40"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-emerald text-obsidian-900 font-semibold hover:bg-emerald-light transition-colors disabled:opacity-50"
            >
              {submitting ? 'Confirming\u2026' : 'Confirm & Pay'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
