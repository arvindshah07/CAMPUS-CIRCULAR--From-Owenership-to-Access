import { useState } from 'react';
import { Shield, ShieldCheck, Lock, AlertTriangle, CheckCircle2, X, Info, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

// ─── Contact Protection Badge (Pre-Transaction) ───────────────────
export function ContactProtectionBadge({ ownerName }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 cursor-pointer hover:bg-blue-500/15 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Lock size={15} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Circular Shield™ Protected</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-semibold uppercase">Active</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">Direct contact is protected until exchange agreement is confirmed.</p>
          </div>
        </div>
        <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2">
          Why? <Info size={12} />
        </span>
      </div>

      {/* Explainer Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">Circular Shield™ Protection</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Your contact is private. Your transaction is protected.</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  <X size={18} />
                </button>
              </div>

              {/* Comparison table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck size={14} /> On-Platform Protected
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-[var(--text-secondary)]">
                    <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-600 shrink-0" /> Verified student identity</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-600 shrink-0" /> Refundable deposit in escrow</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-600 shrink-0" /> Condition & Handover QR evidence</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-600 shrink-0" /> Dispute & damage insurance</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-600 shrink-0" /> Trust Score growth (+points)</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                    <AlertTriangle size={14} /> Off-Platform (Cash/Direct)
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-[var(--text-secondary)]">
                    <li className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">✕ No deposit guarantee</li>
                    <li className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">✕ No condition proof if broken</li>
                    <li className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">✕ Zero dispute protection</li>
                    <li className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">✕ No trust score progression</li>
                    <li className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">✕ High scam & ghosting risk</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 rounded-xl text-xs text-[var(--text-secondary)]">
                [Note] <span className="font-semibold text-[var(--text-primary)]">Masked Communication:</span> Once you confirm the request, you can call and chat with {ownerName} using our encrypted proxy without exposing personal phone numbers.
              </div>

              <Button className="w-full" onClick={() => setShowModal(false)}>
                Got it, keep me protected
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Deal Integrity Meter ──────────────────────────────────────────
export function DealIntegrityMeter({ score = 98 }) {
  return (
    <Card className="border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Deal Integrity Score</h4>
        </div>
        <span className="font-mono text-sm font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-lg">
          {score}/100 Safe
        </span>
      </div>

      <div className="h-2 bg-[var(--surface-raised)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] text-[var(--text-secondary)]">
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={11} /> Escrow Secured</div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={11} /> Handover QR Ready</div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={11} /> Dispute Covered</div>
      </div>
    </Card>
  );
}

// ─── Masked Call Simulator Modal ──────────────────────────────────
export function MaskedCallModal({ isOpen, onClose, peerName, exchangeId }) {
  const [callState, setCallState] = useState('ringing');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 text-white rounded-3xl max-w-sm w-full p-6 text-center space-y-6 shadow-2xl border border-gray-800"
      >
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1 font-mono"><Lock size={12} className="text-emerald-400" /> Proxy Encrypted</span>
          <span className="font-mono">{exchangeId}</span>
        </div>

        <div className="space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-serif font-bold animate-pulse">
            {peerName ? peerName.charAt(0) : '?'}
          </div>
          <div>
            <h3 className="text-lg font-bold">{peerName}</h3>
            <p className="text-xs text-gray-400">Masked Proxy Call · Number Hidden</p>
          </div>
        </div>

        <div className="p-3 bg-gray-800/80 rounded-xl text-xs text-gray-300">
          {callState === 'ringing' && <span className="animate-pulse">Connecting via Campus Circular Bridge...</span>}
          {callState === 'connected' && <span className="text-emerald-400 font-mono">Connected · 00:24 · Encrypted Audio</span>}
          {callState === 'ended' && <span className="text-rose-400">Call Ended</span>}
        </div>

        <div className="flex justify-center gap-3">
          {callState === 'ringing' && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-5 py-2 text-xs"
              onClick={() => setCallState('connected')}
            >
              Simulate Connect
            </Button>
          )}
          <Button
            variant="danger"
            className="rounded-full px-5 py-2 text-xs"
            onClick={() => {
              setCallState('ended');
              setTimeout(onClose, 400);
            }}
          >
            End Call
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Protected In-App Messenger with Anti-Leakage Detection ─────────
const LEAKAGE_PATTERNS = [
  /\b\d{10}\b/,
  /\b\+?91[\s-]?\d{10}\b/,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  /[a-zA-Z0-9.\-_]{2,256}@(okaxis|okhdfcbank|oksbi|paytm|upi|ybl|apl)/i,
  /instagram\.com|t\.me|wa\.me|snapchat\.com/i,
];

export function ProtectedChatModal({ isOpen, onClose, peerName, exchangeId, resourceName }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'system', text: '🔐 Protected Exchange Room opened. Keep communication inside the app to maintain deposit escrow and damage protection.' },
    { id: 2, sender: 'peer', text: `Hi! Ready to coordinate handover for the ${resourceName || 'item'}. Shall we meet at the Library entrance?` },
  ]);
  const [text, setText] = useState('');
  const [leakageWarning, setLeakageWarning] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!text.trim()) return;

    const hasLeakage = LEAKAGE_PATTERNS.some(regex => regex.test(text));
    if (hasLeakage) {
      setLeakageWarning(true);
      return;
    }

    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'me', text },
    ]);
    setText('');
    setLeakageWarning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-md w-full h-[520px] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Chat Header */}
        <div className="p-3.5 border-b border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {peerName ? peerName.charAt(0) : '?'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--text-primary)]">{peerName}</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-600 font-semibold rounded">Protected</span>
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)] font-mono">{exchangeId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            <X size={18} />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'me' ? 'justify-end' : m.sender === 'peer' ? 'justify-start' : 'justify-center'}`}
            >
              {m.sender === 'system' ? (
                <div className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 p-2.5 rounded-xl max-w-[90%] text-center border border-blue-500/20">
                  {m.text}
                </div>
              ) : (
                <div
                  className={`p-3 rounded-2xl max-w-[80%] text-xs ${
                    m.sender === 'me'
                      ? 'bg-[var(--accent)] text-[var(--bg)] rounded-br-none'
                      : 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border)] rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Anti-Leakage Warning Friction Modal */}
        <AnimatePresence>
          {leakageWarning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-3 bg-amber-500/15 border-t border-b border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2"
            >
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle size={14} className="text-amber-600" />
                <span>Contact / Payment Details Detected</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                For your safety, direct phone numbers and UPI IDs are blocked. Off-platform deals void your <strong>Deposit Escrow</strong> and <strong>Condition Protection</strong>.
              </p>
              <div className="flex gap-2 pt-1">
                <Button size="xs" variant="secondary" onClick={() => setLeakageWarning(false)}>
                  Edit Message
                </Button>
                <Button size="xs" onClick={() => {
                  setText(t => t.replace(/\d{10}/, '[Phone Protected]'));
                  setLeakageWarning(false);
                }}>
                  Send Masked
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Input */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)] flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="Type a protected message (e.g. 'Meet at Library in 5 mins')..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <Button size="sm" onClick={handleSend} className="shrink-0">
            <Send size={13} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
