import { Link } from 'react-router-dom';
import { Heart, Users, Fuel, Cog, MapPin, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Vehicle } from '@/lib/types';
import { formatCedi } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('vehicle_id', vehicle.id)
      .maybeSingle()
      .then(({ data }) => setIsFavorite(!!data));
  }, [user, vehicle.id]);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setLoading(true);
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('vehicle_id', vehicle.id);
      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, vehicle_id: vehicle.id });
      setIsFavorite(true);
    }
    setLoading(false);
  }

  const img = vehicle.images?.[0] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

  return (
    <Link
      to={`/vehicle/${vehicle.id}`}
      className="group obsidian-card rounded-2xl overflow-hidden hover:border-emerald/40 transition-all duration-300 animate-fade-in"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden obsidian-surface">
        <img
          src={img}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category pill */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full obsidian-bg/80 backdrop-blur-md text-xs font-semibold text-emerald border border-emerald/20">
          {vehicle.category}
        </div>
        {/* Favorite */}
        <button
          onClick={toggleFavorite}
          disabled={loading}
          className="absolute top-3 right-3 w-8 h-8 rounded-full obsidian-bg/80 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? 'fill-emerald text-emerald' : 'text-white'}`}
          />
        </button>
        {/* Status badges */}
        {vehicle.instant_confirmation && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full obsidian-bg/80 backdrop-blur-md text-xs font-medium text-emerald-light">
            <span className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse" />
            Instant Confirm
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-heading text-base leading-tight">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="text-xs text-muted">{vehicle.year}</span>
        </div>
        {vehicle.agency && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-3.5 h-3.5 text-gold fill-gold" />
            <span className="text-xs font-medium text-heading">{vehicle.agency.rating}</span>
            <span className="text-xs text-muted">\u00b7 {vehicle.agency.name}</span>
          </div>
        )}

        {/* Spec icons */}
        <div className="flex items-center gap-4 mb-3 text-muted">
          <span className="flex items-center gap-1 text-xs">
            <Users className="w-3.5 h-3.5" /> {vehicle.passengers}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Cog className="w-3.5 h-3.5" /> {vehicle.transmission === 'Automatic' ? 'Auto' : 'Manual'}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Fuel className="w-3.5 h-3.5" /> {vehicle.fuel_type}
          </span>
          {vehicle.location && (
            <span className="flex items-center gap-1 text-xs truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" /> {vehicle.location.split('\u00b7')[0].trim()}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-heading">{formatCedi(vehicle.daily_rate)}</span>
            <span className="text-xs text-muted">/day</span>
          </div>
          <div className="px-4 py-1.5 rounded-lg bg-emerald/10 text-emerald text-sm font-semibold group-hover:bg-emerald group-hover:text-obsidian-900 transition-colors">
            Rent Now
          </div>
        </div>
        {vehicle.chauffeur_available && (
          <p className="text-xs text-muted mt-2">+ Chauffeur available (+{formatCedi(vehicle.chauffeur_rate)}/day)</p>
        )}
      </div>
    </Link>
  );
}
