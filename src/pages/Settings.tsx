import { useState } from 'react';
import {
  User, Shield, Moon, Sun, Sunset, CreditCard,
  IdCard, LifeBuoy, LogOut, CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/useTheme';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

const THEMES = [
  { id: 'obsidian-dark', label: 'Obsidian Dark', icon: <Moon className="w-5 h-5" />, desc: 'OLED-optimized dark mode' },
  { id: 'classic-light', label: 'Classic Light', icon: <Sun className="w-5 h-5" />, desc: 'Bright daytime mode' },
  { id: 'dusk-dawn', label: 'Dusk-to-Dawn', icon: <Sunset className="w-5 h-5" />, desc: 'Auto solar switch' },
];

export default function Settings() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { currentTheme, setTheme } = useTheme();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  async function handleSaveProfile() {
    if (!user) return;
    setSavingProfile(true);
    await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id);
    refreshProfile();
    setSavingProfile(false);
  }

  return (
    <div className="min-h-screen obsidian-bg">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold text-heading mb-1">Profile & Settings</h1>
        <p className="text-sm text-muted mb-6">Manage your account, security, and appearance</p>

        {/* User identity card */}
        <div className="obsidian-card rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center">
              <User className="w-8 h-8 text-emerald" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-heading">{profile?.full_name || 'Driver'}</h2>
                {profile?.dvla_verified && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald/10 text-emerald text-xs font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" /> DVLA Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-muted">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs font-semibold">Gold Explorer</span>
            </div>
          </div>
        </div>

        {/* Profile editor */}
        <div className="obsidian-card rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted mb-1.5">Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl obsidian-surface border obsidian-border text-heading focus:border-emerald focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 24 XXX XXXX" className="w-full px-3 py-2.5 rounded-xl obsidian-surface border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm" />
            </div>
            <button onClick={handleSaveProfile} disabled={savingProfile} className="px-5 py-2.5 rounded-xl bg-emerald text-obsidian-900 font-semibold text-sm hover:bg-emerald-light transition-colors disabled:opacity-50">
              {savingProfile ? 'Saving\u2026' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Theme Engine */}
        <div className="obsidian-card rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Theme Engine</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {THEMES.map((theme) => (
              <button key={theme.id} onClick={() => setTheme(theme.id)} className={`p-4 rounded-xl border text-left transition-all ${currentTheme === theme.id ? 'border-emerald bg-emerald/10' : 'obsidian-border obsidian-surface hover:border-emerald/40'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${currentTheme === theme.id ? 'bg-emerald text-obsidian-900' : 'obsidian-bg text-muted'}`}>
                  {theme.icon}
                </div>
                <p className="text-sm font-semibold text-heading">{theme.label}</p>
                <p className="text-xs text-muted mt-0.5">{theme.desc}</p>
                {currentTheme === theme.id && <CheckCircle2 className="w-4 h-4 text-emerald mt-2" />}
              </button>
            ))}
          </div>
        </div>

        {/* National ID Vault */}
        <div className="obsidian-card rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <IdCard className="w-4 h-4" /> National ID Vault
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl obsidian-surface">
              <Shield className="w-5 h-5 text-emerald shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-heading">Ghana DVLA Driver's License</p>
                <p className="text-xs text-muted">Encrypted & verified</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald" />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl obsidian-surface">
              <CreditCard className="w-5 h-5 text-emerald shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-heading">Ghana Card (NIA)</p>
                <p className="text-xs text-muted">Encrypted & verified</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald" />
            </div>
          </div>
        </div>

        {/* Emergency Dispatch */}
        <div className="obsidian-card rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Emergency Dispatch</h3>
          <a href="tel:+233302004567" className="flex items-center gap-3 p-3 rounded-xl bg-emerald/10 border border-emerald/20 hover:bg-emerald hover:text-obsidian-900 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-emerald/20 group-hover:bg-obsidian-900/20 flex items-center justify-center text-emerald group-hover:text-obsidian-900">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald group-hover:text-obsidian-900">24/7 Roadside Recovery</p>
              <p className="text-xs text-emerald/70 group-hover:text-obsidian-900/70">Nationwide emergency dispatch</p>
            </div>
            <span className="text-sm font-mono text-emerald group-hover:text-obsidian-900">+233 30 200 4567</span>
          </a>
        </div>

        {/* Sign out */}
        <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl obsidian-card border border-red-500/20 text-red-400 font-medium text-sm hover:bg-red-500/10 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
