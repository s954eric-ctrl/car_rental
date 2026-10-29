import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Vehicle, Agency } from '@/lib/types';
import VehicleCard from '@/components/VehicleCard';
import Header from '@/components/Header';

type VehicleWithAgency = Vehicle & { agency: Agency | null };

const CATEGORIES = ['All', 'Executive Sedan', 'SUV', 'Sedan', '4x4'];

export default function Explore() {
  const [vehicles, setVehicles] = useState<VehicleWithAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('vehicles')
        .select('*, agency:agencies(*)')
        .eq('available', true)
        .order('created_at', { ascending: false });
      if (data) setVehicles(data as VehicleWithAgency[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        !search ||
        `${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase()) ||
        v.agency?.name.toLowerCase().includes(search.toLowerCase()) ||
        v.location?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || v.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [vehicles, search, category]);

  return (
    <div className="min-h-screen obsidian-bg">
      <Header />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 relative">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-emerald" />
            <span className="text-sm font-medium text-emerald">Accra, GH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading mb-1">Find your perfect ride</h1>
          <p className="text-sm text-muted">Premium vehicles from Ghana's verified rental agencies</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by car, agency, or location\u2026"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none transition-colors text-sm"
            />
          </div>
          <button className="px-4 py-2.5 rounded-xl obsidian-card border obsidian-border text-muted hover:text-heading hover:border-emerald transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-emerald text-obsidian-900'
                  : 'obsidian-card border obsidian-border text-muted hover:text-heading hover:border-emerald/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="obsidian-card rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[16/10] obsidian-surface" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-obsidian-700 rounded w-3/4" />
                  <div className="h-3 bg-obsidian-700 rounded w-1/2" />
                  <div className="h-8 bg-obsidian-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted">No vehicles found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
