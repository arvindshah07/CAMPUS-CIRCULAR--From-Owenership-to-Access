import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Clock, AlertCircle, Star, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../app/store';
import { EXCHANGES_STATES, getNextState, calculateSettlement } from '../../engine/simulation';
import { motion } from 'framer-motion';
import { ResourceImage } from '../../components/ui/ResourceImage';

const STATE_LABELS = {
  REQUESTED:   'Request Sent',
  ACCEPTED:    'Accepted',
  HANDOVER:    'Handover',
  BORROWED:    'Borrowed',
  RETURN_DUE:  'Return Due',
  RETURNED:    'Returned',
  INSPECTION:  'Inspection',
  SETTLEMENT:  'Settlement',
  RATED:       'Rated',
};

const CONDITION_CHECKLIST = ['Screen / surface intact', 'All accessories present', 'No new scratches', 'Functional as expected'];

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} aria-label={`${n} star`}
          className="transition-transform hover:scale-110">
          <Star size={28} className={n <= value ? 'fill-[var(--warning)] text-[var(--warning)]' : 'text-[var(--border)]'} />
        </button>
      ))}
    </div>
  );
}

export const ExchangeLifecycle = () => {
  const { resourceId, exchangeId } = useParams();
  const navigate = useNavigate();
  const exchanges      = useAppStore(s => s.exchanges);
  const resources      = useAppStore(s => s.resources);
  const users          = useAppStore(s => s.users);
  const updateExchange = useAppStore(s => s.updateExchange);
  const requestBorrow  = useAppStore(s => s.requestBorrow);
  const rateExchange   = useAppStore(s => s.rateExchange);

  const isNew = !!resourceId;
  const [exchange, setExchange] = useState(null);
  const [resource, setResource] = useState(null);
  const [owner, setOwner]       = useState(null);
  const [days, setDays]         = useState(1);
  const [agreed, setAgreed]     = useState(false);
  const [checklist, setChecklist] = useState({});
  const [rating, setRating]     = useState({ resource: 0, owner: 0 });

  useEffect(() => {
    if (isNew) {
      const res = resources.find(r => r.id === resourceId);
      setResource(res);
      setExchange({ status: 'AVAILABLE', resourceId });
    } else {
      const exc = exchanges.find(e => e.id === exchangeId);
      if (exc) {
        setExchange(exc);
        setResource(resources.find(r => r.id === exc.resourceId));
        setOwner(users.find(u => u.id === exc.ownerId));
      }
    }
  }, [isNew, resourceId, exchangeId, exchanges, resources, users]);

  // Keep local exchange in sync with store
  useEffect(() => {
    if (!isNew && exchangeId) {
      const exc = exchanges.find(e => e.id === exchangeId);
      if (exc) setExchange(exc);
    }
  }, [exchanges, isNew, exchangeId]);

  if (!resource || !exchange) return <div className="p-6 text-[var(--text-secondary)]">Loading…</div>;

  const currentStepIndex = exchange.status === 'AVAILABLE' ? -1 : EXCHANGES_STATES.indexOf(exchange.status);

  const borrowingFee   = isNew ? resource.borrowingFee * days : exchange.borrowingFee;
  const platformFee    = isNew ? Math.round(resource.borrowingFee * days * 0.05) : exchange.platformFee;
  const deposit        = resource.securityDeposit;
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
      damageReason: isDamaged ? 'Minor body scratch noted on return' : '',
      status: 'SETTLEMENT',
    });
  };

  const handleRatingSubmit = () => {
    rateExchange(exchange.id, { resourceRating: rating.resource, ownerRating: rating.owner });
  };

  const settlement = exchange.status === 'SETTLEMENT' || exchange.status === 'RATED'
    ? calculateSettlement({ borrowingFee: exchange.borrowingFee, platformFee: exchange.platformFee, securityDeposit: deposit }, exchange.isDamaged, exchange.damageAmount)
    : null;

  return (
    <div className="bg-[var(--bg)] min-h-full animate-in fade-in duration-300">
      <div className="px-4 md:px-6 pt-4">
        <button onClick={() => navigate(-1)} aria-label="Go back"
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-6 lg:px-8 py-6 max-w-4xl mx-auto">

        {/* Left: timeline */}
        <div className="lg:w-56 shrink-0">
          <h1 className="text-2xl font-serif text-[var(--text-primary)] mb-6">Borrowing Journey</h1>

          {/* Resource summary */}
          <div className="flex gap-3 items-center bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl mb-6">
            <ResourceImage src={resource.image} alt={resource.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-sm text-[var(--text-primary)] truncate">{resource.name}</div>
              <div className="text-xs text-[var(--text-secondary)]">₹{resource.borrowingFee}/day</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative border-l-2 border-[var(--border)] ml-3 space-y-6">
            {EXCHANGES_STATES.map((state, idx) => {
              const isPast    = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isFuture  = idx > currentStepIndex;
              return (
                <div key={state} className={`relative flex items-center gap-3 ${isFuture ? 'opacity-35' : ''}`}>
                  <div className={`absolute -left-[27px] w-5 h-5 rounded-full flex items-center justify-center shrink-0
                    ${isPast    ? 'bg-[var(--success)] text-white'
                    : isCurrent ? 'bg-[var(--accent)] text-[var(--bg)] ring-4 ring-[var(--accent)]/20'
                    :             'bg-[var(--surface)] border-2 border-[var(--border)]'}`}>
                    {isPast && <Check size={11} strokeWidth={3} />}
                    {isCurrent && <div className="w-2 h-2 rounded-full bg-[var(--bg)]" />}
                  </div>
                  <span className={`text-sm ${isCurrent ? 'font-semibold text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                    {STATE_LABELS[state] ?? state}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: state content */}
        <div className="flex-1 space-y-5 pb-24 lg:pb-0">

          {/* AVAILABLE — Agreement */}
          {exchange.status === 'AVAILABLE' && (
            <Card className="space-y-4">
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
                <div className="flex justify-between text-[var(--text-secondary)]"><span>Refundable Deposit</span><span className="font-mono">₹{deposit}</span></div>
                <div className="flex justify-between font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border)]">
                  <span>Total to pay now</span><span className="font-mono">₹{total}</span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)] flex gap-1">
                <AlertCircle size={11} className="shrink-0 mt-0.5" /> Deposit is fully refunded if returned without damage.
              </p>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-[var(--accent)]" />
                <span className="text-xs text-[var(--text-secondary)]">I understand and accept the borrowing terms.</span>
              </label>
              <Button className="w-full" disabled={!agreed} onClick={handleNext}>Confirm & Pay ₹{total}</Button>
            </Card>
          )}

          {/* HANDOVER — condition checklist */}
          {exchange.status === 'HANDOVER' && (
            <Card className="space-y-4">
              <h3 className="font-serif text-lg text-[var(--text-primary)]">Condition at Handover</h3>
              <p className="text-sm text-[var(--text-secondary)]">Confirm the item condition before taking it.</p>
              <div className="space-y-2">
                {CONDITION_CHECKLIST.map(item => (
                  <label key={item} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={!!checklist[item]} onChange={e => setChecklist(p => ({ ...p, [item]: e.target.checked }))}
                      className="accent-[var(--accent)] w-4 h-4" />
                    <span className="text-sm text-[var(--text-secondary)]">{item}</span>
                  </label>
                ))}
              </div>
              <Button className="w-full" disabled={Object.values(checklist).filter(Boolean).length < CONDITION_CHECKLIST.length}
                onClick={() => {
                  updateExchange(exchange.id, {
                    conditionBefore: { rating: 5, notes: 'Confirmed at handover', checklist: CONDITION_CHECKLIST },
                    status: 'BORROWED',
                  });
                }}>
                Confirm Condition & Take Item
              </Button>
            </Card>
          )}

          {/* BORROWED / RETURN_DUE */}
          {(exchange.status === 'BORROWED' || exchange.status === 'RETURN_DUE') && (
            <Card className="space-y-3">
              <h3 className="font-serif text-lg text-[var(--text-primary)]">
                {exchange.status === 'RETURN_DUE' ? '⚠ Return Due' : 'Currently Borrowed'}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {exchange.status === 'RETURN_DUE'
                  ? 'Please return the item to avoid late fees.'
                  : 'Enjoy the item. Return it on time to keep your trust score high.'}
              </p>
              <Button className="w-full" onClick={handleNext}>Mark as Returned</Button>
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
          {exchange.status === 'INSPECTION' || exchange.status === 'SETTLEMENT' ? null : null}
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
              <div className="text-4xl">✓</div>
              <h3 className="font-serif text-xl text-[var(--text-primary)]">Exchange Complete</h3>
              <p className="text-sm text-[var(--text-secondary)]">Thank you for keeping the campus circular economy going.</p>
              <Button variant="secondary" onClick={() => navigate('/')}>Back to Discover</Button>
            </Card>
          )}

          {/* Generic advance button for intermediate states */}
          {!['AVAILABLE', 'HANDOVER', 'BORROWED', 'RETURN_DUE', 'INSPECTION', 'SETTLEMENT', 'RATED'].includes(exchange.status) && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] z-30 lg:static lg:bg-transparent lg:border-none lg:p-0 lg:backdrop-blur-none">
              <Button className="w-full" onClick={handleNext}>
                Simulate: Move to {STATE_LABELS[getNextState(exchange.status)] ?? getNextState(exchange.status)}
              </Button>
            </div>
          )}

          {/* REQUESTED / ACCEPTED advance */}
          {(exchange.status === 'REQUESTED' || exchange.status === 'ACCEPTED') && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] z-30 lg:static lg:bg-transparent lg:border-none lg:p-0">
              <Button className="w-full" onClick={handleNext}>
                Simulate: Move to {STATE_LABELS[getNextState(exchange.status)]}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
