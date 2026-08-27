import { RefreshCw, Users, ArrowLeftRight, IndianRupee, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../app/store';

const CATEGORY_DATA = [
  { name: 'Create',  count: 487, color: 'var(--accent)' },
  { name: 'Study',   count: 312, color: 'var(--success)' },
  { name: 'Events',  count: 198, color: 'var(--warning)' },
  { name: 'Sports',  count: 156, color: 'var(--danger)' },
  { name: 'Outdoor', count: 89,  color: 'var(--text-secondary)' },
  { name: 'Music',   count: 42,  color: 'var(--text-tertiary)' },
];
const MAX_COUNT = CATEGORY_DATA[0].count;

export const Impact = () => {
  const resources = useAppStore(s => s.resources);
  const exchanges  = useAppStore(s => s.exchanges);
  const approvedCount = resources.filter(r => r.adminStatus === 'APPROVED').length;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif text-[var(--text-primary)]">Campus Impact</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">The circular economy in numbers.</p>
      </div>

      {/* Hero metric */}
      <Card className="bg-[var(--accent)] text-[var(--bg)] border-none p-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest opacity-60 mb-2">Resources Reused</div>
            <div className="text-6xl md:text-7xl font-serif font-bold leading-none">1,284</div>
            <div className="text-sm opacity-70 mt-3">↓ equivalent to 842 new purchases avoided</div>
          </div>
          <RefreshCw size={40} className="opacity-20" />
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users,          label: 'Active Members',    value: '24.8K', sub: '↑ 12% this month' },
          { icon: ArrowLeftRight, label: 'Exchanges',         value: '3,241', sub: '643 active now' },
          { icon: IndianRupee,    label: 'Money Saved',       value: '₹2.4L', sub: 'vs buying new' },
          { icon: TrendingUp,     label: 'On-time Returns',   value: '97.2%', sub: 'campus average' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <Card key={label} className="space-y-2">
            <Icon size={18} className="text-[var(--text-tertiary)]" />
            <div className="font-mono text-2xl font-bold text-[var(--text-primary)]">{value}</div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">{label}</div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{sub}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Category distribution */}
      <Card className="space-y-5">
        <h2 className="font-serif text-xl text-[var(--text-primary)]">Most Borrowed Categories</h2>
        <div className="space-y-3">
          {CATEGORY_DATA.map(({ name, count, color }) => (
            <div key={name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-primary)] font-medium">{name}</span>
                <span className="font-mono text-[var(--text-secondary)]">{count}</span>
              </div>
              <div className="h-2 bg-[var(--surface-raised)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(count / MAX_COUNT) * 100}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Additional metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <h3 className="font-serif text-lg text-[var(--text-primary)]">Community Requests</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]"><span>Total posted</span><span className="font-mono font-semibold text-[var(--text-primary)]">284</span></div>
            <div className="flex justify-between text-[var(--text-secondary)]"><span>Fulfilled</span><span className="font-mono font-semibold text-[var(--success)]">231</span></div>
            <div className="flex justify-between text-[var(--text-secondary)]"><span>Fulfillment rate</span><span className="font-mono font-semibold text-[var(--text-primary)]">81.3%</span></div>
          </div>
        </Card>
        <Card className="space-y-3">
          <h3 className="font-serif text-lg text-[var(--text-primary)]">Most Borrowed</h3>
          <div className="space-y-2">
            {[
              { name: 'Sony ZV-E10 Camera', count: 127 },
              { name: 'Portable Projector',  count: 98 },
              { name: 'Scientific Calculator', count: 87 },
            ].map(({ name, count }) => (
              <div key={name} className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)] truncate">{name}</span>
                <span className="font-mono font-semibold text-[var(--text-primary)] shrink-0 ml-2">{count}×</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
