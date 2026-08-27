import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, AlertCircle, Star, ArrowLeft, ShieldCheck, Phone, MessageSquare, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ResourceImage } from '../../components/ui/ResourceImage';
import { EXCHANGES_STATES, getNextState, calculateSettlement } from '../../engine/simulation';
import { useAppStore, computeDeposit } from '../../app/store';
import { DealIntegrityMeter, MaskedCallModal, ProtectedChatModal } from '../../components/protection/CircularShield';
import { SmartHandover } from '../../components/protection/SmartHandover';

const STEP_LABELS = {
  REQUESTED:   'Request Sent',
  ACCEPTED:    'Accepted',
  HANDOVER:    'Handover Inspection',
  BORROWED:    'In Use',
  RETURN_DUE:  'Return Due',
  RETURNED:    'Returned',
  INSPECTION:  'Return Inspection',
  SETTLEMENT:  'Settlement',
  RATED:       'Completed',
};

const CONDITION_CHECKLIST = [
  'Body has no visible cracks or dents',
  'All buttons, dials and ports function properly',
  'Screen / display has no scratches',
  'All accessories listed are present in working condition',
  'Serial number / tag matches platform record',
];

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" onClick={() => onChange(star)} className="text-xl">
          <Star size={20} className={star <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
        </button>
      ))}
    </div>
  );
}

export const ExchangeLifecycle = () => {
  const params = useParams();
  const navigate = useNavigate();

  const currentUser    = useAppStore(s => s.currentUser);
  const resources      = useAppStore(s => s.resources);
  const exchanges      = useAppStore(s => s.exchanges);
  const users          = useAppStore(s => s.users);
  const updateExchange = useAppStore(s => s.updateExchange);
  const requestBorrow  = useAppStore(s => s.requestBorrow);
  const rateExchange   = useAppStore(s => s.rateExchange);

  const rawParamId     = params.exchangeId || params.resourceId || params.id;
  const matchedExchange = exchanges.find(e => e.id === rawParamId);
  const matchedResource = resources.find(r => r.id === rawParamId);

  const isNew = !matchedExchange;
  const currentResourceId = matchedExchange ? matchedExchange.resourceId : (matchedResource?.id || rawParamId);

  const resource = resources.find(r => r.id === currentResourceId);
  const exchange = matchedExchange || (resource ? { status: 'AVAILABLE', resourceId: resource.id } : null);

  const [days, setDays]         = useState(1);
  const [agreed, setAgreed]     = useState(false);
  const [rating, setRating]     = useState({ resource: 0, owner: 0 });
  const [showMaskedCall, setShowMaskedCall] = useState(false);
  const [showProtectedChat, setShowProtectedChat] = useState(false);

  const owner = users.find(u => u.id === (resource?.ownerId || exchange?.ownerId)) || {
    name: 'Verified Owner',
    trustScore: 94,
    department: 'Campus Peer',
    verified: true,
    phone: '+91 98201 45892',
  };

  if (!resource || !exchange) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft size={16} /> Back
        </Button>
        <Card className="p-8 text-center space-y-3">
          <AlertCircle size={32} className="text-amber-500 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">Exchange or Resource Not Found</h3>
          <p className="text-xs text-[var(--text-secondary)]">The requested exchange link or resource item could not be retrieved.</p>
          <Button size="sm" onClick={() => navigate('/exchanges')}>View My Exchanges</Button>
        </Card>
      </div>
    );
  }

  const currentStepIndex = exchange.status === 'AVAILABLE' ? -1 : EXCHANGES_STATES.indexOf(exchange.status);

  const depositInfo    = computeDeposit(resource.securityDeposit, currentUser?.trustScore ?? 80);
  const deposit        = isNew ? depositInfo.adjusted : (exchange.securityDeposit ?? resource.securityDeposit);
  const borrowingFee   = isNew ? resource.borrowingFee * days : exchange.borrowingFee;
  const platformFee    = isNew ? Math.round(resource.borrowingFee * days * 0.05) : exchange.platformFee;
  const total          = borrowingFee + platformFee + deposit;

  const handleNext = () => {
    if (exchange.status === 'AVAILABLE') {
      const newId = requestBorrow(resource.id, days);
      navigate(`/exchange/${newId}`, { replace: true });
    } else {
      const next = getNextState(exchange.status);
      updateExchange(exchange.id, { status: next });
    }
  };

  const handleDamageReport = (isDamaged) => {
    updateExchange(exchange.id, {
      isDamaged,
      damageAmount: isDamaged ? 250 : 0,
      damageReason: isDamaged ? 'Minor body scratch noted on return inspection' : '',
      status: 'SETTLEMENT',
    });
  };

  const handleRatingSubmit = () => {
    rateExchange(exchange.id, { resourceRating: rating.resource, ownerRating: rating.owner });
    navigate('/profile');
  };

  const settlement = exchange ? calculateSettlement(exchange, exchange.isDamaged, exchange.damageAmount) : null;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-24">
      <MaskedCallModal
        isOpen={showMaskedCall}
        onClose={() => setShowMaskedCall(false)}
        peerName={owner?.name || 'Peer'}
        exchangeId={exchange?.id || 'EXC-1048'}
      />
      <ProtectedChatModal
        isOpen={showProtectedChat}
        onClose={() => setShowProtectedChat(false)}
        peerName={owner?.name || 'Peer'}
        exchangeId={exchange?.id || 'EXC-1048'}
        resourceName={resource?.name}
      />

      <button onClick={() => navigate(-1)}
        aria-label="Go back"
        className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center gap-4 bg-[var(--surface-raised)] p-4 rounded-2xl border border-[var(--border)]">
        <ResourceImage src={resource.image} alt={resource.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-lg font-bold truncate text-[var(--text-primary)]">{resource.name}</h2>
          <p className="text-xs text-[var(--text-secondary)]">Owner: {owner?.name ?? 'Unknown'} · {resource.location}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="font-mono text-base font-bold text-[var(--text-primary)]">₹{resource.borrowingFee}</span>
          <span className="text-xs text-[var(--text-tertiary)]">/day</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        <div className="lg:w-1/3">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">Lifecycle Progress</h3>
            {EXCHANGES_STATES.map((state, idx) => {
              const isDone    = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div key={state} className={`flex items-center gap-3 py-1.5 px-2 rounded-xl text-xs transition-colors
                  ${isCurrent ? 'bg-[var(--accent)] text-[var(--bg)] font-semibold' :
                    isDone ? 'text-[var(--success)] font-medium' : 'text-[var(--text-tertiary)]'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0
                    ${isCurrent ? 'bg-white/20 text-current' :
                      isDone ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--surface-raised)] text-[var(--text-tertiary)]'}`}>
                    {isDone ? <Check size={10} /> : idx + 1}
                  </div>
                  <span className="truncate">{STEP_LABELS[state]}</span>
                  <span className="ml-auto text-[9px] uppercase tracking-wide opacity-60">
                    {isDone ? 'done' : isCurrent ? 'current' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-w-0">

          {owner && exchange.status !== 'AVAILABLE' && exchange.status !== 'RATED' && (
            <div className="mb-4 p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-serif font-bold text-base flex items-center justify-center shrink-0">
                  {owner.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">{owner.name}</h4>
                    {owner.verified && <ShieldCheck size={14} className="text-[var(--success)]" />}
                    <Badge variant="secondary" className="text-[10px]">Trust {owner.trustScore}</Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                    <Lock size={11} className="text-blue-500" /> Circular Shield™ Masked Proxy Active
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => setShowMaskedCall(true)}
                  className="gap-1 text-xs"
                >
                  <Phone size={12} className="text-blue-500" /> Protected Call
                </Button>
                <Button
                  size="xs"
                  onClick={() => setShowProtectedChat(true)}
                  className="gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white"
                >
                  <MessageSquare size={12} /> Protected Chat
                </Button>
              </div>
            </div>
          )}

          {exchange.status === 'AVAILABLE' && (
            <div className="space-y-4">
              <DealIntegrityMeter score={98} />

              <Card className="space-y-5">
                <h3 className="font-serif text-lg text-[var(--text-primary)]">Borrowing Agreement</h3>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Duration</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 5, 7].map(d => (
                      <button key={d} onClick={() => setDays(d)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors
                          ${days === d ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}>
                        {d} {d === 1 ? 'day' : 'days'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[var(--text-secondary)]"><span>Borrowing Fee ({days}d)</span><span className="font-mono">₹{borrowingFee}</span></div>
                  <div className="flex justify-between text-[var(--text-secondary)]"><span>Platform Fee (5%)</span><span className="font-mono">₹{platformFee}</span></div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Refundable Deposit</span>
                    <div className="text-right">
                      {depositInfo.saving > 0 && (
                        <span className="line-through text-[11px] text-[var(--text-tertiary)] mr-2">₹{resource.securityDeposit}</span>
                      )}
                      <span className="font-mono font-bold text-[var(--accent)]">₹{deposit}</span>
                    </div>
                  </div>
                  {depositInfo.saving > 0 && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-lg flex items-center justify-between">
                      <span className="flex items-center gap-1"><ShieldCheck size={13} /> Trust Score Discount ({currentUser?.trustScore} pts)</span>
                      <span className="font-mono font-bold">-₹{depositInfo.saving}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border)]">
                    <span>Total to pay now</span><span className="font-mono">₹{total}</span>
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] flex gap-1">
                  <AlertCircle size={11} className="shrink-0 mt-0.5" /> Deposit is secured in platform escrow and refunded automatically upon return.
                </p>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-[var(--accent)]" />
                  <span className="text-xs text-[var(--text-secondary)]">I understand and accept the Circular Shield™ peer terms.</span>
                </label>
                <Button className="w-full" disabled={!agreed} onClick={handleNext}>Confirm & Pay ₹{total}</Button>
              </Card>
            </div>
          )}

          {exchange.status === 'REQUESTED' && (
            <Card className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--warning)]">
                <AlertCircle size={20} />
                <h3 className="font-serif text-lg text-[var(--text-primary)]">Request Sent to Owner</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Your request has been sent to {owner?.name ?? 'the owner'}. Once accepted, you'll be able to proceed to smart handover.
              </p>
              <Button className="w-full" onClick={handleNext}>
                Simulate: Owner Accepts Request
              </Button>
            </Card>
          )}

          {exchange.status === 'ACCEPTED' && (
            <Card className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--success)]">
                <Check size={20} />
                <h3 className="font-serif text-lg text-[var(--text-primary)]">Request Accepted!</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                {owner?.name ?? 'The owner'} accepted your request. Meet at {resource.location} to start the Smart Handover Protocol.
              </p>
              <Button className="w-full" onClick={handleNext}>
                Proceed to Smart Handover Protocol
              </Button>
            </Card>
          )}

          {exchange.status === 'HANDOVER' && (
            <SmartHandover
              exchange={exchange}
              resource={resource}
              owner={owner}
              borrower={currentUser}
              onComplete={({ checklist: verifiedChecklist, timestamp }) => {
                updateExchange(exchange.id, {
                  conditionBefore: { rating: 5, notes: 'Confirmed via Smart Handover Protocol', checklist: Object.keys(verifiedChecklist) },
                  handoverTimestamp: timestamp,
                  status: 'BORROWED',
                });
              }}
            />
          )}

          {exchange.status === 'BORROWED' && (
            <Card className="space-y-4">
              <h3 className="font-serif text-lg text-[var(--text-primary)]">Currently Borrowed</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Enjoy using the {resource.name}. Return it on time to maintain your high trust score.
              </p>
              <div className="space-y-2 pt-2">
                <Button className="w-full" onClick={() => updateExchange(exchange.id, { status: 'RETURNED' })}>
                  Mark as Returned to Owner
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => updateExchange(exchange.id, { status: 'RETURN_DUE' })}>
                  Simulate: Return Due Date Reached
                </Button>
              </div>
            </Card>
          )}

          {/* RETURN_DUE */}
          {exchange.status === 'RETURN_DUE' && (
            <Card className="space-y-4 border-[var(--warning)]/40 bg-[var(--warning)]/5">
              <div className="flex items-center gap-2 text-[var(--warning)]">
                <AlertCircle size={20} />
                <h3 className="font-serif text-lg text-[var(--text-primary)]">Return Due</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                The borrowing period is ending. Please return the resource to avoid late fees and keep your trust score high.
              </p>
              <Button className="w-full" onClick={() => updateExchange(exchange.id, { status: 'RETURNED' })}>
                Mark as Returned to Owner
              </Button>
            </Card>
          )}

          {/* RETURNED */}
          {exchange.status === 'RETURNED' && (
            <Card className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--success)]">
                <Check size={20} />
                <h3 className="font-serif text-lg text-[var(--text-primary)]">Item Returned</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                The resource has been handed back to {owner?.name ?? 'the owner'}. The owner will now inspect the condition.
              </p>
              <Button className="w-full" onClick={() => updateExchange(exchange.id, { status: 'INSPECTION' })}>
                Start Return Inspection
              </Button>
            </Card>
          )}

          {/* INSPECTION */}
          {exchange.status === 'INSPECTION' && (
            <Card className="space-y-4">
              <h3 className="font-serif text-lg text-[var(--text-primary)]">Return Inspection</h3>
              {exchange.conditionBefore && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Before Borrowing</p>
                    <div className="space-y-1">
                      {exchange.conditionBefore.checklist.map(item => (
                        <div key={item} className="flex items-center gap-1.5 text-xs text-[var(--success)]">
                          <Check size={11} /> {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2">After Return</p>
                    <div className="space-y-1">
                      {CONDITION_CHECKLIST.map((item, i) => (
                        <div key={item} className={`flex items-center gap-1.5 text-xs ${i === 2 ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                          {i === 2 ? <AlertCircle size={11} /> : <Check size={11} />} {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <p className="text-sm text-[var(--text-secondary)]">Was any damage found?</p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => handleDamageReport(false)}>No Damage</Button>
                <Button variant="danger" className="flex-1" onClick={() => handleDamageReport(true)}>Report Damage</Button>
              </div>
            </Card>
          )}

          {/* SETTLEMENT */}
          {exchange.status === 'SETTLEMENT' && settlement && (
            <Card className="space-y-3">
              <h3 className="font-serif text-lg text-[var(--text-primary)]">Settlement Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]"><span>Security Deposit</span><span className="font-mono">₹{deposit}</span></div>
                {settlement.isDamaged && (
                  <div className="flex justify-between text-[var(--danger)]"><span>Damage Deduction</span><span className="font-mono">-₹{settlement.deduction}</span></div>
                )}
                <div className="flex justify-between font-bold text-[var(--success)] pt-2 border-t border-[var(--border)]">
                  <span>Final Refund</span><span className="font-mono">₹{settlement.refund}</span>
                </div>
              </div>
              {settlement.isDamaged && (
                <p className="text-xs text-[var(--text-tertiary)]">{exchange.damageReason}</p>
              )}
              <Button className="w-full" onClick={handleNext}>Proceed to Rating</Button>
            </Card>
          )}

          {/* RATED — rating UI */}
          {exchange.status === 'RATED' && !exchange.rating && (
            <Card className="space-y-5">
              <h3 className="font-serif text-lg text-[var(--text-primary)]">Rate Your Experience</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Resource condition</p>
                  <StarRating value={rating.resource} onChange={v => setRating(p => ({ ...p, resource: v }))} />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Owner experience</p>
                  <StarRating value={rating.owner} onChange={v => setRating(p => ({ ...p, owner: v }))} />
                </div>
              </div>
              <Button className="w-full" disabled={!rating.resource || !rating.owner} onClick={handleRatingSubmit}>
                Submit Rating
              </Button>
            </Card>
          )}

          {exchange.status === 'RATED' && exchange.rating && (
            <Card className="text-center space-y-4 py-8">
              <div className="text-4xl text-[var(--success)] font-bold">✓</div>
              <h3 className="font-serif text-xl text-[var(--text-primary)]">Exchange Complete</h3>
              <p className="text-sm text-[var(--text-secondary)]">Thank you for keeping the campus circular economy going.</p>
              <Button variant="secondary" onClick={() => navigate('/')}>Back to Discover</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
