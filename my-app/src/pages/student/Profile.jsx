import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Star } from 'lucide-react';
import { Card, InteractiveCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAppStore } from '../../app/store';
import { ResourceImage } from '../../components/ui/ResourceImage';

export const Profile = () => {
  const navigate = useNavigate();
  const currentUser = useAppStore(s => s.currentUser);
  const resources   = useAppStore(s => s.resources);
  const myResources = resources.filter(r => r.ownerId === currentUser.id);

  const trustPct = currentUser.trustScore;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Identity */}
      <Card className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center font-serif text-3xl shrink-0">
          {currentUser.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-serif text-[var(--text-primary)]">{currentUser.name}</h1>
            {currentUser.verified && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--success)] bg-[var(--success)]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                <ShieldCheck size={11} /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{currentUser.department} · {currentUser.year}</p>
          <div className="flex items-center gap-1 mt-1">
            {[1,2,3,4,5].map(n => (
              <Star key={n} size={14} className={n <= Math.round(currentUser.rating) ? 'fill-[var(--warning)] text-[var(--warning)]' : 'text-[var(--border)]'} />
            ))}
            <span className="text-xs text-[var(--text-secondary)] ml-1">{currentUser.rating}</span>
          </div>
        </div>
      </Card>

      {/* Trust Score */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-[var(--text-primary)]">Trust Score</h2>
          <span className="font-mono text-3xl font-bold text-[var(--accent)]">{trustPct}</span>
        </div>
        <div className="h-3 bg-[var(--surface-raised)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${trustPct}%` }} />
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">
          {trustPct >= 90 ? 'Very Trusted' : trustPct >= 75 ? 'Trusted' : 'Building Trust'}
        </p>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Exchanges',    value: currentUser.successfulExchanges },
          { label: 'On-time',      value: `${currentUser.onTimeReturns}%` },
          { label: 'Late Returns', value: currentUser.lateReturns },
          { label: 'Disputes',     value: currentUser.activeDisputes },
        ].map(({ label, value }) => (
          <Card key={label} className="text-center py-4">
            <div className="font-mono text-2xl font-bold text-[var(--text-primary)]">{value}</div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mt-1">{label}</div>
          </Card>
        ))}
      </div>

      {/* My Resources */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-[var(--text-primary)]">My Resources</h2>
        {myResources.length === 0 ? (
          <Card className="text-center py-8 text-[var(--text-secondary)]">You haven't listed any resources yet.</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myResources.map(res => (
              <InteractiveCard key={res.id} className="p-0 overflow-hidden" onClick={() => navigate(`/resource/${res.id}`)}>
                <div className="h-32 bg-[var(--surface-raised)] overflow-hidden">
                  <ResourceImage src={res.image} alt={res.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate">{res.name}</h4>
                    <Badge variant={res.adminStatus === 'APPROVED' ? 'success' : 'warning'}>{res.adminStatus}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>{res.condition}</span>
                    <span className="font-mono">₹{res.borrowingFee}/day</span>
                  </div>
                </div>
              </InteractiveCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
