import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../app/store';

export const Login = () => {
  const navigate    = useNavigate();
  const users       = useAppStore(s => s.users);
  const login       = useAppStore(s => s.login);
  const currentUser = useAppStore(s => s.currentUser);

  if (currentUser) return <Navigate to="/" replace />;

  const handleLogin = (userId) => {
    login(userId);
    navigate('/');
  };

  const handleAdmin = () => {
    login('USR-001');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center font-bold text-2xl mx-auto">CC</div>
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">Campus Circular</h1>
          <p className="text-sm text-[var(--text-secondary)]">Choose your profile to enter the platform</p>
        </div>

        {/* User grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => handleLogin(user.id)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center font-serif text-xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="w-full min-w-0">
                <div className="flex items-center gap-1 justify-center flex-wrap">
                  <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name.split(' ')[0]}</span>
                  {user.verified && <ShieldCheck size={11} className="text-[var(--success)] shrink-0" />}
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)] text-center truncate">{user.department}</div>
                <div className="text-[10px] font-mono text-center text-[var(--accent)] mt-0.5">Trust {user.trustScore}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleAdmin}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] underline underline-offset-2 transition-colors"
          >
            Enter as Admin (Arvind Shah)
          </button>
        </div>
      </div>
    </div>
  );
};
