import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, QrCode, MapPin, Navigation, Phone, MessageCircle,
  Camera, Fuel, KeyRound, Download, LifeBuoy, CheckCircle2, Car,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Booking, Vehicle, Agency } from '@/lib/types';
import { formatCedi, formatDateShort, generateKeyCode, maskLicense } from '@/lib/utils';
import Header from '@/components/Header';

export default function Handover() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = (location.state as { bookingId?: string }) || {};

  const [booking, setBooking] = useState<(Booking & { vehicle: Vehicle; agency: Agency }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [keycode] = useState(generateKeyCode());
  const [inspectionDone, setInspectionDone] = useState(false);
  const [fuelChecked, setFuelChecked] = useState(false);
  const [keyReleased, setKeyReleased] = useState(false);

  useEffect(() => {
    async function load() {
      if (!bookingId) {
        navigate('/history');
        return;
      }
      const { data } = await supabase
        .from('bookings')
        .select('*, vehicle:vehicles(*), agency:agencies(*)')
        .eq('id', bookingId)
        .maybeSingle();
      if (data) setBooking(data as Booking & { vehicle: Vehicle; agency: Agency });
      setLoading(false);
    }
    load();
  }, [bookingId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen obsidian-bg">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-obsidian-700 rounded-2xl" />
            <div className="h-32 bg-obsidian-700 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const vehicle = booking.vehicle;
  const agency = booking.agency;

  return (
    <div className="min-h-screen obsidian-bg">
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => navigate('/history')}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-emerald transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </button>

        <h1 className="text-2xl font-bold text-heading mb-1">Digital Vehicle Retrieval Pass</h1>
        <p className="text-sm text-muted mb-6">Contactless pickup credential for your rental</p>

        {/* Keycard HUD */}
        <div className="obsidian-card rounded-2xl p-6 qr-glow mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Retrieval Keycode</p>
              <p className="text-3xl font-bold text-emerald tracking-widest">
                GH \u2022 {keycode[0]} {keycode[1]} {keycode[2]} {keycode[3]}
              </p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-obsidian-900 flex items-center justify-center border border-emerald/30">
              <QrCode className="w-10 h-10 text-emerald" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald mb-4">
            <span className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse" />
            Auto-refreshing \u00b7 Valid for {formatDateShort(booking.start_date)} \u2013 {formatDateShort(booking.end_date)}
          </div>

          {/* Bay locator */}
          <div className="obsidian-surface rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center text-emerald">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-heading">Terminal 3 Car Park B</p>
                <p className="text-xs text-muted">Bay 14 Reserved \u00b7 {booking.pickup_hub || 'Kotoka Airport T3'}</p>
              </div>
              <a
                href="https://maps.google.com/?q=Kotoka+International+Airport+Terminal+3"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg bg-emerald/10 text-emerald text-xs font-medium hover:bg-emerald hover:text-obsidian-900 transition-colors flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" /> Directions
              </a>
            </div>

            {/* Attendant */}
            <div className="flex items-center gap-3 pt-3 border-t obsidian-border">
              <div className="w-10 h-10 rounded-full bg-obsidian-700 flex items-center justify-center text-muted">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-heading">Kofi Mensah</p>
                <p className="text-xs text-muted">Dispatch Officer</p>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${agency?.phone || '+233302004567'}`} className="w-9 h-9 rounded-lg obsidian-bg border obsidian-border flex items-center justify-center text-muted hover:text-emerald hover:border-emerald transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
                <a href={`https://wa.me/233302004567`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg obsidian-bg border obsidian-border flex items-center justify-center text-muted hover:text-emerald hover:border-emerald transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Inspection Checklist */}
        <div className="obsidian-card rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-heading mb-4">Digital Inspection Checklist</h3>
          <div className="space-y-3">
            {/* Photo upload */}
            <button
              onClick={() => setInspectionDone(!inspectionDone)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                inspectionDone ? 'border-emerald bg-emerald/10' : 'obsidian-border obsidian-card'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${inspectionDone ? 'bg-emerald text-obsidian-900' : 'obsidian-surface text-muted'}`}>
                <Camera className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-heading">12-Angle Pre-Rental Photo Upload</p>
                <p className="text-xs text-muted">{inspectionDone ? '12 photos uploaded' : 'Tap to capture vehicle condition'}</p>
              </div>
              {inspectionDone && <CheckCircle2 className="w-5 h-5 text-emerald" />}
            </button>

            {/* Fuel verification */}
            <button
              onClick={() => setFuelChecked(!fuelChecked)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                fuelChecked ? 'border-emerald bg-emerald/10' : 'obsidian-border obsidian-card'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${fuelChecked ? 'bg-emerald text-obsidian-900' : 'obsidian-surface text-muted'}`}>
                <Fuel className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-heading">Full-to-Full Fuel Verification</p>
                <p className="text-xs text-muted">{fuelChecked ? 'Verified: 80L tank full' : 'Confirm fuel level before departure'}</p>
              </div>
              {fuelChecked && <CheckCircle2 className="w-5 h-5 text-emerald" />}
            </button>

            {/* Smart key release */}
            <button
              onClick={() => setKeyReleased(!keyReleased)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                keyReleased ? 'border-emerald bg-emerald/10' : 'obsidian-border obsidian-card'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${keyReleased ? 'bg-emerald text-obsidian-900' : 'obsidian-surface text-muted'}`}>
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-heading">Smart Key Release</p>
                <p className="text-xs text-muted">{keyReleased ? 'Key released \u2014 vehicle unlocked' : 'Release digital key to unlock vehicle'}</p>
              </div>
              {keyReleased && <CheckCircle2 className="w-5 h-5 text-emerald" />}
            </button>
          </div>
        </div>

        {/* Vehicle & booking info */}
        <div className="obsidian-card rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <img src={vehicle.images?.[0]} alt="" className="w-20 h-16 rounded-lg object-cover obsidian-surface" />
            <div>
              <p className="font-bold text-heading">{vehicle.make} {vehicle.model}</p>
              <p className="text-xs text-muted">{agency?.name} \u00b7 {booking.rental_mode === 'chauffeur' ? 'With Chauffeur' : 'Self-Drive'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted">Driver</p>
              <p className="text-heading font-medium">{booking.driver_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted">License</p>
              <p className="text-heading font-medium">{booking.driver_license ? maskLicense(booking.driver_license) : 'Verified'}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Pickup</p>
              <p className="text-heading font-medium">{formatDateShort(booking.start_date)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Return</p>
              <p className="text-heading font-medium">{formatDateShort(booking.end_date)}</p>
            </div>
          </div>
          <div className="border-t obsidian-border mt-4 pt-3 flex justify-between">
            <span className="font-bold text-heading">Total Paid</span>
            <span className="font-bold text-emerald">{formatCedi(booking.total_cost + booking.deposit)}</span>
          </div>
        </div>

        {/* Wallet utilities */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-3 rounded-xl obsidian-card border obsidian-border text-heading font-medium text-sm hover:border-emerald transition-colors">
            <Download className="w-4 h-4" /> Download Pass
          </button>
          <a href="tel:+233302004567" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald/10 border border-emerald/20 text-emerald font-medium text-sm hover:bg-emerald hover:text-obsidian-900 transition-colors">
            <LifeBuoy className="w-4 h-4" /> Roadside Help
          </a>
        </div>
      </div>
    </div>
  );
}
