import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, InteractiveCard } from '../../components/ui/Card';
import { CircularRoute } from '../../components/visual/CircularRoute';
import { interpretNeed } from '../../engine/needInterpreter';
import { rankResources } from '../../engine/matcher';
import { useAppStore } from '../../app/store';

export const NeedDiscovery = () => {
  const navigate = useNavigate();
  const resources = useAppStore(state => state.resources);
  
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle, analyzing, results
  const [results, setResults] = useState(null);
  const [interpreted, setInterpreted] = useState(null);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    setStatus('analyzing');
    
    // Simulate AI processing time
    setTimeout(() => {
      const needProfile = interpretNeed(input);
      const ranked = rankResources(resources, needProfile);
      setInterpreted(needProfile);
      setResults(ranked);
      setStatus('results');
    }, 1500);
  };

  return (
    <div className="min-h-full flex flex-col bg-surface">
      {status === 'idle' && (
        <div className="flex-1 p-6 flex flex-col justify-center space-y-8 animate-in fade-in duration-500">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif">What are you trying to do?</h2>
            <p className="text-text-muted">Tell us naturally. We'll find what you need.</p>
          </div>
          
          <div className="space-y-4">
            <textarea
              autoFocus
              className="w-full bg-surface-hover border-none rounded-2xl p-6 text-lg focus:ring-2 focus:ring-primary/20 resize-none outline-none"
              rows={4}
              placeholder="e.g. I need equipment for our college short film this weekend."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAnalyze())}
            />
            
            <Button 
              className="w-full gap-2" 
              onClick={handleAnalyze}
              disabled={!input.trim()}
            >
              <Sparkles size={18} />
              Understand my need
            </Button>
          </div>
        </div>
      )}

      {status === 'analyzing' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
          <CircularRoute />
          <div className="text-center space-y-2 animate-pulse">
            <h3 className="font-serif text-xl">Analyzing your need...</h3>
            <p className="text-sm text-text-muted">Extracting intent and matching resources</p>
          </div>
        </div>
      )}

      {status === 'results' && (
        <div className="p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-32">
          {/* Interpretation Card */}
          <Card className="bg-primary text-surface border-none">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-surface/60 mb-4">We Understood</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-[10px] text-surface/60 uppercase">Purpose</div>
                <div className="font-medium text-sm">{interpreted.purpose}</div>
              </div>
              <div>
                <div className="text-[10px] text-surface/60 uppercase">Urgency</div>
                <div className="font-medium text-sm">{interpreted.urgency}</div>
              </div>
            </div>
            {interpreted.suggestedTypes.length > 0 && (
              <div>
                <div className="text-[10px] text-surface/60 uppercase mb-2">Recommended Kit</div>
                <div className="flex flex-wrap gap-2">
                  {interpreted.suggestedTypes.map(type => (
                    <span key={type} className="bg-surface/10 px-2.5 py-1 rounded-md text-xs">{type}</span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Results */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl">Best Matches</h3>
            
            {results.map((result, idx) => {
              const res = result.resource;
              return (
                <InteractiveCard 
                  key={res.id} 
                  className={`p-0 overflow-hidden border-2 ${idx === 0 ? 'border-primary' : 'border-border'}`}
                  onClick={() => navigate(`/resource/${res.id}`)}
                >
                  <div className="flex">
                    <div className="w-1/3 min-h-[140px]">
                      <img src={res.image} alt={res.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold ${result.match.totalScore >= 90 ? 'text-success' : 'text-primary'}`}>
                            {result.match.totalScore}% Match
                          </span>
                          <span className="text-xs font-semibold">★ {res.rating}</span>
                        </div>
                        <h4 className="font-medium text-sm mb-2">{res.name}</h4>
                        
                        <div className="space-y-1">
                          {result.match.explanations.slice(0, 3).map((exp, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-text-muted">
                              <CheckCircle2 size={12} className="text-success shrink-0" />
                              <span className="truncate">{exp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {idx === 0 && (
                    <div className="bg-primary/5 px-4 py-2 flex items-center justify-between border-t border-primary/10">
                      <span className="text-xs font-medium text-primary">View details & borrow</span>
                      <ChevronRight size={16} className="text-primary" />
                    </div>
                  )}
                </InteractiveCard>
              );
            })}
          </div>
          
          {/* Alternative / Community Request */}
          <Card className="bg-surface-hover border-dashed flex flex-col items-center text-center p-6 space-y-3">
            <h4 className="font-serif text-lg">Didn't find what you need?</h4>
            <p className="text-xs text-text-muted">Post a request to the campus. Someone might have exactly what you're looking for.</p>
            <Button variant="secondary" size="sm" className="mt-2">Post Community Request</Button>
          </Card>
        </div>
      )}
    </div>
  );
};
