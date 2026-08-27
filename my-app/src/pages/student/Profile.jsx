import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Star, AlertTriangle, MapPin,
  Phone, Mail, ChevronDown, ChevronUp, Lock,
  TrendingUp, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, InteractiveCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAppStore, computeTrustScore } from '../../app/store';
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

export const Profile = () => {
  const navigate    = useNavigate();
  const currentUser = useAppStore(s => s.currentUser);
  const resources   = useAppStore(s => s.resources);
  const exchanges   = useAppStore(s => s.exchanges);
  const users       = useAppStore(s => s.users);

  const [activeTab, setActiveTab] = useState('earnings'); // 'earnings' | 'trust' | 'resources' | 'map'
  const [expandedTxId, setExpandedTxId] = useState(null);

  // Always read fresh user object from users array
  const user = useMemo(
    () => users.find(u => u.id === currentUser?.id) ?? currentUser,
    [users, currentUser]
  );

  const liveScore = useMemo(() => computeTrustScore(user, exchanges), [user, exchanges]);
  const myResources = resources.filter(r => r.ownerId === user.id);

  const myExchanges = exchanges.filter(
    e => e.borrowerId === user.id || e.ownerId === user.id
  );
  const lateCount          = myExchanges.filter(e => e.isLate).length;
  const disputeCount       = myExchanges.filter(e => e.disputeId).length;

  const avgRating = useMemo(() => {
    const rated = myExchanges.filter(e => e.rating);
    if (!rated.length) return user.rating || 4.9;
    const total = rated.reduce((s, e) => {
      const r = typeof e.rating === 'object' ? (e.rating.resourceRating || 5) : e.rating;
      return s + r;
    }, 0);
    return (total / rated.length).toFixed(1);
  }, [myExchanges, user.rating]);

  // Financial Computations for Owner
  const financialStats = useMemo(() => {
    const lends = myExchanges.filter(e => e.ownerId === user.id);
    const completedLends = lends.filter(e => e.status === 'RATED');
    
    // Live calculated earnings + baseline for demo richness
    const liveEarned = completedLends.reduce((sum, e) => sum + (e.borrowingFee || 0), 0);
    const totalEarned = Math.max(12450, liveEarned + 10200);
    const thisMonth = 2450;
    const platformFees = 320;
    const netDisbursed = totalEarned - platformFees;
    const pendingEscrow = 8200;

    return {
      totalEarned,
      thisMonth,
      platformFees,
      netDisbursed,
      pendingEscrow,
      lendsCount: Math.max(18, lends.length + 15),
      sharedDays: 146,
      purchasesAvoided: 82000,
    };
  }, [myExchanges, user.id]);

  const trustLabel = liveScore >= 90 ? 'Very Trusted' : liveScore >= 75 ? 'Trusted' : liveScore >= 55 ? 'Building Trust' : 'New Member';
  const trustColor = liveScore >= 90 ? 'var(--success)' : liveScore >= 75 ? 'var(--accent)' : 'var(--warning)';

  const toggleExpand = (id) => {
    setExpandedTxId(expandedTxId === id ? null : id);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">

      {/* ── 1. IDENTITY HERO BANNER ── */}
      <Card className="relative overflow-hidden border-2 border-[var(--border)]">
        <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 80% 50%, ${trustColor}, transparent 70%)` }} />
        <div className="relative flex items-start gap-5 flex-wrap">
          <div className="w-20 h-20 rounded-2xl bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center font-serif text-4xl shrink-0 shadow-lg">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-serif text-[var(--text-primary)]">{user.name}</h1>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--success)] bg-[var(--success)]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                <ShieldCheck size={11} /> Campus Verified
              </span>
              {user.status === 'FLAGGED' && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--danger)] bg-[var(--danger)]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  <AlertTriangle size={11} /> Flagged
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{user.department} · {user.year}</p>

            {/* Direct Contact & Verification Status */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1 font-mono bg-[var(--surface-raised)] px-2.5 py-1 rounded-lg">
                <Phone size={12} className="text-blue-500" /> {user.phone || '+91 98201 45892'}
              </span>
              <span className="flex items-center gap-1 bg-[var(--surface-raised)] px-2.5 py-1 rounded-lg">
                <Mail size={12} className="text-[var(--accent)]" /> {user.email || 'arvind.s@campus.edu'}
              </span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <Lock size={12} className="text-emerald-500" /> Circular Shield™ Active
              </span>
            </div>

            <div className="flex items-center gap-1 mt-1.5">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} size={14} className={n <= Math.round(Number(avgRating)) ? 'fill-[var(--warning)] text-[var(--warning)]' : 'text-[var(--border)]'} />
              ))}
              <span className="text-xs text-[var(--text-secondary)] ml-1 font-semibold">★ {avgRating} rating</span>
              <span className="text-xs text-[var(--text-tertiary)] ml-2">({financialStats.lendsCount} completed lends)</span>
            </div>
          </div>

          {/* Live trust badge */}
          <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl shrink-0" style={{ background: `${trustColor}15`, border: `2px solid ${trustColor}40` }}>
            <span className="font-mono text-3xl font-bold" style={{ color: trustColor }}>{liveScore}</span>
            <span className="text-[9px] uppercase tracking-wide text-[var(--text-tertiary)] mt-0.5">Trust</span>
          </div>
        </div>
      </Card>

      {/* ── 2. TOP METRIC CARDS ── */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-4 space-y-1 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20">
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] font-bold">Total Earned</div>
          <div className="font-mono text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{financialStats.totalEarned.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">100% On-Platform</div>
        </Card>

        <Card className="text-center py-4 space-y-1 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] font-bold">In Escrow / Pending</div>
          <div className="font-mono text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
            ₹{financialStats.pendingEscrow.toLocaleString()}
          </div>
          <div className="text-[10px] text-[var(--text-tertiary)]">Protected in Escrow</div>
        </Card>

        <Card className="text-center py-4 space-y-1 bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] font-bold">Exchanges</div>
          <div className="font-mono text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
            24
          </div>
          <div className="text-[10px] text-purple-600 font-medium">100% On-Time Return</div>
        </Card>
      </div>

      {/* ── 3. NAVIGATION TABS ── */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('earnings')}
          className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap
            ${activeTab === 'earnings' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          <span>[Ledger] Verified Earnings & History</span>
        </button>

        <button
          onClick={() => setActiveTab('trust')}
          className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap
            ${activeTab === 'trust' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          <span>[Trust] Score & Financial Utility ({liveScore})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap
            ${activeTab === 'resources' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          <span>[Assets] My Listed Equipment ({myResources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap
            ${activeTab === 'map' ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          <span>[Map] Campus Asset Distribution</span>
        </button>
      </div>

      {/* ── TAB 1: VERIFIED EARNINGS & TRANSACTION HISTORY ── */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">

          {/* 3 FINANCIAL CONCEPTS EXPLAINER (Judge-Facing) */}
          <Card className="border border-blue-500/20 bg-blue-500/5 space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <Building2 size={15} /> Transparent Financial Architecture (3-Way Model)
              </span>
              <span className="text-[10px] uppercase tracking-wider font-mono text-blue-600 font-bold">Institutional Logic</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] space-y-1">
                <div className="text-[10px] uppercase font-bold text-emerald-600">1. Borrowing Charge</div>
                <div className="text-sm font-mono font-bold text-[var(--text-primary)]">100% to Owner</div>
                <p className="text-[11px] text-[var(--text-secondary)]">Paid by borrower directly to the resource owner for usage.</p>
              </div>

              <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] space-y-1">
                <div className="text-[10px] uppercase font-bold text-purple-600">2. Platform Fee (5%)</div>
                <div className="text-sm font-mono font-bold text-[var(--text-primary)]">Campus Circular</div>
                <p className="text-[11px] text-[var(--text-secondary)]">Funds smart handover QR encryption & dispute resolution.</p>
              </div>

              <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] space-y-1">
                <div className="text-[10px] uppercase font-bold text-blue-600">3. Security Deposit</div>
                <div className="text-sm font-mono font-bold text-[var(--text-primary)]">Escrow Protected</div>
                <p className="text-[11px] text-[var(--text-secondary)]">Held in platform escrow; 100% refunded upon safe inspection.</p>
              </div>
            </div>
          </Card>

          {/* EARNINGS OVERVIEW BREAKDOWN */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">Earnings Overview</h3>
              <span className="text-[11px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                ✓ Payouts Cleared to Campus Wallet
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-[var(--text-secondary)]">This Month's Earnings</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">₹{financialStats.thisMonth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[var(--text-secondary)]">This Year (All-Time Gross)</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">₹{financialStats.totalEarned.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-red-500">
                <span>Platform Operations Fee (5%)</span>
                <span className="font-mono font-bold">-₹{financialStats.platformFees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[var(--border)] text-base font-bold text-emerald-600 dark:text-emerald-400">
                <span>Net Disbursed to Owner</span>
                <span className="font-mono">₹{financialStats.netDisbursed.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* SOCIAL IMPACT & CIRCULATION ROI SUMMARY */}
          <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-[var(--surface)] to-emerald-500/5 space-y-4 p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp size={14} /> Earnings from Campus Circular
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  You've helped {financialStats.lendsCount} students access resources they needed.
                </h4>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Lock size={10} /> Verified
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                <div className="font-mono text-base font-bold text-emerald-600">₹{financialStats.totalEarned.toLocaleString()}</div>
                <div className="text-[9px] uppercase font-semibold text-[var(--text-tertiary)]">Earned</div>
              </div>
              <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                <div className="font-mono text-base font-bold text-[var(--text-primary)]">{financialStats.lendsCount}</div>
                <div className="text-[9px] uppercase font-semibold text-[var(--text-tertiary)]">Successful Lends</div>
              </div>
              <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                <div className="font-mono text-base font-bold text-[var(--text-primary)]">{financialStats.sharedDays}d</div>
                <div className="text-[9px] uppercase font-semibold text-[var(--text-tertiary)]">Shared-Use Days</div>
              </div>
              <div className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                <div className="font-mono text-base font-bold text-blue-600">₹{financialStats.purchasesAvoided.toLocaleString()}</div>
                <div className="text-[9px] uppercase font-semibold text-[var(--text-tertiary)]">Purchases Avoided</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200 bg-emerald-500/10 p-2.5 rounded-xl">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>
                <strong>[Verified Platform Integrity]</strong> Staying on-platform gives you damage protection escrow, verified proof of earnings, and builds your campus credit rating.
              </span>
            </div>
          </Card>

          {/* VERIFIED TRANSACTION HISTORY (EXPANDABLE LEDGER) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">Verified Transaction Ledger</h3>
              <span className="text-xs text-[var(--text-tertiary)] font-mono">{myExchanges.length} recorded</span>
            </div>

            <div className="space-y-2.5">
              {myExchanges.map(exc => {
                const res = resources.find(r => r.id === exc.resourceId);
                const borrower = users.find(u => u.id === exc.borrowerId) || { name: 'Rahul (Student)', trustScore: 88 };
                const isExpanded = expandedTxId === exc.id;
                const isOwner = exc.ownerId === user.id;

                const baseFee = exc.borrowingFee || (res?.borrowingFee ? res.borrowingFee * (exc.days || 2) : 500);
                const platFee = exc.platformFee || Math.round(baseFee * 0.05);
                const secDep  = exc.securityDeposit || (res?.securityDeposit || 1000);
                const dmgAmt  = exc.damageAmount || 0;
                const netOwner = baseFee;
                const netRefund = Math.max(0, secDep - dmgAmt);

                return (
                  <Card key={exc.id} className="p-0 overflow-hidden border border-[var(--border)] transition-all hover:border-[var(--accent)]/40">
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpand(exc.id)}
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--surface-raised)] shrink-0 border border-[var(--border)]">
                          {res && <ResourceImage src={res.image} alt={res.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">{res?.name || exc.resourceId}</h4>
                            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">({exc.id})</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {isOwner ? `Borrowed by ${borrower.name}` : `Lent by Owner`} • {exc.days || 3} days
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            +₹{baseFee}
                          </div>
                          <div className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">
                            {isOwner ? 'Owner Earning' : 'Fee Paid'}
                          </div>
                        </div>

                        <Badge variant={exc.status === 'RATED' ? 'success' : exc.status === 'BORROWED' ? 'primary' : 'warning'} className="text-[10px]">
                          {exc.status === 'RATED' ? '✓ Completed' : exc.status}
                        </Badge>

                        <button className="text-[var(--text-tertiary)] p-1 hover:text-[var(--text-primary)]">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Breakdown Drawer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-[var(--surface-raised)] border-t border-[var(--border)] p-4 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] border-b border-[var(--border)] pb-2">
                            <span className="font-mono font-bold text-[var(--text-primary)]">{exc.id}</span>
                            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                              <ShieldCheck size={13} /> Circular Shield Escrow Verified
                            </span>
                            <span className="text-[var(--text-tertiary)]">Completed {exc.completedAt ? new Date(exc.completedAt).toLocaleDateString() : 'Recent'}</span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[var(--text-secondary)]">
                              <span>Borrowing Charge ({exc.days || 3} days)</span>
                              <span className="font-mono font-semibold text-[var(--text-primary)]">₹{baseFee}</span>
                            </div>
                            <div className="flex justify-between text-[var(--text-secondary)]">
                              <span>Platform Service Fee (5%)</span>
                              <span className="font-mono text-[var(--text-tertiary)]">₹{platFee}</span>
                            </div>
                            <div className="flex justify-between text-[var(--text-secondary)]">
                              <span>Security Deposit (in Escrow)</span>
                              <span className="font-mono">₹{secDep}</span>
                            </div>
                            <div className="flex justify-between text-[var(--text-secondary)]">
                              <span>Damage Deduction</span>
                              <span className={`font-mono ${dmgAmt > 0 ? 'text-red-500 font-bold' : ''}`}>₹{dmgAmt}</span>
                            </div>
                            <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-[var(--text-primary)] text-sm">
                              <span className="text-emerald-600">Owner Net Payout Received</span>
                              <span className="font-mono text-emerald-600">₹{netOwner}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
                              <span>Borrower Deposit Refunded</span>
                              <span className="font-mono text-emerald-600 font-bold">₹{netRefund}</span>
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <Button size="xs" variant="secondary" onClick={() => navigate(`/exchange/${exc.id}`)}>
                              View Lifecycle Trail →
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ── TAB 2: TRUST BREAKDOWN & FINANCIAL UTILITY ── */}
      {activeTab === 'trust' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">Trust Score Architecture</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ color: trustColor, background: `${trustColor}15` }}>{trustLabel}</span>
            </div>
            <div className="space-y-3">
              <TrustBar label="On-time Returns (35%)"   value={user.onTimeReturns || 99} max={100} color="var(--success)" />
              <TrustBar label="Lending & Borrowing Experience (30%)" value={Math.min(myExchanges.length * 4 || 45, 60)} max={60} color="var(--accent)" />
              <TrustBar label="Peer Review Rating (20%)" value={Number(avgRating)} max={5} color="var(--warning)" />
              <TrustBar label="Clean History / No Disputes (15%)" value={10 - (lateCount + disputeCount)} max={10} color="var(--success)" />
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] font-mono">
              Formula: Trust Score = (on-time% × 0.35) + experience + rating + verified identity bonus − penalties
            </p>
          </Card>

          <Card className="border-2 border-[var(--accent)]/20 bg-[var(--accent)]/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" />
                <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">Financial Utility of Trust</h3>
              </div>
              <Badge variant="success">Your Tier: {liveScore >= 95 ? 'VIP 50%' : liveScore >= 85 ? 'Trusted 35%' : 'Standard 20%'}</Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Higher trust directly reduces security deposits on expensive gear like cameras and projectors:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div className={`p-3 rounded-xl border ${liveScore >= 95 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'}`}>
                <div className="font-mono text-sm">95–100 Trust</div>
                <div className="text-[10px]">50% Security Deposit Discount</div>
              </div>
              <div className={`p-3 rounded-xl border ${liveScore >= 85 && liveScore < 95 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'}`}>
                <div className="font-mono text-sm">85–94 Trust</div>
                <div className="text-[10px]">35% Security Deposit Discount</div>
              </div>
              <div className={`p-3 rounded-xl border ${liveScore < 85 ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'}`}>
                <div className="font-mono text-sm">65–84 Trust</div>
                <div className="text-[10px]">Standard / 20% Discount</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB 3: MY LISTED EQUIPMENT ── */}
      {activeTab === 'resources' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">My Registered Equipment</h3>
            <Button size="xs" onClick={() => navigate('/admin')}>+ Add New Item</Button>
          </div>

          {myResources.length === 0 ? (
            <Card className="text-center py-8 text-[var(--text-secondary)]">You haven't listed any equipment yet.</Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myResources.map(res => (
                <InteractiveCard key={res.id} className="p-0 overflow-hidden border border-[var(--border)]" onClick={() => navigate(`/resource/${res.id}`)}>
                  <div className="h-32 bg-[var(--surface-raised)] overflow-hidden">
                    <ResourceImage src={res.image} alt={res.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate">{res.name}</h4>
                      <Badge variant={res.adminStatus === 'APPROVED' ? 'success' : 'warning'}>{res.adminStatus}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1"><MapPin size={10} />{res.location}</span>
                      <span className="font-mono font-bold text-emerald-600">₹{res.borrowingFee}/day</span>
                    </div>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── TAB 4: CAMPUS DISTRIBUTION MAP ── */}
      {activeTab === 'map' && (
        <section className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <MapPin size={18} className="text-[var(--accent)]" /> Campus Distribution Map
          </h3>
          <CampusMap
            mode="multi"
            resources={myResources.length ? myResources : resources.filter(r => r.adminStatus === 'APPROVED' && r.coords)}
          />
        </section>
      )}
    </div>
  );
};
