import { useEffect, useState } from 'react';
import { Star, Phone, MessageCircle, Shield, Car, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Agency } from '@/lib/types';
import Header from '@/components/Header';

const REGIONS = ['All Regions', 'Greater Accra', 'Kumasi/Ashanti', 'Airport VIP Hubs', '4x4 Overland Specialists'];

export default function Agencies() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('All Regions');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('agencies').select('*').order('rating', { ascending: false });
      if (data) setAgencies(data as Agency[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = agencies.filter((a) => {
    const matchesRegion = region === 'All Regions' || a.region === region;
    const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="min-h-screen obsidian-bg">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold text-heading mb-1">Verified Rental Agencies</h1>
        <p className="text-sm text-muted mb-6">DVLA & GTA accredited operators across Ghana</p>

        {/* Regulatory trust banner */}
        <div className="obsidian-card rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald" />
            </div>
            <div>
              <p className="text-sm font-semibold text-heading">DVLA & GTA Verified</p>
              <p className="text-xs text-muted">All agencies are government-certified</p>
            </div>
          </div>
          <div className="h-8 w-px obsidian-border border-l hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-heading">Hollard Insurance</p>
              <p className="text-xs text-muted">45-min emergency vehicle swap</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search agencies\u2026"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm"
          />
        </div>

        {/* Region filter chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                region === r
                  ? 'bg-emerald text-obsidian-900'
                  : 'obsidian-card border obsidian-border text-muted hover:text-heading hover:border-emerald/40'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Superhost spotlight */}
        {filtered.some((a) => a.is_superhost) && region !== '4x4 Overland Specialists' && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Superhost Spotlight</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.filter((a) => a.is_superhost).map((agency) => (
                <div key={agency.id} className="obsidian-card rounded-2xl p-5 border-emerald/30 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-emerald/10 flex items-center justify-center">
                      <Car className="w-7 h-7 text-emerald" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-heading">{agency.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs font-semibold">Superhost</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                        <span className="text-sm font-medium text-heading">{agency.rating}</span>
                        <span className="text-sm text-muted">({agency.trip_count} trips)</span>
                      </div>
                      <p className="text-xs text-muted mt-1">{agency.locations.join(' \u00b7 ')} \u00b7 {agency.vehicle_count} vehicles ready</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted mt-3">{agency.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agency profiles */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="obsidian-card rounded-2xl p-5 animate-pulse">
                <div className="h-14 bg-obsidian-700 rounded-xl mb-3" />
                <div className="h-4 bg-obsidian-700 rounded w-2/3 mb-2" />
                <div className="h-3 bg-obsidian-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((agency) => (
              <div key={agency.id} className="obsidian-card rounded-2xl p-5 hover:border-emerald/30 transition-colors animate-fade-in">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-obsidian-700 flex items-center justify-center">
                    <Car className="w-6 h-6 text-emerald" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-heading">{agency.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                      <span className="text-sm font-medium text-heading">{agency.rating}</span>
                      <span className="text-xs text-muted">({agency.trip_count} trips)</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted mb-3 line-clamp-2">{agency.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {agency.dvla_verified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald/10 text-emerald text-xs font-medium flex items-center gap-1">
                      <Shield className="w-3 h-3" /> DVLA
                    </span>
                  )}
                  {agency.gta_verified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald/10 text-emerald text-xs font-medium flex items-center gap-1">
                      <Shield className="w-3 h-3" /> GTA
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full obsidian-surface text-muted text-xs font-medium">
                    {agency.vehicle_count} vehicles
                  </span>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${agency.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg obsidian-surface border obsidian-border text-muted text-sm font-medium hover:text-emerald hover:border-emerald transition-colors">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  <a href={`https://wa.me/${agency.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg obsidian-surface border obsidian-border text-muted text-sm font-medium hover:text-emerald hover:border-emerald transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> Chat
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
