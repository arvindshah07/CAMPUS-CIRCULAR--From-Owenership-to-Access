import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Star, Package, Clock, AlertTriangle, MapPin, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { Card, InteractiveCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAppStore } from '../../app/store';
import { computeTrustScore } from '../../app/store';
import { ResourceImage } from '../../components/ui/ResourceImage';
import { CampusMap } from '../../components/ui/CampusMap';

// ─── Trust breakdown bar ─────────────────────────────────────────
function TrustBar({ label, value, max, color = 'var(--accent)' }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="font-mono text-[var(--text-primary)]">{value}{typeof max === 'string' ? '' : `/${max}`}</span>
      </div>
      <div className="h-1.5 bg-[var(--surface-raised)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, (value / (typeof max === 'number' ? max : 100)) * 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────
export const Profile = () => {
  const navigate    = useNavigate();
  const currentUser = useAppStore(s => s.currentUser);
  const resources   = useAppStore(s => s.resources);
  const exchanges   = useAppStore(s => s.exchanges);
  const users       = useAppStore(s => s.users);

  // Always read fresh user object from users array (admin may have updated it)
  const user = useMemo(
    () => users.find(u => u.id === currentUser?.id) ?? currentUser,
    [users, currentUser]
  );

  const liveScore = useMemo(() => computeTrustScore(user, exchanges), [user, exchanges]);

  const myResources = resources.filter(r => r.ownerId === user.id);

  const myExchanges = exchanges.filter(
    e => e.borrowerId === user.id || e.ownerId === user.id
  );
  const completedExchanges = myExchanges.filter(e => e.status === 'RATED');
  const activeExchanges    = myExchanges.filter(e => !['RATED', 'SETTLEMENT'].includes(e.status));
  const lateCount  = myExchanges.filter(e => e.isLate).length;
  const disputeCount = myExchanges.filter(e => e.disputeId).length;

  const avgRating = useMemo(() => {
    const rated = myExchanges.filter(e => e.rating);
    if (!rated.length) return user.rating;
    return (rated.reduce((s, e) => s + e.rating, 0) / rated.length).toFixed(1);
  }, [myExchanges, user.rating]);

  const trustLabel = liveScore >= 90 ? 'Very Trusted' : liveScore >= 75 ? 'Trusted' : liveScore >= 55 ? 'Building Trust' : 'New Member';
  const trustColor = liveScore >= 90 ? 'var(--success)' : liveScore >= 75 ? 'var(--accent)' : 'var(--warning)';

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">

      {/* ── Identity hero ── */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 80% 50%, ${trustColor}, transparent 70%)` }} />
        <div className="relative flex items-start gap-5 flex-wrap">
          <div className="w-20 h-20 rounded-2xl bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center font-serif text-4xl shrink-0 shadow-lg">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-serif text-[var(--text-primary)]">{user.name}</h1>
              {user.verified && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--success)] bg-[var(--success)]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  <ShieldCheck size={11} /> Verified
                </span>
              )}
              {user.status === 'FLAGGED' && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--danger)] bg-[var(--danger)]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  <AlertTriangle size={11} /> Flagged
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{user.department} · {user.year}</p>
            <div className="flex items-center gap-1 mt-1.5">
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={14} className={n <= Math.round(Number(avgRating)) ? 'fill-[var(--warning)] text-[var(--warning)]' : 'text-[var(--border)]'} />
              ))}
              <span className="text-xs text-[var(--text-secondary)] ml-1">{avgRating} avg rating</span>
            </div>
          </div>
          {/* Live trust badge */}
          <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl shrink-0" style={{ background: `${trustColor}15`, border: `2px solid ${trustColor}40` }}>
            <span className="font-mono text-3xl font-bold" style={{ color: trustColor }}>{liveScore}</span>
            <span className="text-[9px] uppercase tracking-wide text-[var(--text-tertiary)] mt-0.5">Trust</span>
          </div>
        </div>
      </Card>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Exchanges', value: myExchanges.length,      icon: ArrowLeftRight, color: 'var(--accent)' },
          { label: 'Completed',       value: completedExchanges.length, icon: CheckCircle2,  color: 'var(--success)' },
          { label: 'Active Now',      value: activeExchanges.length,   icon: Clock,          color: 'var(--warning)' },
          { label: 'Disputes',        value: disputeCount,             icon: AlertTriangle,  color: disputeCount > 0 ? 'var(--danger)' : 'var(--text-tertiary)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="text-center py-4 space-y-1">
            <Icon size={18} className="mx-auto mb-1" style={{ color }} />
            <div className="font-mono text-2xl font-bold text-[var(--text-primary)]">{value}</div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">{label}</div>
          </Card>
        ))}
      </div>

      {/* ── Trust breakdown ── */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-[var(--text-primary)]">Trust Breakdown</h2>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ color: trustColor, background: `${trustColor}15` }}>{trustLabel}</span>
        </div>
        <div className="space-y-3">
          <TrustBar label="On-time Returns"   value={user.onTimeReturns} max={100} color="var(--success)" />
          <TrustBar label="Experience (exchanges)" value={Math.min(myExchanges.length || user.successfulExchanges, 60)} max={60} color="var(--accent)" />
          <TrustBar label="Peer Rating"       value={Number(avgRating)} max={5} color="var(--warning)" />
          <TrustBar label="Late Returns"      value={lateCount || user.lateReturns} max={10} color="var(--danger)" />
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)]">
          Score = (on-time% × 0.35) + experience + rating + verified bonus − penalties
        </p>
      </Card>

      {/* ── Campus map ── */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-[var(--text-primary)] flex items-center gap-2">
          <MapPin size={18} className="text-[var(--accent)]" /> Resource Map
        </h2>
        <CampusMap
          mode="multi"
          resources={myResources.length ? myResources : resources.filter(r => r.adminStatus === 'APPROVED' && r.coords)}
        />
      </section>

      {/* ── Recent exchanges ── */}
      {myExchanges.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-xl text-[var(--text-primary)]">Recent Activity</h2>
          <div className="space-y-2">
            {myExchanges.slice(0, 5).map(exc => {
              const res = resources.find(r => r.id === exc.resourceId);
              const isOwner = exc.ownerId === user.id;
              return (
                <InteractiveCard key={exc.id} className="flex items-center gap-4 py-3" onClick={() => navigate(`/exchange/${exc.id}`)}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[var(--surface-raised)]">
                    {res && <ResourceImage src={res.image} alt={res.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{res?.name ?? exc.resourceId}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{isOwner ? 'You lent this' : 'You borrowed this'} · ₹{exc.borrowingFee}</p>
                  </div>
                  <Badge variant={exc.status === 'RATED' ? 'success' : exc.status === 'BORROWED' ? 'primary' : 'warning'}>
                    {exc.status}
                  </Badge>
                </InteractiveCard>
              );
            })}
          </div>
        </section>
      )}

      {/* ── My listed resources ── */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl text-[var(--text-primary)] flex items-center gap-2">
          <Package size={18} className="text-[var(--accent)]" /> My Resources
        </h2>
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
                    <span className="flex items-center gap-1"><MapPin size={10} />{res.location}</span>
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
