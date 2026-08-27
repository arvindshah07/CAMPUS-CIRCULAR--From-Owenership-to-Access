import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, X, CheckCircle2, Clock, Shield } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAppStore } from '../../app/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedChatModal } from '../../components/protection/CircularShield';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function RequestCard({ req, users, isOwn, onFindMatches }) {
  const author = users.find(u => u.id === req.authorId);
  const [showChat, setShowChat] = useState(false);

  return (
    <Card className="space-y-3">
      <ProtectedChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        peerName={author?.name || 'Peer'}
        exchangeId={`REQ-${req.id || 'COMM'}`}
        resourceName={req.need}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center font-serif font-bold text-sm shrink-0">
            {author?.name.charAt(0) ?? '?'}
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--text-primary)]">{author?.name ?? 'Unknown'}</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">{author?.department} · Trust {author?.trustScore}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={req.status === 'ACTIVE' ? 'success' : 'default'}>{req.status}</Badge>
          <span className="text-[10px] text-[var(--text-tertiary)]">{timeAgo(req.createdAt)}</span>
        </div>
      </div>
      <p className="text-sm text-[var(--text-primary)]">"{req.need}"</p>
      <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
        {req.requiredDate && <span className="flex items-center gap-1"><Clock size={11} /> {req.requiredDate}</span>}
        {req.duration     && <span>Duration: {req.duration}</span>}
        {req.budget       && <span>Budget: {req.budget}</span>}
      </div>

      {/* Direct protected connection for peers offering help */}
      {!isOwn && author && (
        <div className="pt-2 border-t border-[var(--border)]">
          <Button
            size="xs"
            variant="secondary"
            className="w-full gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20"
            onClick={() => setShowChat(true)}
          >
            <Shield size={12} /> Offer Equipment & Chat Safely
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
        <span className="text-xs text-[var(--text-tertiary)]">{req.views} views · {req.responses} responses</span>
        <button onClick={() => onFindMatches(req.need)} className="text-xs text-[var(--accent)] hover:underline font-medium">
          {isOwn && req.responses > 0 ? 'View matches →' : 'Find matches with AI →'}
        </button>
      </div>
    </Card>
  );
}

export const Community = () => {
  const navigate            = useNavigate();
  const communityRequests  = useAppStore(s => s.communityRequests);
  const currentUser         = useAppStore(s => s.currentUser);
  const users               = useAppStore(s => s.users);
  const postCommunityRequest = useAppStore(s => s.postCommunityRequest);
  const [tab, setTab]         = useState('browse');
  const [showModal, setShowModal] = useState(false);
  const [posted, setPosted]   = useState(false);
  const [form, setForm]       = useState({ need: '', requiredDate: '', duration: '', budget: '' });

  const myRequests     = communityRequests.filter(r => r.authorId === currentUser.id);
  const othersRequests = communityRequests.filter(r => r.authorId !== currentUser.id);

  const handlePost = () => {
    if (!form.need.trim()) return;
    postCommunityRequest(form);
    setShowModal(false);
    setForm({ need: '', requiredDate: '', duration: '', budget: '' });
    setPosted(true);
    setTimeout(() => setPosted(false), 4000);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">Community</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Campus resource requests</p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)} className="gap-1.5 shrink-0">
          <Plus size={15} /> Post Request
        </Button>
      </div>

      <AnimatePresence>
        {posted && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-[var(--success)]/10 text-[var(--success)] text-sm px-4 py-3 rounded-xl border border-[var(--success)]/20">
            <CheckCircle2 size={16} /> Request posted! Checking for matches…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--surface-raised)] p-1 rounded-xl w-fit">
        {[{ id: 'browse', label: `Browse (${othersRequests.length})` }, { id: 'mine', label: `My Requests (${myRequests.length})` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${tab === t.id ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {tab === 'browse' && (
          othersRequests.length === 0
            ? <Card className="text-center py-10 text-[var(--text-secondary)]">No community requests yet.</Card>
            : othersRequests.map(req => (
                <RequestCard
                  key={req.id}
                  req={req}
                  users={users}
                  isOwn={false}
                  onFindMatches={(need) => navigate('/needs', { state: { query: need } })}
                />
              ))
        )}
        {tab === 'mine' && (
          myRequests.length === 0
            ? <Card className="text-center py-10 space-y-3">
                <Users size={28} className="mx-auto text-[var(--text-tertiary)]" />
                <p className="text-[var(--text-secondary)]">You haven't posted any requests yet.</p>
                <Button size="sm" variant="secondary" onClick={() => setShowModal(true)}>Post your first request</Button>
              </Card>
            : myRequests.map(req => (
                <RequestCard
                  key={req.id}
                  req={req}
                  users={users}
                  isOwn
                  onFindMatches={(need) => navigate('/needs', { state: { query: need } })}
                />
              ))
        )}
      </div>

      {/* Post modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
            style={{ background: 'var(--overlay)' }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-[var(--text-primary)]">Post a Request</h3>
                <button onClick={() => setShowModal(false)} aria-label="Close" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">What do you need? *</label>
                  <textarea rows={3} value={form.need} onChange={e => setForm(p => ({ ...p, need: e.target.value }))}
                    placeholder="Describe what you're looking for..."
                    className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--text-secondary)] mb-1 block">Required by</label>
                    <input type="date" value={form.requiredDate} onChange={e => setForm(p => ({ ...p, requiredDate: e.target.value }))}
                      className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-secondary)] mb-1 block">Duration</label>
                    <input type="text" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                      placeholder="e.g. 2 days"
                      className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Budget (optional)</label>
                  <input type="text" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))}
                    placeholder="e.g. ₹200"
                    className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
                </div>
              </div>
              <Button className="w-full" disabled={!form.need.trim()} onClick={handlePost}>Post Request</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
