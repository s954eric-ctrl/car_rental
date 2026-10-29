import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Download, RotateCcw, MapPin, Car } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Booking, Vehicle, Agency } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatCedi, formatDateShort } from '@/lib/utils';
import Header from '@/components/Header';

type BookingWithDetails = Booking & { vehicle: Vehicle; agency: Agency };

const FILTERS = ['All Rentals', 'Active & Upcoming', 'Completed'];

export default function History() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Rentals');

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase
        .from('bookings')
        .select('*, vehicle:vehicles(*), agency:agencies(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setBookings(data as BookingWithDetails[]);
      setLoading(false);
    }
    load();
  }, [user]);

  const filtered = bookings.filter((b) => {
    if (filter === 'Active & Upcoming') return b.booking_status === 'upcoming' || b.booking_status === 'active';
    if (filter === 'Completed') return b.booking_status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen obsidian-bg">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold text-heading mb-1">Rental History & Past Trips</h1>
        <p className="text-sm text-muted mb-6">Your complete journey ledger</p>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-emerald text-obsidian-900'
                  : 'obsidian-card border obsidian-border text-muted hover:text-heading hover:border-emerald/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="obsidian-card rounded-2xl p-4 animate-pulse">
                <div className="h-20 bg-obsidian-700 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full obsidian-surface flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-muted" />
            </div>
            <p className="text-muted mb-4">No rentals yet. Start exploring to book your first trip.</p>
            <Link
              to="/explore"
              className="inline-block px-6 py-3 rounded-xl bg-emerald text-obsidian-900 font-semibold hover:bg-emerald-light transition-colors"
            >
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <div key={booking.id} className="obsidian-card rounded-2xl p-4 hover:border-emerald/30 transition-colors animate-fade-in">
                <div className="flex items-start gap-4">
                  <img
                    src={booking.vehicle.images?.[0] || ''}
                    alt=""
                    className="w-24 h-20 rounded-lg object-cover obsidian-surface shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-heading">{booking.vehicle.make} {booking.vehicle.model}</h3>
                        <p className="text-xs text-muted">{booking.agency?.name}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        booking.booking_status === 'completed' ? 'bg-obsidian-700 text-muted' :
                        booking.booking_status === 'active' ? 'bg-emerald text-obsidian-900' :
                        'bg-gold/10 text-gold'
                      }`}>
                        {booking.booking_status === 'upcoming' ? 'Upcoming' : booking.booking_status === 'active' ? 'Active' : 'Completed'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateShort(booking.start_date)} \u2013 {formatDateShort(booking.end_date)}
                      </span>
                      {booking.pickup_hub && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5" /> {booking.pickup_hub.split(' ').slice(0, 3).join(' ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-emerald font-bold">{formatCedi(booking.total_cost + booking.deposit)}</span>
                      <div className="flex gap-2">
                        {booking.booking_status === 'upcoming' && (
                          <Link
                            to="/handover"
                            state={{ bookingId: booking.id }}
                            className="px-3 py-1.5 rounded-lg bg-emerald/10 text-emerald text-xs font-medium hover:bg-emerald hover:text-obsidian-900 transition-colors"
                          >
                            View Pass
                          </Link>
                        )}
                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg obsidian-surface border obsidian-border text-muted text-xs font-medium hover:text-emerald hover:border-emerald transition-colors">
                          <Download className="w-3.5 h-3.5" /> Receipt
                        </button>
                        <Link
                          to={`/vehicle/${booking.vehicle_id}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg obsidian-surface border obsidian-border text-muted text-xs font-medium hover:text-emerald hover:border-emerald transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Book Again
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
