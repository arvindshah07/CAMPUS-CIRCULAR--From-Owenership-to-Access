import { useState } from 'react';
import { Recycle, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';

export function ResourcePassport({ resource, owner }) {
  const [activeTab, setActiveTab] = useState('timeline'); // timeline | health | impact

  // Mocked rich timeline for resource provenance
  const historyEvents = [
    { date: 'May 2026', user: 'Mritunjay', purpose: 'Club Reel Creation', status: 'In Circulation', verified: true, duration: '2 days' },
    { date: 'Apr 2026', user: 'Rohan Desai', purpose: 'College Fest Screening', status: 'Returned Safe', verified: true, duration: '3 days', rating: 5 },
    { date: 'Mar 2026', user: 'Priya Nair', purpose: 'Short Film Shoot', status: 'Returned Safe', verified: true, duration: '4 days', rating: 5 },
    { date: 'Feb 2026', user: owner?.name || 'Aarav Mehta', purpose: 'Original Listing & Inspection', status: 'Verified Mint', verified: true, duration: 'Initial' },
  ];

  return (
    <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-[var(--surface)] to-emerald-500/5 space-y-5 p-5">
      {/* Passport Header */}
      <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-serif text-xl shadow-md">
            <Recycle size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">Permanent Resource Passport™</h3>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">Verified</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-mono">ID: {resource.id} · Owned by {owner?.name || 'Aarav'}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">87/100</div>
          <div className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Circularity Score</div>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-[var(--surface-raised)] rounded-xl text-center">
          <div className="font-mono text-base font-bold text-[var(--text-primary)]">18</div>
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Shared Cycles</div>
        </div>
        <div className="p-3 bg-[var(--surface-raised)] rounded-xl text-center">
          <div className="font-mono text-base font-bold text-[var(--text-primary)]">146d</div>
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Shared Days</div>
        </div>
        <div className="p-3 bg-[var(--surface-raised)] rounded-xl text-center">
          <div className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">₹82,000</div>
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Purchases Avoided</div>
        </div>
        <div className="p-3 bg-[var(--surface-raised)] rounded-xl text-center">
          <div className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">0</div>
          <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Damage Incidents</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-1 px-2 font-semibold transition-colors border-b-2 ${activeTab === 'timeline' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          Lifecycle Timeline
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`pb-1 px-2 font-semibold transition-colors border-b-2 ${activeTab === 'health' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          Component Health
        </button>
      </div>

      {/* Tab 1: Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-3">
          {historyEvents.map((evt, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs relative pl-4 border-l-2 border-emerald-500/30 pb-2">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)]">{evt.user} · <span className="font-normal text-[var(--text-secondary)]">{evt.purpose}</span></span>
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)]">{evt.date}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={11} /> {evt.status}</span>
                  <span>({evt.duration})</span>
                  {evt.rating && <span>★ {evt.rating}.0 Rating</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Health Breakdown */}
      {activeTab === 'health' && (
        <div className="space-y-2.5">
          {[
            { label: 'Optics & Sensor Clarity', pct: 96, state: 'Immaculate' },
            { label: 'Electronic & Battery Life', pct: 94, state: 'Normal (100% capacity)' },
            { label: 'Exterior Shell & Mounts', pct: 98, state: 'No cosmetic dents' },
          ].map(h => (
            <div key={h.label} className="p-2.5 bg-[var(--surface-raised)] rounded-xl space-y-1">
              <div className="flex justify-between text-xs font-semibold text-[var(--text-primary)]">
                <span>{h.label}</span>
                <span className="font-mono text-emerald-600">{h.pct}%</span>
              </div>
              <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${h.pct}%` }} />
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)]">{h.state}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
