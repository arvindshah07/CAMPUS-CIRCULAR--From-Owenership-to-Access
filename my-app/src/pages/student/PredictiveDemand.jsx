import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Calendar, Clock, ArrowRight, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, InteractiveCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ResourceImage } from '../../components/ui/ResourceImage';
import { useAppStore, computeDeposit } from '../../app/store';
import { CAMPUS_EVENTS, predictDemand, categorySummary } from '../../engine/demandPredictor';

export const PredictiveDemand = () => {
  const navigate = useNavigate();
  const resources   = useAppStore(s => s.resources);
  const currentUser = useAppStore(s => s.currentUser);
  const users       = useAppStore(s => s.users);

  const [selectedEventId, setSelectedEventId] = useState(CAMPUS_EVENTS[0].id);
  const [categoryFilter, setCategoryFilter]   = useState('ALL');
  const [reservedModal, setReservedModal]     = useState(null);
  const [reservedSuccess, setReservedSuccess] = useState(false);

  const activeEvent = useMemo(
    () => CAMPUS_EVENTS.find(e => e.id === selectedEventId) ?? CAMPUS_EVENTS[0],
    [selectedEventId]
  );

  const demandPredictions = useMemo(
    () => predictDemand(resources, [activeEvent]),
    [resources, activeEvent]
  );

  const catSummary = useMemo(
    () => categorySummary(resources, [activeEvent]),
    [resources, activeEvent]
  );

  const filteredPredictions = useMemo(() => {
    if (categoryFilter === 'ALL') return demandPredictions;
    return demandPredictions.filter(p => p.resource.category === categoryFilter);
  }, [demandPredictions, categoryFilter]);

  const criticalScarcityCount = demandPredictions.filter(p => p.urgency === 'critical').length;

  const handleReserve = (resource) => {
    setReservedModal(resource);
  };

  const confirmReservation = () => {
    setReservedSuccess(true);
    setTimeout(() => {
      setReservedSuccess(false);
      const resId = reservedModal.id;
      setReservedModal(null);
      navigate(`/borrow/${resId}`);
    }, 1200);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap size={11} /> Predictive Intelligence
            </span>
            <span className="text-xs text-[var(--text-tertiary)] font-mono">Real-time Forecast</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[var(--text-primary)]">
            Campus Demand Forecast
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Don't get caught without gear when campus events surge. Predict scarcity and reserve early with trust-adaptive deposits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/solution')} className="gap-1.5 shrink-0">
            <Sparkles size={14} className="text-[var(--accent)]" /> Solution Builder
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/map')} className="gap-1.5 shrink-0">
            Digital Twin Map →
          </Button>
        </div>
      </div>

      {/* Event Forecast Carousel */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
          <Calendar size={13} /> Select Upcoming Campus Catalyst
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CAMPUS_EVENTS.map(evt => {
            const isSelected = evt.id === selectedEventId;
            return (
              <InteractiveCard
                key={evt.id}
                onClick={() => setSelectedEventId(evt.id)}
                className={`p-4 border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--surface-raised)] shadow-md'
                    : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-[var(--surface-raised)] font-mono text-[10px] font-bold text-[var(--text-secondary)] uppercase">{evt.icon}</span>
                  <Badge variant={evt.daysAway <= 5 ? 'danger' : 'warning'}>
                    In {evt.daysAway} days
                  </Badge>
                </div>
                <h4 className="font-serif font-bold text-sm text-[var(--text-primary)] leading-snug truncate">{evt.name}</h4>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-1 line-clamp-2">{evt.description}</p>
                <div className="text-[10px] font-mono text-[var(--text-secondary)] mt-2 pt-2 border-t border-[var(--border)] flex items-center gap-1">
                  <Calendar size={11} /> {evt.date}
                </div>
              </InteractiveCard>
            );
          })}
        </div>
      </div>

      {/* Catalyst banner */}
      <Card className="bg-[var(--accent)] text-[var(--bg)] border-none p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70">
              <AlertTriangle size={14} className="text-amber-400" /> High-Impact Forecast
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight">
              {activeEvent.name} approaches in {activeEvent.daysAway} days
            </h2>
            <p className="text-xs md:text-sm opacity-80 leading-relaxed">
              Based on historical fest cycles, demand for photo/video creation gear and presentation setups will surge past 90%. Early reservations receive full priority locking.
            </p>
          </div>

          <div className="flex gap-4 shrink-0 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <div className="text-center px-2">
              <div className="text-2xl md:text-3xl font-mono font-bold">{criticalScarcityCount}</div>
              <div className="text-[9px] uppercase tracking-wide opacity-70 mt-0.5">Scarcity Alerts</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center px-2">
              <div className="text-2xl md:text-3xl font-mono font-bold">₹{currentUser?.trustScore >= 85 ? '0' : '50'}</div>
              <div className="text-[9px] uppercase tracking-wide opacity-70 mt-0.5">Lock-in Fee</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Demand Surge Meters */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg text-[var(--text-primary)]">Category Demand Surges</h3>
            <p className="text-xs text-[var(--text-secondary)]">Expected utilization intensity during {activeEvent.name}</p>
          </div>
          <span className="text-xs font-mono text-[var(--text-tertiary)]">Updated Just Now</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {catSummary.map(cat => (
            <div
              key={cat.category}
              onClick={() => setCategoryFilter(categoryFilter === cat.category ? 'ALL' : cat.category)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                categoryFilter === cat.category
                  ? 'border-[var(--accent)] bg-[var(--surface-raised)]'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[var(--text-primary)] truncate">{cat.category}</span>
                <span className={`font-mono font-bold text-xs ${
                  cat.demand >= 85 ? 'text-red-500' : cat.demand >= 65 ? 'text-amber-500' : 'text-green-600'
                }`}>
                  {cat.demand}%
                </span>
              </div>
              <div className="h-1.5 bg-[var(--surface-raised)] rounded-full overflow-hidden mb-2">
                <motion.div
                  className={`h-full rounded-full ${
                    cat.demand >= 85 ? 'bg-red-500' : cat.demand >= 65 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.demand}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <div className="text-[9px] text-[var(--text-tertiary)]">
                {cat.resourceCount} available items
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Predictive Resource Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl text-[var(--text-primary)]">Predicted Resource Scarcity</h3>
            <span className="text-xs text-[var(--text-tertiary)]">({filteredPredictions.length} items evaluated)</span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {['ALL', 'Create', 'Events', 'Study', 'Sports', 'Outdoor', 'Music'].map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === c
                    ? 'bg-[var(--accent)] text-[var(--bg)]'
                    : 'bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPredictions.map(({ resource, demand, daysUntilUnavailable, urgency }) => {
            const owner = users.find(u => u.id === resource.ownerId);
            const depositInfo = computeDeposit(resource.securityDeposit, currentUser?.trustScore ?? 80);

            return (
              <InteractiveCard
                key={resource.id}
                className="p-0 overflow-hidden flex flex-col justify-between border-2 border-[var(--border)] hover:border-[var(--accent)]"
              >
                <div>
                  <div className="relative h-40 bg-[var(--surface-raised)]">
                    <ResourceImage src={resource.image} alt={resource.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                        urgency === 'critical' ? 'bg-red-500/90 text-white' : urgency === 'high' ? 'bg-amber-500/90 text-white' : 'bg-green-600/90 text-white'
                      }`}>
                        {demand}% Predicted Demand
                      </span>
                    </div>

                    {daysUntilUnavailable && (
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-mono flex items-center gap-1">
                        <Clock size={10} /> Fully booked in ~{daysUntilUnavailable}d
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{resource.category}</span>
                      <span className="text-xs font-semibold text-[var(--text-secondary)]">★ {resource.rating}</span>
                    </div>

                    <h4 className="font-serif font-bold text-sm text-[var(--text-primary)] leading-tight">{resource.name}</h4>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{resource.description}</p>

                    <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-1 border-t border-[var(--border)]">
                      <span>Owner: {owner?.name ?? 'Student'}</span>
                      <span>Trust {owner?.trustScore}/100</span>
                    </div>

                    {/* Trust deposit preview */}
                    <div className="bg-[var(--surface-raised)] rounded-lg p-2 flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">Your Deposit:</span>
                      <div className="flex items-center gap-1.5">
                        {depositInfo.saving > 0 && (
                          <span className="line-through text-[10px] text-[var(--text-tertiary)]">₹{resource.securityDeposit}</span>
                        )}
                        <span className="font-mono font-bold text-[var(--accent)]">₹{depositInfo.adjusted}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Button
                    variant={urgency === 'critical' ? 'danger' : 'primary'}
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={() => handleReserve(resource)}
                  >
                    Reserve Before It's Gone <ArrowRight size={14} />
                  </Button>
                </div>
              </InteractiveCard>
            );
          })}
        </div>
      </div>

      {/* Reservation Modal */}
      <AnimatePresence>
        {reservedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={(e) => e.target === e.currentTarget && setReservedModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-start gap-3">
                <ResourceImage src={reservedModal.image} alt={reservedModal.name} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Early Catalyst Lock-in</span>
                  <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] truncate">{reservedModal.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)]">For {activeEvent.name} ({activeEvent.date})</p>
                </div>
              </div>

              <Card className="space-y-2 bg-[var(--surface-raised)] border-none">
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Daily Rental Fee</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">₹{reservedModal.borrowingFee}/day</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Standard Deposit</span>
                  <span className="font-mono text-[var(--text-tertiary)] line-through">₹{reservedModal.securityDeposit}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Trust Score Discount ({currentUser?.trustScore} pts)</span>
                  <span className="font-mono font-bold text-green-600">-₹{computeDeposit(reservedModal.securityDeposit, currentUser?.trustScore ?? 80).saving}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border)]">
                  <span>Trust-Adjusted Deposit</span>
                  <span className="font-mono">₹{computeDeposit(reservedModal.securityDeposit, currentUser?.trustScore ?? 80).adjusted}</span>
                </div>
              </Card>

              <div className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                [Guaranteed Reservation] Locking this reservation guarantees the item is held for you on {activeEvent.date}. No upfront cancellation penalty if cancelled 48h prior.
              </div>

              <AnimatePresence mode="wait">
                {reservedSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-xl font-medium text-sm"
                  >
                    <CheckCircle2 size={16} /> Slot Locked! Redirecting to checkout…
                  </motion.div>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1" onClick={() => setReservedModal(null)}>
                      Cancel
                    </Button>
                    <Button className="flex-1 gap-1" onClick={confirmReservation}>
                      Confirm Reservation
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};