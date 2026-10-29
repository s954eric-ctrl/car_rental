import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Building2, FileText,
  Car, Wallet, Upload, Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

const STEPS = ['Business Profile', 'Licensing & Compliance', 'Fleet & Services', 'Payout & Settlement'];

const CATEGORY_TIERS = ['Executive Sedans', 'Overland 4x4s', 'Chauffeur', 'Economy', 'Vans'];
const EXECUTIVE_SERVICES = ['Airport meet & greet', 'Rapid roadside dispatch', 'Chauffeur training', 'GPS fleet tracking', 'Corporate accounts'];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [tin, setTin] = useState('');
  const [operationalBase, setOperationalBase] = useState('Greater Accra');
  const [gtaLicense, setGtaLicense] = useState('');
  const [dvlaAccreditation, setDvlaAccreditation] = useState('');
  const [fleetSize, setFleetSize] = useState(5);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [payoutMethod, setPayoutMethod] = useState('mtn_momo');
  const [payoutNumber, setPayoutNumber] = useState('');

  function toggleArray(arr: string[], value: string, setter: (v: string[]) => void) {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  async function handleSubmit() {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('agency_applications').insert({
      user_id: user.id,
      business_name: businessName,
      tin,
      operational_base: operationalBase,
      gta_license: gtaLicense,
      dvla_accreditation: dvlaAccreditation,
      fleet_size: fleetSize,
      category_tiers: selectedTiers,
      executive_services: selectedServices,
      payout_method: payoutMethod,
      payout_number: payoutNumber,
      status: 'pending',
    });
    setSubmitting(false);
    if (!error) setDone(true);
  }

  const canProceed = () => {
    if (step === 0) return businessName && tin;
    if (step === 1) return gtaLicense && dvlaAccreditation;
    if (step === 2) return selectedTiers.length > 0;
    return payoutNumber;
  };

  if (done) {
    return (
      <div className="min-h-screen obsidian-bg flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <CheckCircle2 className="w-10 h-10 text-emerald" />
          </div>
          <h1 className="text-2xl font-bold text-heading mb-2">Application Submitted!</h1>
          <p className="text-muted mb-6">
            Your partner application for <span className="text-emerald font-semibold">{businessName}</span> has been received.
            Our team will review your credentials and respond within 48 hours.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-3 rounded-xl bg-emerald text-obsidian-900 font-semibold hover:bg-emerald-light transition-colors"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen obsidian-bg">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => (step > 0 ? setStep(step - 1) : navigate('/explore'))}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-emerald transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> {step > 0 ? 'Previous Step' : 'Back'}
        </button>

        <h1 className="text-2xl font-bold text-heading mb-1">Partner Agency Onboarding</h1>
        <p className="text-sm text-muted mb-6">Join the DriveGhana ecosystem as a fleet operator</p>

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
                <span className="text-xs font-medium hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-emerald' : 'bg-obsidian-700'}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Business Profile */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Business Profile
            </h2>
            <div>
              <label className="block text-xs text-muted mb-1.5">Official Business Name</label>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="StarDrive Ghana Ltd" className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">RGD / TIN Number</label>
              <input value={tin} onChange={(e) => setTin(e.target.value)} placeholder="CS18492023-GH" className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm" />
              {tin.length >= 5 && <p className="text-xs text-emerald mt-1.5 flex items-center gap-1"><Shield className="w-3 h-3" /> TIN verified with Registrar General's Department</p>}
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Operational Base</label>
              <select value={operationalBase} onChange={(e) => setOperationalBase(e.target.value)} className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading focus:border-emerald focus:outline-none text-sm">
                <option>Greater Accra</option>
                <option>Kumasi/Ashanti</option>
                <option>Western Region</option>
                <option>Volta Region</option>
                <option>Central Region</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 1: Licensing & Compliance */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Licensing & Compliance
            </h2>
            <div>
              <label className="block text-xs text-muted mb-1.5">GTA Operator License Number</label>
              <input value={gtaLicense} onChange={(e) => setGtaLicense(e.target.value)} placeholder="GTA-OPS-2024-XXXX" className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm" />
              <button className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl obsidian-card border obsidian-border text-muted text-sm hover:text-emerald hover:border-emerald transition-colors">
                <Upload className="w-4 h-4" /> Upload GTA License Document
              </button>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">DVLA Fleet Accreditation Number</label>
              <input value={dvlaAccreditation} onChange={(e) => setDvlaAccreditation(e.target.value)} placeholder="DVLA-FLEET-XXXX" className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm" />
              <button className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl obsidian-card border obsidian-border text-muted text-sm hover:text-emerald hover:border-emerald transition-colors">
                <Upload className="w-4 h-4" /> Upload DVLA Certificate
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Fleet & Services */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
              <Car className="w-4 h-4" /> Fleet Capacity & Protocols
            </h2>
            <div>
              <label className="block text-xs text-muted mb-1.5">Fleet Size</label>
              <input type="range" min="1" max="100" value={fleetSize} onChange={(e) => setFleetSize(Number(e.target.value))} className="w-full accent-emerald" />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>1 vehicle</span>
                <span className="text-emerald font-bold">{fleetSize} vehicles</span>
                <span>100+</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-2">Category Tiers</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_TIERS.map((tier) => (
                  <button key={tier} onClick={() => toggleArray(selectedTiers, tier, setSelectedTiers)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTiers.includes(tier) ? 'bg-emerald text-obsidian-900' : 'obsidian-card border obsidian-border text-muted hover:border-emerald/40'}`}>
                    {tier}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-2">Executive Services</label>
              <div className="flex flex-wrap gap-2">
                {EXECUTIVE_SERVICES.map((service) => (
                  <button key={service} onClick={() => toggleArray(selectedServices, service, setSelectedServices)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedServices.includes(service) ? 'bg-emerald text-obsidian-900' : 'obsidian-card border obsidian-border text-muted hover:border-emerald/40'}`}>
                    {service}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payout & Settlement */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Payout & Settlement
            </h2>
            <p className="text-sm text-muted mb-3">Automated 2-hour settlement to your preferred account after each completed rental.</p>
            <div>
              <label className="block text-xs text-muted mb-1.5">Payout Method</label>
              <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading focus:border-emerald focus:outline-none text-sm">
                <option value="mtn_momo">MTN MoMo Merchant Wallet</option>
                <option value="telecel_cash">Telecel Cash Merchant</option>
                <option value="bank">GHIPSS Bank Account</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">{payoutMethod === 'bank' ? 'Bank Account Number' : 'Mobile Money Number'}</label>
              <input value={payoutNumber} onChange={(e) => setPayoutNumber(e.target.value)} placeholder={payoutMethod === 'bank' ? '0123456789012' : '+233 24 XXX XXXX'} className="w-full px-3 py-2.5 rounded-xl obsidian-card border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none text-sm" />
            </div>
            <div className="obsidian-card rounded-xl p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald shrink-0" />
              <p className="text-xs text-muted">All payouts are encrypted and processed through GHIPSS-certified rails. Your banking details are never shared with renters.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="px-5 py-3 rounded-xl obsidian-card border obsidian-border text-muted hover:text-heading transition-colors text-sm font-medium">
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald text-obsidian-900 font-semibold hover:bg-emerald-light transition-colors disabled:opacity-40">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canProceed() || submitting} className="flex-1 py-3 rounded-xl bg-emerald text-obsidian-900 font-semibold hover:bg-emerald-light transition-colors disabled:opacity-50">
              {submitting ? 'Submitting\u2026' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
