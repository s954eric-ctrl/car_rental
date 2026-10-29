import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell, User, Car, Heart, Settings, LogOut, Building2,
  Calendar, CreditCard, ShieldCheck, Tag, Clock, Check,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { SAMPLE_NOTIFICATIONS, type AppNotification, type NotificationType } from '@/lib/notifications';

const NOTIFICATION_ICONS: Record<NotificationType, React.ReactNode> = {
  booking: <Calendar className="w-4 h-4" />,
  payment: <CreditCard className="w-4 h-4" />,
  system: <ShieldCheck className="w-4 h-4" />,
  agency: <Building2 className="w-4 h-4" />,
  promo: <Tag className="w-4 h-4" />,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  booking: 'bg-emerald/10 text-emerald',
  payment: 'bg-gold/10 text-gold',
  system: 'bg-blue-500/10 text-blue-400',
  agency: 'bg-purple-500/10 text-purple-400',
  promo: 'bg-rose-500/10 text-rose-400',
};

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(SAMPLE_NOTIFICATIONS);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;
  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleNotificationClick(n: AppNotification) {
    setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
    if (n.actionPath) {
      setNotifOpen(false);
      navigate(n.actionPath);
    }
  }

  return (
    <header className="sticky top-0 z-40 obsidian-bg border-b obsidian-border backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/explore" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald flex items-center justify-center">
              <Car className="w-5 h-5 text-obsidian-900" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-heading hidden sm:block">
              Drive<span className="text-emerald">Ghana</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/explore" active={isActive('/explore')} icon={<Car className="w-4 h-4" />} label="Explore" />
            <NavLink to="/history" active={isActive('/history')} icon={<Heart className="w-4 h-4" />} label="My Trips" />
            <NavLink to="/agencies" active={isActive('/agencies')} icon={<Building2 className="w-4 h-4" />} label="Agencies" />
            <NavLink to="/onboarding" active={isActive('/onboarding')} icon={<Building2 className="w-4 h-4" />} label="Partner" />
            <NavLink to="/agency-portal" active={isActive('/agency-portal')} icon={<Settings className="w-4 h-4" />} label="Agency Portal" />
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`p-2 rounded-lg transition-colors relative ${
                  notifOpen ? 'bg-obsidian-800 text-emerald' : 'hover:bg-obsidian-800 text-muted hover:text-heading'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-emerald rounded-full flex items-center justify-center text-[10px] font-bold text-obsidian-900">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] obsidian-card rounded-2xl shadow-2xl border obsidian-border animate-fade-in overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b obsidian-border">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-heading text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald/10 text-emerald text-xs font-semibold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-emerald font-medium hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className="w-full flex items-start gap-3 px-4 py-3 border-b obsidian-border last:border-0 text-left hover:bg-obsidian-800/50 transition-colors group"
                        >
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${NOTIFICATION_COLORS[n.type]}`}>
                            {NOTIFICATION_ICONS[n.type]}
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className={`text-sm font-semibold truncate ${n.read ? 'text-muted' : 'text-heading'}`}>
                                {n.title}
                              </p>
                              {!n.read && <span className="w-2 h-2 bg-emerald rounded-full shrink-0" />}
                            </div>
                            <p className="text-xs text-muted leading-relaxed line-clamp-2">{n.message}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[11px] text-muted/70 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {n.time}
                              </span>
                              {n.actionLabel && (
                                <span className="text-[11px] text-emerald font-medium group-hover:underline">
                                  {n.actionLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t obsidian-border">
                    <button
                      onClick={() => { setNotifOpen(false); navigate('/history'); }}
                      className="w-full text-center text-xs text-muted hover:text-emerald font-medium transition-colors"
                    >
                      View all activity
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full bg-obsidian-800 border border-obsidian-700 flex items-center justify-center hover:border-emerald transition-colors"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-muted" />
                )}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 obsidian-card rounded-xl shadow-2xl border obsidian-border py-2 animate-fade-in">
                  <div className="px-4 py-2 border-b obsidian-border">
                    <p className="text-sm font-semibold text-heading truncate">{profile?.full_name || 'Driver'}</p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>
                  <MenuItem onClick={() => { setMenuOpen(false); navigate('/settings'); }} icon={<Settings className="w-4 h-4" />}>
                    Profile & Settings
                  </MenuItem>
                  <MenuItem onClick={() => { setMenuOpen(false); navigate('/history'); }} icon={<Heart className="w-4 h-4" />}>
                    Rental History
                  </MenuItem>
                  <MenuItem onClick={() => { setMenuOpen(false); navigate('/agency-portal'); }} icon={<Building2 className="w-4 h-4" />}>
                    Agency Portal
                  </MenuItem>
                  <div className="border-t obsidian-border my-1" />
                  <MenuItem onClick={() => { setMenuOpen(false); signOut(); }} icon={<LogOut className="w-4 h-4" />} danger>
                    Sign Out
                  </MenuItem>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'text-emerald bg-emerald-glow' : 'text-muted hover:text-heading hover:bg-obsidian-800'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MenuItem({ onClick, icon, children, danger }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${
        danger ? 'text-red-400 hover:bg-red-500/10' : 'text-muted hover:text-heading hover:bg-obsidian-800'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
