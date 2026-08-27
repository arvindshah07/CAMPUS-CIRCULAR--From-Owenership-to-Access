import { useState } from 'react';
import { QrCode, CheckCircle2, ShieldCheck, Camera, Clock, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function SmartHandover({ exchange, resource, owner, _borrower, onComplete }) {
  const [step, setStep] = useState(1); // 1: ID Match, 2: Scan QR, 3: Condition Check, 4: Confirmed
  const [scanned, setScanned] = useState(false);
  const [checklist, setChecklist] = useState({
    optics: true,
    accessories: true,
    power: true,
    physical: true,
    clean: true,
  });

  const allChecked = Object.values(checklist).every(Boolean);

  const handleScan = () => {
    setScanned(true);
    setTimeout(() => {
      setStep(3);
    }, 900);
  };

  return (
    <Card className="border-2 border-[var(--accent)]/30 bg-[var(--surface)] p-5 space-y-6 shadow-lg">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center font-bold">
            <QrCode size={16} />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">Smart Handover Protocol™</h3>
            <p className="text-[10px] font-mono text-[var(--text-tertiary)]">{exchange.id} · Verified Handover</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
          <ShieldCheck size={13} /> Escrow Active
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold">
        <div className={`p-2 rounded-xl border ${step >= 1 ? 'bg-blue-500/10 border-blue-500/30 text-blue-600' : 'bg-[var(--surface-raised)] border-transparent text-[var(--text-tertiary)]'}`}>
          1. Identity Match
        </div>
        <div className={`p-2 rounded-xl border ${step >= 2 ? 'bg-blue-500/10 border-blue-500/30 text-blue-600' : 'bg-[var(--surface-raised)] border-transparent text-[var(--text-tertiary)]'}`}>
          2. Scan QR
        </div>
        <div className={`p-2 rounded-xl border ${step >= 3 ? 'bg-blue-500/10 border-blue-500/30 text-blue-600' : 'bg-[var(--surface-raised)] border-transparent text-[var(--text-tertiary)]'}`}>
          3. Condition Lock
        </div>
      </div>

      {/* Step 1: Identity Match */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-[var(--surface-raised)] space-y-3">
            <UserCheck size={28} className="mx-auto text-[var(--accent)]" />
            <h4 className="font-bold text-sm text-[var(--text-primary)]">Verify Peer Identity</h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Ensure you are meeting <strong>{owner?.name}</strong> at the designated campus location.
            </p>
            <div className="flex justify-center gap-4 text-xs font-mono text-[var(--text-secondary)] pt-1">
              <span>Dept: {owner?.department}</span>
              <span>Year: {owner?.year}</span>
            </div>
          </div>
          <Button className="w-full gap-2" onClick={() => setStep(2)}>
            Identity Matched → Next to QR Scan
          </Button>
        </motion.div>
      )}

      {/* Step 2: Dynamic QR Code Scan */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
          <div className="p-5 rounded-2xl bg-white border-2 border-dashed border-gray-300 max-w-[220px] mx-auto space-y-2">
            <div className="w-36 h-36 mx-auto bg-gray-900 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
              <QrCode size={110} className="text-white" />
              <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none" />
            </div>
            <p className="font-mono text-[10px] text-gray-700 font-bold tracking-wider">{exchange.id}-SEC</p>
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            Ask {owner?.name} to scan this QR code on their device to lock the handover.
          </p>

          <Button
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={handleScan}
          >
            {scanned ? <CheckCircle2 size={16} /> : <Camera size={16} />}
            {scanned ? 'QR Code Verified!' : 'Simulate Partner Scanned QR'}
          </Button>
        </motion.div>
      )}

      {/* Step 3: Condition & Accessories Checklist */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-serif text-sm font-bold text-[var(--text-primary)]">Pre-Handover Condition Lock</h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Verify all items before taking custody. This condition snapshot protects your security deposit.
            </p>
          </div>

          <div className="space-y-2 bg-[var(--surface-raised)] p-3 rounded-2xl">
            {[
              { id: 'optics', label: 'All primary components are functional' },
              { id: 'accessories', label: `Accessories included (${resource.accessories?.length || 3} items present)` },
              { id: 'power', label: 'Battery / Power cables tested and working' },
              { id: 'physical', label: 'No unreported cracks, dents, or scratches' },
              { id: 'clean', label: 'Device is clean and ready for immediate use' },
            ].map(item => (
              <label key={item.id} className="flex items-center gap-3 cursor-pointer text-xs p-1">
                <input
                  type="checkbox"
                  checked={checklist[item.id]}
                  onChange={e => setChecklist(prev => ({ ...prev, [item.id]: e.target.checked }))}
                  className="accent-[var(--accent)] w-4 h-4 rounded"
                />
                <span className="text-[var(--text-primary)]">{item.label}</span>
              </label>
            ))}
          </div>

          <div className="p-3 bg-blue-500/10 rounded-xl flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
            <span className="flex items-center gap-1.5 font-semibold"><Clock size={13} /> Handover Timestamp</span>
            <span className="font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <Button
            className="w-full gap-2"
            disabled={!allChecked}
            onClick={() => onComplete({ checklist, timestamp: new Date().toISOString() })}
          >
            <ShieldCheck size={16} /> Confirm Handover & Lock Custody
          </Button>
        </motion.div>
      )}
    </Card>
  );
}
