import { Car } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen obsidian-bg flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-emerald/10 flex items-center justify-center mb-6">
        <Car className="w-8 h-8 text-emerald" />
      </div>
      <h1 className="text-2xl font-bold text-heading mb-2">Page not found</h1>
      <p className="text-muted mb-6 text-center">The page you're looking for doesn't exist or has been moved.</p>
      <Link
        to="/explore"
        className="px-6 py-3 rounded-xl bg-emerald text-obsidian-900 font-semibold hover:bg-emerald-light transition-colors"
      >
        Back to Explore
      </Link>
    </div>
  );
}
