import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, CheckCircle2, ChevronRight, ArrowRight, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, InteractiveCard } from '../../components/ui/Card';
import { CircularRoute } from '../../components/visual/CircularRoute';
import { interpretNeed } from '../../engine/needInterpreter';
import { rankResources } from '../../engine/matcher';
import { useAppStore } from '../../app/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ResourceImage } from '../../components/ui/ResourceImage';

const DEMO_CHIPS = [
  "I need to make a reel for tomorrow's club event",
  "Equipment for our college short film this weekend",
  "I need a calculator for my exams",
  "Badminton set for this evening",
];

function MatchBar({ label, value, max }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
        <span>{label}</span><span>{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-[var(--surface-raised)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[var(--accent)] rounded-full"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export const NeedDiscovery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resources           = useAppStore(s => s.resources);
  const users               = useAppStore(s => s.users);
  const postCommunityRequest = useAppStore(s => s.postCommunityRequest);

  const [input, setInput]           = useState(location.state?.query || '');
  const [status, setStatus]         = useState('idle');
  const [results, setResults]       = useState(null);
  const [interpreted, setInterpreted] = useState(null);
  const [requestPosted, setRequestPosted] = useState(false);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setStatus('analyzing');
    setTimeout(() => {
      const needProfile = interpretNeed(input);
      const ranked = rankResources(resources.filter(r => r.adminStatus === 'APPROVED'), needProfile);
      setInterpreted(needProfile);
      setResults(ranked);
      setStatus('results');
    }, 1500);
  };

  const handlePostRequest = () => {
    postCommunityRequest({ need: input, requiredDate: '', duration: '', budget: '' });
    setRequestPosted(true);
    setTimeout(() => setRequestPosted(false), 4000);
  };

  const topResult = results?.[0];
  const hasGoodMatch = topResult && topResult.match.totalScore >= 40;
  const topOwner = topResult ? users.find(u => u.id === topResult.resource.ownerId) : null;

  return (
    <div className="min-h-full flex flex-col bg-[var(--bg)]">
      <AnimatePresence mode="wait">

        {status === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col justify-center space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-serif text-[var(--text-primary)]">What are you trying to do?</h2>
              <p className="text-[var(--text-secondary)]">Tell us naturally. We'll find what you need.</p>
            </div>

            <div className="space-y-4">
              <textarea
                autoFocus rows={4}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] resize-none outline-none transition-colors"
                placeholder="e.g. I need equipment for our college short film this weekend."
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAnalyze())}
              />

              <div className="space-y-2">
                <p className="text-xs text-[var(--text-tertiary)]">Try a real need:</p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_CHIPS.map(chip => (
                    <button key={chip} onClick={() => setInput(chip)}
                      className="px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors">
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full gap-2" onClick={handleAnalyze} disabled={!input.trim()}>
                <Sparkles size={16} /> Understand my need
              </Button>
            </div>
          </motion.div>
        )}

        {status === 'analyzing' && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
            <CircularRoute
              needLabel="Your Need"
              capabilityNodes={['Analyzing…']}
              className="w-48 h-48"
            />
            <div className="text-center space-y-2">
              <h3 className="font-serif text-xl text-[var(--text-primary)]">Analyzing your need…</h3>
              <p className="text-sm text-[var(--text-secondary)]">Extracting intent and matching resources</p>
            </div>
          </motion.div>
        )}

        {status === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 max-w-3xl mx-auto w-full space-y-8 pb-24">

            {/* Circular Route — semantic */}
            {topResult && (
              <div className="flex justify-center">
                <CircularRoute
                  needLabel="Your Need"
                  capabilityNodes={interpreted.suggestedTypes.slice(0, 4)}
                  resourceName={topResult.resource.name.split(' ').slice(0, 2).join(' ')}
                  ownerName={topOwner?.name ?? 'Owner'}
                  className="w-64 h-64"
                />
              </div>
            )}

            {/* Interpretation card */}
            <Card className="bg-[var(--accent)] text-[var(--bg)] border-none">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-4">We Understood</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Purpose',  value: interpreted.purpose },
                  { label: 'Urgency',  value: interpreted.urgency },
                  { label: 'Activity', value: interpreted.activity },
                  { label: 'Duration', value: interpreted.duration ?? 'Flexible' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-[9px] uppercase tracking-wider opacity-60">{label}</div>
                    <div className="font-medium text-sm mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
              {interpreted.suggestedTypes.length > 0 && (
                <div>
                  <div className="text-[9px] uppercase tracking-wider opacity-60 mb-2">Recommended Kit</div>
                  <div className="flex flex-wrap gap-2">
                    {interpreted.suggestedTypes.map(type => (
                      <span key={type} className="bg-white/10 px-2.5 py-1 rounded-md text-xs">{type}</span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl text-[var(--text-primary)]">
                  {hasGoodMatch ? 'Best Matches' : 'Closest Alternatives'}
                </h3>
                <button onClick={() => setStatus('idle')} className="text-xs text-[var(--text-secondary)] hover:underline">
                  Search again
                </button>
              </div>

              {!hasGoodMatch && (
                <Card className="border-[var(--warning)]/30 bg-[var(--warning)]/5">
                  <p className="text-sm text-[var(--text-secondary)]">
                    No exact match found. Here are the closest alternatives — or post a community request below.
                  </p>
                </Card>
              )}

              {results.slice(0, 5).map((result, idx) => {
                const res = result.resource;
                const score = result.match;
                return (
                  <InteractiveCard key={res.id} className={`p-0 overflow-hidden border-2 ${idx === 0 && hasGoodMatch ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}
                    onClick={() => navigate(`/resource/${res.id}`)}>
                    <div className="flex">
                      <div className="w-28 md:w-36 shrink-0">
                        <ResourceImage src={res.image} alt={res.name} className="w-full h-full object-cover min-h-[120px]" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <motion.span
                              className={`text-sm font-bold ${score.totalScore >= 80 ? 'text-[var(--success)]' : score.totalScore >= 50 ? 'text-[var(--warning)]' : 'text-[var(--text-secondary)]'}`}
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.1 }}
                            >
                              {score.totalScore}% Match
                            </motion.span>
                            <span className="text-xs text-[var(--text-secondary)] shrink-0">★ {res.rating}</span>
                          </div>
                          <h4 className="font-serif font-semibold text-sm leading-snug text-[var(--text-primary)] mb-2">{res.name}</h4>
                          <div className="space-y-1">
                            {score.explanations.slice(0, 3).map((exp, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                                <CheckCircle2 size={11} className="text-[var(--success)] shrink-0" />
                                <span className="truncate">{exp}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">₹{res.borrowingFee}/day</span>
                          <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
                        </div>
                      </div>
                    </div>

                    {/* Score breakdown for top result */}
                    {idx === 0 && (
                      <div className="px-4 pb-4 pt-2 border-t border-[var(--border)] space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Match Breakdown</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                          <MatchBar label="Suitability" value={score.scoreDetails.suitability} max={35} />
                          <MatchBar label="Availability" value={score.scoreDetails.availability} max={20} />
                          <MatchBar label="Trust"        value={score.scoreDetails.trust}        max={15} />
                          <MatchBar label="Distance"     value={score.scoreDetails.distance}     max={10} />
                          <MatchBar label="Condition"    value={score.scoreDetails.condition}    max={10} />
                          <MatchBar label="Cost"         value={score.scoreDetails.cost}         max={5} />
                        </div>
                      </div>
                    )}
                  </InteractiveCard>
                );
              })}
            </div>

            {/* Community Request */}
            <Card className="bg-[var(--surface-raised)] border-dashed text-center space-y-3 p-6">
              <Users size={24} className="mx-auto text-[var(--text-tertiary)]" />
              <h4 className="font-serif text-lg text-[var(--text-primary)]">Didn't find what you need?</h4>
              <p className="text-xs text-[var(--text-secondary)]">Post a request to the campus. Someone might have exactly what you're looking for.</p>
              <AnimatePresence mode="wait">
                {requestPosted ? (
                  <motion.div key="posted" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 text-sm text-[var(--success)] font-medium">
                    <CheckCircle2 size={16} /> Request posted! Checking for matches…
                  </motion.div>
                ) : (
                  <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Button variant="secondary" size="sm" onClick={handlePostRequest}>
                      Post Community Request <ArrowRight size={14} className="ml-1.5" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
