import { useEffect, useState } from 'react';
import {
  Car, Calendar, TrendingUp, Plus, Trash2,
  Phone, MapPin, Users, X, Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Agency, Vehicle, Booking } from '@/lib/types';
import { formatCedi, formatDate } from '@/lib/utils';
import Header from '@/components/Header';

type Tab = 'dashboard' | 'fleet' | 'bookings';

export default function AgencyPortal() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [agency, setAgency] = useState<Agency | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<(Booking & { vehicle: Vehicle })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data: agencyData } = await supabase.from('agencies').select('*').eq('user_id', user.id).maybeSingle();
      if (agencyData) {
        setAgency(agencyData as Agency);
        const { data: vehicleData } = await supabase.from('vehicles').select('*').eq('agency_id', agencyData.id).order('created_at', { ascending: false });
        if (vehicleData) setVehicles(vehicleData as Vehicle[]);
        const { data: bookingData } = await supabase.from('bookings').select('*, vehicle:vehicles(*)').eq('agency_id', agencyData.id).order('created_at', { ascending: false });
        if (bookingData) setBookings(bookingData as (Booking & { vehicle: Vehicle })[]);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  // Stats
  const totalEarnings = bookings.reduce((sum, b) => sum + b.total_cost, 0);
  const activeBookings = bookings.filter((b) => b.booking_status === 'upcoming' || b.booking_status === 'active').length;
  const availableVehicles = vehicles.filter((v) => v.available).length;

  if (loading) {
    return (
      <div className="min-h-screen obsidian-bg">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-obsidian-700 rounded w-1/3" />
            <div className="h-32 bg-obsidian-700 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen obsidian-bg">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full obsidian-surface flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-muted" />
          </div>
          <h1 className="text-xl font-bold text-heading mb-2">No Agency Registered</h1>
          <p className="text-muted mb-6">You need to complete the partner onboarding and be approved before you can access the agency portal.</p>
          <a href="/onboarding" className="inline-block px-6 py-3 rounded-xl bg-emerald text-obsidian-900 font-semibold hover:bg-emerald-light transition-colors">
            Start Onboarding
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen obsidian-bg">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-heading">{agency.name}</h1>
            <p className="text-sm text-muted">Agency Portal</p>
          </div>
          {agency.is_superhost && <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-sm font-semibold">Superhost</span>}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 obsidian-card rounded-xl p-1">
          {(['dashboard', 'fleet', 'bookings'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-emerald text-obsidian-900' : 'text-muted hover:text-heading'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Dashboard tab */}
        {tab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Total Earnings" value={formatCedi(totalEarnings)} />
              <StatCard icon={<Calendar className="w-5 h-5" />} label="Active Bookings" value={activeBookings.toString()} />
              <StatCard icon={<Car className="w-5 h-5" />} label="Available Vehicles" value={`${availableVehicles}/${vehicles.length}`} />
            </div>

            {/* Rating card */}
            <div className="obsidian-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Performance</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><p className="text-2xl font-bold text-emerald">{agency.rating}</p><p className="text-xs text-muted">Rating</p></div>
                <div><p className="text-2xl font-bold text-heading">{agency.trip_count}</p><p className="text-xs text-muted">Total Trips</p></div>
                <div><p className="text-2xl font-bold text-heading">{vehicles.length}</p><p className="text-xs text-muted">Fleet Size</p></div>
                <div><p className="text-2xl font-bold text-heading">{agency.vehicle_count}</p><p className="text-xs text-muted">Listed</p></div>
              </div>
            </div>

            {/* Recent bookings */}
            <div className="obsidian-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Recent Bookings</h3>
              {bookings.length === 0 ? (
                <p className="text-sm text-muted py-4 text-center">No bookings yet.</p>
              ) : (
                <div className="space-y-2">
                  {bookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl obsidian-surface">
                      <img src={b.vehicle.images?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover obsidian-bg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-heading">{b.vehicle.make} {b.vehicle.model}</p>
                        <p className="text-xs text-muted">{formatDate(b.start_date)} \u2013 {formatDate(b.end_date)}</p>
                      </div>
                      <span className="text-sm font-bold text-emerald">{formatCedi(b.total_cost)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fleet tab */}
        {tab === 'fleet' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Fleet Management ({vehicles.length})</h3>
              <button onClick={() => setShowAddVehicle(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald text-obsidian-900 font-semibold text-sm hover:bg-emerald-light transition-colors">
                <Plus className="w-4 h-4" /> Add Vehicle
              </button>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-12 obsidian-card rounded-2xl">
                <Car className="w-10 h-10 text-muted mx-auto mb-3" />
                <p className="text-muted mb-4">No vehicles in your fleet yet.</p>
                <button onClick={() => setShowAddVehicle(true)} className="text-emerald font-semibold text-sm">Add your first vehicle</button>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <div key={v.id} className="obsidian-card rounded-2xl p-4 flex items-center gap-4">
                    <img src={v.images?.[0]} alt="" className="w-20 h-16 rounded-lg object-cover obsidian-surface shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-heading">{v.make} {v.model}</h4>
                      <p className="text-xs text-muted">{v.year} \u00b7 {v.category} \u00b7 {formatCedi(v.daily_rate)}/day</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.available ? 'bg-emerald/10 text-emerald' : 'bg-obsidian-700 text-muted'}`}>
                          {v.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleAvailability(v)} className="w-9 h-9 rounded-lg obsidian-surface border obsidian-border flex items-center justify-center text-muted hover:text-emerald hover:border-emerald transition-colors" title={v.available ? 'Mark unavailable' : 'Mark available'}>
                        {v.available ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteVehicle(v.id)} className="w-9 h-9 rounded-lg obsidian-surface border obsidian-border flex items-center justify-center text-muted hover:text-red-400 hover:border-red-500/40 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAddVehicle && (
              <AddVehicleModal agencyId={agency.id} onClose={() => setShowAddVehicle(false)} onAdded={() => { setShowAddVehicle(false); reloadFleet(agency.id, setVehicles); }} />
            )}
          </div>
        )}

        {/* Bookings tab */}
        {tab === 'bookings' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Incoming Bookings ({bookings.length})</h3>
            {bookings.length === 0 ? (
              <div className="text-center py-12 obsidian-card rounded-2xl">
                <Calendar className="w-10 h-10 text-muted mx-auto mb-3" />
                <p className="text-muted">No bookings yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="obsidian-card rounded-2xl p-4">
                    <div className="flex items-start gap-4">
                      <img src={b.vehicle.images?.[0]} alt="" className="w-20 h-16 rounded-lg object-cover obsidian-surface shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-heading">{b.vehicle.make} {b.vehicle.model}</h4>
                            <p className="text-xs text-muted flex items-center gap-1"><Users className="w-3 h-3" /> {b.driver_name}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.booking_status === 'upcoming' ? 'bg-gold/10 text-gold' : b.booking_status === 'active' ? 'bg-emerald text-obsidian-900' : 'bg-obsidian-700 text-muted'}`}>
                            {b.booking_status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(b.start_date)} \u2013 {formatDate(b.end_date)}</span>
                          {b.pickup_hub && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {b.pickup_hub}</span>}
                          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {b.payment_method}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-emerald font-bold">{formatCedi(b.total_cost + b.deposit)}</span>
                          <div className="flex gap-2">
                            {b.booking_status === 'upcoming' && (
                              <>
                                <button onClick={() => updateBookingStatus(b.id, 'active')} className="px-3 py-1.5 rounded-lg bg-emerald/10 text-emerald text-xs font-medium hover:bg-emerald hover:text-obsidian-900 transition-colors">Confirm</button>
                                <button onClick={() => updateBookingStatus(b.id, 'completed')} className="px-3 py-1.5 rounded-lg obsidian-surface border obsidian-border text-muted text-xs font-medium hover:text-emerald hover:border-emerald transition-colors">Complete</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="obsidian-card rounded-2xl p-5">
      <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center text-emerald mb-3">{icon}</div>
      <p className="text-2xl font-bold text-heading">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

async function reloadFleet(agencyId: string, setter: (v: Vehicle[]) => void) {
  const { data } = await supabase.from('vehicles').select('*').eq('agency_id', agencyId).order('created_at', { ascending: false });
  if (data) setter(data as Vehicle[]);
}

async function toggleAvailability(v: Vehicle) {
  await supabase.from('vehicles').update({ available: !v.available }).eq('id', v.id);
  window.location.reload();
}

async function deleteVehicle(id: string) {
  await supabase.from('vehicles').delete().eq('id', id);
  window.location.reload();
}

async function updateBookingStatus(id: string, status: string) {
  await supabase.from('bookings').update({ booking_status: status }).eq('id', id);
  window.location.reload();
}

function AddVehicleModal({ agencyId, onClose, onAdded }: { agencyId: string; onClose: () => void; onAdded: () => void }) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [dailyRate, setDailyRate] = useState('');
  const [category, setCategory] = useState('Sedan');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!make || !model || !dailyRate) return;
    setSaving(true);
    await supabase.from('vehicles').insert({
      agency_id: agencyId,
      make,
      model,
      year,
      daily_rate: Number(dailyRate),
      category,
      images: imageUrl ? [imageUrl] : ['https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
      location,
      available: true,
    });
    setSaving(false);
    onAdded();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="obsidian-card rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-heading mb-4">Add Vehicle</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)} className="px-3 py-2.5 rounded-xl obsidian-surface border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm" />
            <input placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} className="px-3 py-2.5 rounded-xl obsidian-surface border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(Number(e.target.value))} className="px-3 py-2.5 rounded-xl obsidian-surface border obsidian-border text-heading focus:border-emerald focus:outline-none text-sm" />
            <input type="number" placeholder="Daily Rate (GH\u20B5)" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} className="px-3 py-2.5 rounded-xl obsidian-surface border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-xl obsidian-surface border obsidian-border text-heading focus:border-emerald focus:outline-none text-sm">
            <option>Sedan</option>
            <option>SUV</option>
            <option>Executive Sedan</option>
            <option>4x4</option>
          </select>
          <input placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-3 py-2.5 rounded-xl obsidian-surface border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm" />
          <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2.5 rounded-xl obsidian-surface border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm" />
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl obsidian-surface border obsidian-border text-muted text-sm font-medium">Cancel</button>
          <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-emerald text-obsidian-900 font-semibold text-sm disabled:opacity-50">
            {saving ? 'Adding\u2026' : 'Add Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
}
