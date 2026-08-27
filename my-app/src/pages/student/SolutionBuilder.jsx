import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Package, Users, IndianRupee, ChevronRight, CheckCircle2, AlertTriangle, Star, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card, InteractiveCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ResourceImage } from '../../components/ui/ResourceImage';
import { useAppStore } from '../../app/store';
import { computeDeposit } from '../../app/store';
import { buildSolution } from '../../engine/solutionBuilder';

const DEMO_NEEDS = [
  "I need to shoot a reel for my club event tomorrow",
  "Equipment for our college short film this weekend",
  "Setup for a department presentation next week",
  "Gear for a camping trip this weekend",
];

const BUNDLE_COLORS = {
  cheapest:  { bg: 'bg-green-50',  border: 'border-green-200',  accent: '#16a34a', badge: 'bg-green-100 text-green-700' },
  best:      { bg: 'bg-blue-50',   border: 'border-blue-300',   accent: '#2563eb', badge: 'bg-blue-100 text-blue-700' },
  one_owner: { bg: 'bg-purple-50', border: 'border-purple-200', accent: '#7c3aed', badge: 'bg-purple-100 text-purple-700' },
};

function BundleCard({ bundle, users, onSelect, selected }) {
  const colors = BUNDLE_COLORS[bundle.id];
  const ownerSet = [...new Set(bundle.items.map(i => i.resource.ownerId))];
  const totalDeposit = bundle.items.reduce((s, i) => s + i.resource.securityDeposit, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 p-4 cursor-pointer transition-all ${colors.bg} ${
        selected ? colors.border + ' shadow-lg scale-[1.01]' : 'border-transparent hover:' + colors.border
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>{bundle.label}</span>
            {bundle.highlight && <Zap size={13} className="text-blue-500" />}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">{bundle.description}</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-xl font-bold" style={{ color: colors.accent }}>₹{bundle.totalCost}</div>
          <div className="text-[9px] text-gray-400">/day total</div>
        </div>
      </div>

      {/* Resource items */}
      <div className="space-y-2 mb-3">
        {bundle.items.map(({ slot, resource }) => {
          const owner = users.find(u => u.id === resource.ownerId);
          return (
            <div key={slot} className="flex items-center gap-2.5 bg-white/70 rounded-xl p-2">
              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                <ResourceImage src={resource.image} alt={resource.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{slot}</div>
                <div className="text-xs font-medium text-gray-800 truncate">{resource.name}</div>
                <div className="text-[10px] text-gray-400">{owner?.name} · Trust {owner?.trustScore}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-xs font-bold text-gray-700">₹{resource.borrowingFee}</div>
                <div className="text-[9px] text-gray-400">/day</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-2 border-t border-white/60">
        <span className="flex items-center gap-1"><Package size={10} />{bundle.items.length} items</span>
        <span className="flex items-center gap-1"><Users size={10} />{bundle.owners} owner{bundle.owners > 1 ? 's' : ''}</span>
        <span className="flex items-center gap-1"><IndianRupee size={10} />₹{totalDeposit} deposit</span>
        {selected && <span className="ml-auto flex items-center gap-1 font-semibold" style={{ color: colors.accent }}><CheckCircle2 size={11} />Selected</span>}
      </div>
    </motion.div>
  );
}

function TradeoffExplainer({ bundles }) {
  const cheapest = bundles.find(b => b.id === 'cheapest');
  const best = bundles.find(b => b.id === 'best');
  if (!cheapest || !best || cheapest.totalCost === best.totalCost) return null;
  const diff = best.totalCost - cheapest.totalCost;

  // Find what's better in best vs cheapest
  const improvements = [];
  best.items.forEach(({ slot, resource: bRes }) => {
    const cItem = cheapest.items.find(i => i.slot === slot);
    if (!cItem) return;
    if (bRes.trustScore > cItem.resource.trustScore + 5)
      improvements.push(`Higher trust owner for ${slot} (+${bRes.trustScore - cItem.resource.trustScore} pts)`);
    if (bRes.condition !== cItem.resource.condition && (bRes.condition === 'Excellent' || bRes.condition === 'Like New'))
      improvements.push(`Better condition ${slot} (${bRes.condition})`);
  });

  return (
    <Card className="border-amber-200 bg-amber-50 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} className="text-amber-500 shrink-0" />
        <h4 className="text-sm font-semibold text-amber-800">Why not just pick the cheapest?</h4>
      </div>
      <p className="text-xs text-amber-700">
        Best Match costs <span className="font-bold">₹{diff} more/day</span> than Cheapest, but:
      </p>
      <ul className="space-y-1">
        {improvements.slice(0, 3).map((imp, i) => (
          <li key={i} className="flex items-center gap-1.5 text-xs text-amber-700">
            <Star size={10} className="text-amber-500 shrink-0" />{imp}
          </li>
        ))}
        {improvements.length === 0 && (
          <li className="text-xs text-amber-700">Higher overall match score across all slots.</li>
        )}
      </ul>
    </Card>
  );
}

export const SolutionBuilder = () => {
  const navigate = useNavigate();
  const resources   = useAppStore(s => s.resources);
  const users       = useAppStore(s => s.users);
  const currentUser = useAppStore(s => s.currentUser);

  const [input, setInput]         = useState('');
  const [status, setStatus]       = useState('idle'); // idle | building | result
  const [solution, setSolution]   = useState(null);
  const [selectedBundle, setSelectedBundle] = useState('best');

  const handleBuild = () => {
    if (!input.trim()) return;
    setStatus('building');
    setTimeout(() => {
      const sol = buildSolution(input, resources);
      setSolution(sol);
      setStatus(sol ? 'result' : 'no_match');
    }, 1400);
  };

  const activeBundle = useMemo(
    () => solution?.bundles.find(b => b.id === selectedBundle),
    [solution, selectedBundle]
  );

  const depositInfo = useMemo(() => {
    if (!activeBundle) return null;
    return activeBundle.items.map(({ slot, resource }) => ({
      slot,
      resource,
      deposit: computeDeposit(resource.securityDeposit, currentUser?.trustScore ?? 70),
    }));
  }, [activeBundle, currentUser]);

  const totalAdjustedDeposit = depositInfo?.reduce((s, d) => s + d.deposit.adjusted, 0) ?? 0;
  const totalSaving = depositInfo?.reduce((s, d) => s + d.deposit.saving, 0) ?? 0;

  return (
    <div className="min-h-full bg-[var(--bg)]">
      <AnimatePresence mode="wait">

        {/* ── Idle ── */}
        {status === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-6 max-w-2xl mx-auto flex flex-col justify-center min-h-[80vh] space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] flex items-center justify-center">
                  <Package size={20} className="text-[var(--bg)]" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif text-[var(--text-primary)]">Solution Builder</h1>
                  <p className="text-xs text-[var(--text-tertiary)]">We don't find items. We build complete solutions.</p>
                </div>
              </div>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Describe what you're trying to <em>accomplish</em>. We'll assemble the full kit from campus resources — across multiple owners — and show you the best combinations.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                autoFocus rows={4}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] resize-none outline-none transition-colors"
                placeholder="e.g. I need to shoot a reel for my club event tomorrow"
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleBuild())}
              />
              <div className="flex flex-wrap gap-2">
                {DEMO_NEEDS.map(n => (
                  <button key={n} onClick={() => setInput(n)}
                    className="px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors">
                    {n}
                  </button>
                ))}
              </div>
              <Button className="w-full gap-2" onClick={handleBuild} disabled={!input.trim()}>
                <Sparkles size={16} /> Build My Solution
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Building ── */}
        {status === 'building' && (
          <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center min-h-[80vh] gap-6 p-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-[var(--accent)]/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-[var(--accent)]/40 animate-ping" style={{ animationDelay: '0.3s' }} />
              <div className="absolute inset-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <Package size={24} className="text-[var(--bg)]" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif text-xl text-[var(--text-primary)]">Assembling your solution…</h3>
              <p className="text-sm text-[var(--text-secondary)]">Matching resources across campus owners</p>
            </div>
          </motion.div>
        )}

        {/* ── No match ── */}
        {status === 'no_match' && (
          <motion.div key="no_match" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[80vh] gap-4 p-6 text-center">
            <p className="text-[var(--text-secondary)]">Couldn't build a kit for that need.</p>
            <Button variant="secondary" onClick={() => setStatus('idle')}>Try again</Button>
          </motion.div>
        )}

        {/* ── Result ── */}
        {status === 'result' && solution && (
          <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 pb-24">

            {/* Kit header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{solution.kit.emoji}</span>
                <div>
                  <h2 className="text-2xl font-serif text-[var(--text-primary)]">{solution.kit.name}</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">"{input}"</p>
                </div>
              </div>
              <button onClick={() => setStatus('idle')} className="text-xs text-[var(--text-secondary)] hover:underline">
                Rebuild
              </button>
            </div>

            {/* Kit slots summary */}
            <div className="flex flex-wrap gap-2">
              {solution.kit.slots.map(slot => {
                const filled = solution.slotOptions.find(s => s.slot === slot)?.options.length > 0;
                return (
                  <span key={slot} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                    filled ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
                  }`}>
                    {filled ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />} {slot}
                  </span>
                );
              })}
            </div>

            {/* Bundle options */}
            <div className="space-y-3">
              <h3 className="font-serif text-lg text-[var(--text-primary)]">Choose your combination</h3>
              {solution.bundles.map(bundle => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  users={users}
                  selected={selectedBundle === bundle.id}
                  onSelect={() => setSelectedBundle(bundle.id)}
                />
              ))}
            </div>

            {/* Tradeoff explainer */}
            <TradeoffExplainer bundles={solution.bundles} />

            {/* Trust-adaptive deposit */}
            {depositInfo && (
              <Card className="space-y-3 border-[var(--accent)]/20 bg-[var(--accent)]/5">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base text-[var(--text-primary)]">Your Trust-Adjusted Deposit</h4>
                  <Badge variant="success">Trust {currentUser?.trustScore}</Badge>
                </div>
                <div className="space-y-2">
                  {depositInfo.map(({ slot, resource, deposit }) => (
                    <div key={slot} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">{slot} — {resource.name.split(' ').slice(0, 3).join(' ')}</span>
                      <div className="flex items-center gap-2">
                        <span className="line-through text-[var(--text-tertiary)]">₹{resource.securityDeposit}</span>
                        <span className="font-mono font-bold text-[var(--accent)]">₹{deposit.adjusted}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--accent)]/20">
                  <span className="text-xs text-[var(--text-secondary)]">Total deposit</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[var(--text-primary)]">₹{totalAdjustedDeposit}</span>
                    {totalSaving > 0 && (
                      <span className="text-[10px] text-[var(--success)] ml-2">You save ₹{totalSaving}</span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  Your deposit is lower because of your successful borrowing history and on-time returns.
                </p>
              </Card>
            )}

            {/* CTA */}
            {activeBundle && (
              <div className="space-y-3">
                <Button className="w-full gap-2" onClick={() => navigate(`/resource/${activeBundle.items[0].resource.id}`)}>
                  Start with {activeBundle.items[0].slot} <ArrowRight size={16} />
                </Button>
                <p className="text-[10px] text-center text-[var(--text-tertiary)]">
                  You'll borrow each item separately. {activeBundle.owners > 1 ? `${activeBundle.owners} separate handovers required.` : 'Single handover — same owner.'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
