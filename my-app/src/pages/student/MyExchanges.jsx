import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, ChevronRight } from 'lucide-react';
import { Card, InteractiveCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAppStore } from '../../app/store';
import { ResourceImage } from '../../components/ui/ResourceImage';

const STATUS_GROUPS = [
  { label: 'Action Required', statuses: ['RETURN_DUE', 'INSPECTION', 'SETTLEMENT', 'RATED'], variant: 'warning' },
  { label: 'Active',          statuses: ['REQUESTED', 'ACCEPTED', 'HANDOVER', 'BORROWED'],   variant: 'success' },
  { label: 'Completed',       statuses: ['RATED'],                                            variant: 'default' },
];

const STATUS_BADGE = {
  REQUESTED:   'warning',
  ACCEPTED:    'success',
  HANDOVER:    'primary',
  BORROWED:    'success',
  RETURN_DUE:  'danger',
  RETURNED:    'default',
  INSPECTION:  'warning',
  SETTLEMENT:  'warning',
  RATED:       'default',
};

export const MyExchanges = () => {
  const navigate  = useNavigate();
  const exchanges   = useAppStore(s => s.exchanges);
  const resources   = useAppStore(s => s.resources);
  const currentUser = useAppStore(s => s.currentUser);

  const myExchanges = exchanges.filter(e => e.borrowerId === currentUser.id || e.ownerId === currentUser.id);

  const active    = myExchanges.filter(e => ['REQUESTED','ACCEPTED','HANDOVER','BORROWED'].includes(e.status));
  const pending   = myExchanges.filter(e => ['RETURN_DUE','INSPECTION','SETTLEMENT'].includes(e.status));
  const completed = myExchanges.filter(e => e.status === 'RATED');

  const groups = [
    { label: 'Action Required', items: pending,   variant: 'danger' },
    { label: 'Active',          items: active,    variant: 'success' },
    { label: 'Completed',       items: completed, variant: 'default' },
  ].filter(g => g.items.length > 0);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">My Exchanges</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{myExchanges.length} total exchanges</p>
      </div>

      {myExchanges.length === 0 && (
        <Card className="text-center py-12 space-y-3">
          <ArrowLeftRight size={32} className="mx-auto text-[var(--text-tertiary)]" />
          <p className="text-[var(--text-secondary)]">No exchanges yet.</p>
          <button onClick={() => navigate('/')} className="text-sm text-[var(--accent)] hover:underline">Browse resources →</button>
        </Card>
      )}

      {groups.map(({ label, items, variant }) => (
        <section key={label} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${variant === 'danger' ? 'bg-[var(--danger)]' : variant === 'success' ? 'bg-[var(--success)]' : 'bg-[var(--border-strong)]'}`} />
            {label} · {items.length}
          </h2>
          {items.map(exc => {
            const res = resources.find(r => r.id === exc.resourceId);
            if (!res) return null;
            return (
              <InteractiveCard key={exc.id} className="p-0 overflow-hidden" onClick={() => navigate(`/exchange/${exc.id}`)}>
                <div className="flex items-center gap-4 p-4">
                  <ResourceImage src={res.image} alt={res.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate">{res.name}</h4>
                      <Badge variant={STATUS_BADGE[exc.status] ?? 'default'}>{exc.status.replace('_', ' ')}</Badge>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {exc.days} day{exc.days !== 1 ? 's' : ''} · ₹{exc.borrowingFee} fee · ₹{exc.securityDeposit} deposit
                    </div>
                    <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-mono">{exc.id}</div>
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-tertiary)] shrink-0" />
                </div>
              </InteractiveCard>
            );
          })}
        </section>
      ))}
    </div>
  );
};
