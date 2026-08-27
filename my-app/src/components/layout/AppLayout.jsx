import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, ArrowLeftRight, Users, BarChart2, User, LayoutDashboard, Sun, Moon, Monitor } from 'lucide-react';
import { useAppStore } from '../../app/store';

const NAV_ITEMS = [
  { label: 'Discover',    path: '/',          icon: Home },
  { label: 'Need AI',     path: '/needs',     icon: Sparkles },
  { label: 'Exchanges',   path: '/exchanges', icon: ArrowLeftRight },
  { label: 'Community',   path: '/community', icon: Users },
  { label: 'Impact',      path: '/impact',    icon: BarChart2 },
  { label: 'Profile',     path: '/profile',   icon: User },
  { label: 'Admin',       path: '/admin',     icon: LayoutDashboard },
];

const THEME_OPTIONS = [
  { value: 'light',  icon: Sun,     label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark',   icon: Moon,    label: 'Dark' },
];

function ThemeToggle({ compact = false }) {
  const theme = useAppStore(s => s.theme);
  const setTheme = useAppStore(s => s.setTheme);
  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'} bg-[var(--surface-raised)] rounded-full p-1`}>
      {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={`${label} theme`}
          className={`flex items-center justify-center rounded-full transition-colors
            ${compact ? 'w-7 h-7' : 'w-8 h-8'}
            ${theme === value
              ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
        >
          <Icon size={compact ? 13 : 14} />
        </button>
      ))}
    </div>
  );
}

function CampusPulse() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-raised)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Campus Pulse</div>
        <div className="font-mono text-xs text-[var(--text-primary)] font-semibold">1,284 resources circulating</div>
      </div>
    </div>
  );
}

// ─── Desktop Sidebar ────────────────────────────────────────────
function Sidebar() {
  const location = useLocation();
  const currentUser = useAppStore(s => s.currentUser);

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--surface)] overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--bg)] font-bold text-sm shrink-0">
            CC
          </div>
          <div>
            <div className="font-serif font-bold text-sm leading-tight text-[var(--text-primary)]">Campus Circular</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">From Ownership to Access</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-[var(--accent)] text-[var(--bg)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 space-y-3">
        <CampusPulse />
        <ThemeToggle />
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--surface-raised)]">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center font-serif font-bold text-sm shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{currentUser.name}</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">Trust {currentUser.trustScore}/100</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Tablet Icon Rail ────────────────────────────────────────────
function TabletRail() {
  const location = useLocation();
  return (
    <aside className="hidden md:flex lg:hidden flex-col w-16 shrink-0 h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--surface)] items-center py-4 gap-1 overflow-y-auto">
      <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--bg)] font-bold text-xs mb-3 shrink-0">
        CC
      </div>
      {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
        const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
        return (
          <Link
            key={path}
            to={path}
            title={label}
            aria-label={label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
              ${isActive
                ? 'bg-[var(--accent)] text-[var(--bg)]'
                : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
              }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          </Link>
        );
      })}
    </aside>
  );
}

// ─── Mobile Header ───────────────────────────────────────────────
function MobileHeader() {
  const currentUser = useAppStore(s => s.currentUser);
  return (
    <header className="md:hidden sticky top-0 z-20 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--bg)] font-bold text-xs">
          CC
        </div>
        <span className="font-serif font-bold text-base text-[var(--text-primary)]">Campus Circular</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
          1,284
        </div>
        <ThemeToggle compact />
      </div>
    </header>
  );
}

// ─── Mobile Bottom Nav ───────────────────────────────────────────
const MOBILE_NAV = NAV_ITEMS.slice(0, 5);

function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)]">
      <ul className="flex justify-around items-center h-16 px-2">
        {MOBILE_NAV.map(({ label, path, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <li key={path}>
              <Link
                to={path}
                className={`flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center transition-colors
                  ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-semibold">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ─── Root Layout ─────────────────────────────────────────────────
export const AppLayout = () => (
  <div className="flex min-h-screen bg-[var(--bg)]">
    <Sidebar />
    <TabletRail />
    <div className="flex-1 flex flex-col min-w-0">
      <MobileHeader />
      <main className="flex-1 pb-16 md:pb-0 overflow-x-hidden">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  </div>
);
