import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUp() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/explore');
    }
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  }

  return (
    <div className="min-h-screen obsidian-bg flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/explore" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-emerald flex items-center justify-center">
                <Car className="w-6 h-6 text-obsidian-900" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold text-heading">
                Drive<span className="text-emerald">Ghana</span>
              </span>
            </Link>
          </div>

          <div className="obsidian-card rounded-2xl p-8">
            <h1 className="text-xl font-bold text-heading mb-1">Create your account</h1>
            <p className="text-sm text-muted mb-6">Join DriveGhana to rent premium vehicles across Ghana</p>

            {error && (
              <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl obsidian-surface border obsidian-border text-heading font-medium hover:border-emerald transition-colors mb-4"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px obsidian-border border-t" />
              <span className="text-xs text-muted">or</span>
              <div className="flex-1 h-px obsidian-border border-t" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Kofi Mensah"
                    className="w-full pl-10 pr-4 py-3 rounded-xl obsidian-surface border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl obsidian-surface border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl obsidian-surface border obsidian-border text-heading placeholder:text-muted/50 focus:border-emerald focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald text-obsidian-900 font-semibold hover:bg-emerald-light transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating account\u2026' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
              Already have an account?{' '}
              <Link to="/signin" className="text-emerald font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
