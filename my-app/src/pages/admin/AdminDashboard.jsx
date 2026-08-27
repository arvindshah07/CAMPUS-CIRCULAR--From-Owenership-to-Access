import { useState } from 'react';
import { Package, Users, ArrowLeftRight, ShieldAlert, CheckCircle2, X, Flag, LayoutDashboard } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../app/store';
import { ResourceImage } from '../../components/ui/ResourceImage';

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: LayoutDashboard },
  { id: 'resources',  label: 'Resources',  icon: Package },
  { id: 'users',      label: 'Users',      icon: Users },
  { id: 'exchanges',  label: 'Exchanges',  icon: ArrowLeftRight },
  { id: 'disputes',   label: 'Disputes',   icon: ShieldAlert },
];

function Overview({ resources, exchanges, disputes, users }) {
  const pending  = resources.filter(r => r.adminStatus === 'PENDING').length;
  const overdue  = exchanges.filter(e => e.status === 'RETURN_DUE').length;
  const openDisp = disputes.filter(d => d.status === 'UNDER_REVIEW').length;
  const flagged  = users.filter(u => u.status === 'FLAGGED').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Approvals', value: pending,  color: 'var(--warning)', icon: Package },
          { label: 'Overdue Returns',   value: overdue,  color: 'var(--danger)',  icon: ArrowLeftRight },
          { label: 'Open Disputes',     value: openDisp, color: 'var(--danger)',  icon: ShieldAlert },
          { label: 'Flagged Users',     value: flagged,  color: 'var(--warning)', icon: Flag },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label} className="space-y-2">
            <Icon size={16} style={{ color }} />
            <div className="font-mono text-3xl font-bold text-[var(--text-primary)]">{value}</div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">{label}</div>
          </Card>
        ))}
      </div>
      <Card className="space-y-3">
        <h3 className="font-serif text-lg text-[var(--text-primary)]">Platform Fees Collected</h3>
        <div className="font-mono text-4xl font-bold text-[var(--text-primary)]">₹12,480</div>
        <p className="text-xs text-[var(--text-tertiary)]">5% of all borrowing fees · this month</p>
      </Card>
    </div>
  );
}

function ResourcesTab({ resources, approveResource, rejectResource }) {
  const [filter, setFilter] = useState('ALL');
  const filtered = filter === 'ALL' ? resources : resources.filter(r => r.adminStatus === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors
              ${filter === f ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(res => (
          <Card key={res.id} className="flex items-center gap-4">
            <ResourceImage src={res.image} alt={res.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-[var(--text-primary)] truncate">{res.name}</div>
              <div className="text-xs text-[var(--text-secondary)]">{res.category} · {res.condition}</div>
            </div>
            <Badge variant={res.adminStatus === 'APPROVED' ? 'success' : res.adminStatus === 'REJECTED' ? 'danger' : 'warning'}>
              {res.adminStatus}
            </Badge>
            {res.adminStatus === 'PENDING' && (
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="secondary" onClick={() => approveResource(res.id)} className="gap-1">
                  <CheckCircle2 size={13} /> Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => rejectResource(res.id)} className="gap-1">
                  <X size={13} /> Reject
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function UsersTab({ users, flagUser }) {
  return (
    <div className="space-y-3">
      {users.map(user => (
        <Card key={user.id} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center font-serif font-bold shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-[var(--text-primary)]">{user.name}</div>
            <div className="text-xs text-[var(--text-secondary)]">{user.department} · Trust {user.trustScore}</div>
          </div>
          <Badge variant={user.status === 'FLAGGED' ? 'danger' : 'success'}>{user.status ?? 'ACTIVE'}</Badge>
          {user.status !== 'FLAGGED' && (
            <Button size="sm" variant="ghost" onClick={() => flagUser(user.id)} className="gap-1 text-[var(--warning)] shrink-0">
              <Flag size={13} /> Flag
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}

function ExchangesTab({ exchanges, resources }) {
  return (
    <div className="space-y-3">
      {exchanges.length === 0 && <Card className="text-center py-8 text-[var(--text-secondary)]">No exchanges yet.</Card>}
      {exchanges.map(exc => {
        const res = resources.find(r => r.id === exc.resourceId);
        const isOverdue = exc.status === 'RETURN_DUE';
        return (
          <Card key={exc.id} className={`flex items-center gap-4 ${isOverdue ? 'border-[var(--danger)]/30 bg-[var(--danger)]/5' : ''}`}>
            {res && <ResourceImage src={res.image} alt={res.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-[var(--text-primary)] truncate">{res?.name ?? exc.resourceId}</div>
              <div className="text-[10px] font-mono text-[var(--text-tertiary)]">{exc.id}</div>
            </div>
            <Badge variant={isOverdue ? 'danger' : 'default'}>{exc.status.replace('_', ' ')}</Badge>
          </Card>
        );
      })}
    </div>
  );
}

function DisputesTab({ disputes, resolveDispute }) {
  return (
    <div className="space-y-3">
      {disputes.length === 0 && <Card className="text-center py-8 text-[var(--text-secondary)]">No disputes.</Card>}
      {disputes.map(d => (
        <Card key={d.id} className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-sm text-[var(--text-primary)]">{d.issue.type}</div>
              <div className="text-[10px] font-mono text-[var(--text-tertiary)]">{d.id} · {d.exchangeId}</div>
            </div>
            <Badge variant={d.status === 'RESOLVED' ? 'success' : 'warning'}>{d.status.replace('_', ' ')}</Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{d.issue.description}</p>
          {d.status === 'RESOLVED' && d.resolution && (
            <p className="text-xs text-[var(--success)] bg-[var(--success)]/10 px-3 py-2 rounded-lg">{d.resolution}</p>
          )}
          {d.status === 'UNDER_REVIEW' && (
            <Button size="sm" variant="secondary" onClick={() => resolveDispute(d.id, 'Reviewed and resolved by admin.')}>
              Mark Resolved
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}

export const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const resources       = useAppStore(s => s.resources);
  const exchanges        = useAppStore(s => s.exchanges);
  const disputes         = useAppStore(s => s.disputes);
  const users            = useAppStore(s => s.users);
  const approveResource  = useAppStore(s => s.approveResource);
  const rejectResource   = useAppStore(s => s.rejectResource);
  const flagUser         = useAppStore(s => s.flagUser);
  const resolveDispute   = useAppStore(s => s.resolveDispute);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">Admin Console</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Platform management and moderation</p>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide bg-[var(--surface-raised)] p-1 rounded-xl">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
              ${tab === id ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview'  && <Overview resources={resources} exchanges={exchanges} disputes={disputes} users={users} />}
      {tab === 'resources' && <ResourcesTab resources={resources} approveResource={approveResource} rejectResource={rejectResource} />}
      {tab === 'users'     && <UsersTab users={users} flagUser={flagUser} />}
      {tab === 'exchanges' && <ExchangesTab exchanges={exchanges} resources={resources} />}
      {tab === 'disputes'  && <DisputesTab disputes={disputes} resolveDispute={resolveDispute} />}
    </div>
  );
};
