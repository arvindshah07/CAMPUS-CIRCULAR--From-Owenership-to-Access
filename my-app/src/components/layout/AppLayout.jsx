import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Compass, User, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '../../app/store';

export const AppLayout = () => {
  const location = useLocation();
  const currentUser = useAppStore(state => state.currentUser);

  const navItems = [
    { label: 'Discover', path: '/', icon: Home },
    { label: 'Needs', path: '/needs', icon: Compass },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Admin', path: '/admin', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-surface shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-surface/80 backdrop-blur-md z-10 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-surface font-bold text-sm">
            CC
          </div>
          <span className="font-serif font-bold text-lg tracking-tight">Campus Circular</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold">{currentUser.name}</div>
            <div className="text-[10px] text-text-muted">{currentUser.trustScore} Trust Score</div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 relative">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border px-6 py-4 z-20">
        <ul className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link to={item.path} className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-text-light hover:text-text-muted'}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
