import { useState } from 'react';
import { Sparkles, Building2, Flame, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const HEATMAP_CATEGORIES = [
  { name: 'Scientific Calculators', demand: 95, color: '#ef4444', trend: '+42% this week', insight: 'High exam surge across Engineering & Science' },
  { name: 'Cameras & Vlogging Gear', demand: 91, color: '#f97316', trend: '+35% this week', insight: 'Short film contest & club fest shoots' },
  { name: 'Audio & Wireless Mics', demand: 84, color: '#8b5cf6', trend: '+18% this week', insight: 'Fest announcements and stage practice' },
  { name: 'Full HD Projectors', demand: 78, color: '#3b82f6', trend: '+24% this week', insight: 'Department presentations & screenings' },
  { name: 'Sports & Badminton Sets', demand: 62, color: '#10b981', trend: '+10% this week', insight: 'Evening recreation & indoor court sessions' },
  { name: 'Camping Tents & Treks', demand: 45, color: '#06b6d4', trend: '+15% weekend', insight: 'Weekend adventure club trips' },
];

export const CampusIntelligence = () => {
  const [poolOptIn, setPoolOptIn] = useState(false);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={13} /> Institutional Intelligence
          </span>
        </div>
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">Campus Resource Intelligence</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Real-time macro demand heatmaps, utilization analytics, and AI procurement recommendations for the university.
        </p>
      </div>

      {/* 4 Macro KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 space-y-1 text-center bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
          <div className="font-mono text-2xl font-bold text-blue-600">67%</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Campus Utilization</div>
          <div className="text-[10px] text-emerald-600 font-medium">↑ 28% from last sem</div>
        </Card>

        <Card className="p-4 space-y-1 text-center bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20">
          <div className="font-mono text-2xl font-bold text-emerald-600">42%</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Idle Time Reduced</div>
          <div className="text-[10px] text-emerald-600 font-medium">Assets active on campus</div>
        </Card>

        <Card className="p-4 space-y-1 text-center bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
          <div className="font-mono text-2xl font-bold text-purple-600">842</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Purchases Avoided</div>
          <div className="text-[10px] text-[var(--text-secondary)]">Zero redundant e-waste</div>
        </Card>

        <Card className="p-4 space-y-1 text-center bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
          <div className="font-mono text-2xl font-bold text-amber-600">₹48.6L</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Total Asset Value</div>
          <div className="text-[10px] text-amber-600 font-medium">Accessible to any student</div>
        </Card>
      </div>

      {/* Campus Need Heatmap */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-rose-500" />
            <div>
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">Live Campus Need Heatmap</h3>
              <p className="text-xs text-[var(--text-secondary)]">Derived from 412 search queries and community requests this month</p>
            </div>
          </div>
          <span className="text-xs font-mono text-[var(--text-tertiary)]">Real-time Stream</span>
        </div>

        <div className="space-y-4">
          {HEATMAP_CATEGORIES.map(item => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--text-primary)]">{item.name}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-normal">({item.insight})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{item.trend}</span>
                  <span className="font-mono font-bold" style={{ color: item.color }}>{item.demand}% Demand</span>
                </div>
              </div>
              <div className="h-2 bg-[var(--surface-raised)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.demand}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Procurement & Institutional Action Card */}
      <Card className="p-6 border-2 border-purple-500/30 bg-purple-500/5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-serif text-base font-bold text-[var(--text-primary)]">AI Institutional Procurement Advisor</h4>
              <span className="text-[9px] px-2 py-0.5 rounded bg-purple-600 text-white font-bold uppercase">B2B Campus Model</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              "Campus Circular analytics predict a <strong>95% scarcity gap in Scientific Calculators and Projectors</strong> in 5 days due to End-Sem Exams. Rather than students buying 40 redundant units retail (₹32,000 cost), we recommend the university deploy <strong>8 idle department laboratory calculators</strong> into the Library Access Hub."
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-500/20">
          <div className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
            <CheckCircle2 size={13} /> Saves students ₹32,000+
          </div>
          <div className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
            <CheckCircle2 size={13} /> Prevents 40 redundant plastic units
          </div>
          <div className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
            <CheckCircle2 size={13} /> Full digital custody & RFID tracking
          </div>
        </div>
      </Card>

      {/* Resource Pooling Coordinator */}
      <Card className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-blue-600" />
              <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">Campus Resource Pooling Protocol</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Owners can pledge idle equipment into the verified <strong>Campus Shared Pool</strong>. The platform handles scheduling, deposit insurance, and automated earnings.
            </p>
          </div>
          <Button
            size="sm"
            variant={poolOptIn ? 'secondary' : 'primary'}
            onClick={() => setPoolOptIn(!poolOptIn)}
            className="shrink-0 gap-1.5"
          >
            {poolOptIn ? '✓ Pledged to Pool' : 'Pledge Equipment to Pool'}
          </Button>
        </div>

        {poolOptIn && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2"
          >
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>Your registered equipment has been added to the North Campus Shared Pool with automated Circular Shield™ protection active!</span>
          </motion.div>
        )}
      </Card>
    </div>
  );
};
