import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../app/store';
import { EXCHANGES_STATES, getNextState, calculateSettlement } from '../../engine/simulation';

export const ExchangeLifecycle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exchange, setExchange] = useState(null);
  const [resource, setResource] = useState(null);
  const { exchanges, resources, updateExchangeStatus, requestBorrow } = useAppStore();

  const isNewRequest = !id.startsWith('EXC-');
  
  useEffect(() => {
    if (isNewRequest) {
      const res = resources.find(r => r.id === id);
      setResource(res);
      setExchange({ status: 'AVAILABLE', resourceId: id });
    } else {
      const exc = exchanges.find(e => e.id === id);
      if (exc) {
        setExchange(exc);
        setResource(resources.find(r => r.id === exc.resourceId));
      }
    }
  }, [id, isNewRequest, exchanges, resources]);

  if (!resource || !exchange) return <div className="p-6">Loading...</div>;

  const handleNext = () => {
    if (exchange.status === 'AVAILABLE') {
      const newId = requestBorrow(resource.id, 1); // Mock 1 day
      navigate(`/exchange/${newId}`, { replace: true });
    } else {
      const next = getNextState(exchange.status);
      updateExchangeStatus(exchange.id, next);
    }
  };

  const currentStepIndex = exchange.status === 'AVAILABLE' ? -1 : EXCHANGES_STATES.indexOf(exchange.status);

  return (
    <div className="bg-surface min-h-full pb-24 animate-in fade-in duration-300">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-serif">Borrowing Journey</h1>
        
        {/* Resource summary */}
        <div className="flex gap-4 items-center bg-surface-hover p-4 rounded-xl">
          <img src={resource.image} alt={resource.name} className="w-16 h-16 rounded-lg object-cover" />
          <div>
            <div className="font-semibold">{resource.name}</div>
            <div className="text-xs text-text-muted">Owner Trust: {resource.trustScore}</div>
          </div>
        </div>

        {/* Timeline */}
        <Card className="border-none shadow-none bg-transparent px-2">
          <div className="relative border-l-2 border-border ml-3 space-y-8">
            {EXCHANGES_STATES.map((state, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isFuture = idx > currentStepIndex;
              
              return (
                <div key={state} className={`relative flex items-center gap-4 ${isFuture ? 'opacity-40' : ''}`}>
                  <div className={`absolute -left-[27px] w-5 h-5 rounded-full flex items-center justify-center
                    ${isPast ? 'bg-success text-surface' : isCurrent ? 'bg-primary text-surface ring-4 ring-primary/20' : 'bg-surface border-2 border-border'}
                  `}>
                    {isPast && <Check size={12} strokeWidth={3} />}
                    {isCurrent && <div className="w-2 h-2 rounded-full bg-surface" />}
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${isCurrent ? 'text-primary' : 'text-text-main'}`}>
                      {state.replace('_', ' ')}
                    </h4>
                    {isCurrent && <p className="text-xs text-text-muted mt-1">Action required</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        
        {/* State-specific Content */}
        {exchange.status === 'AVAILABLE' && (
          <Card className="bg-surface-hover border-none space-y-3">
            <h3 className="font-semibold text-sm">Borrowing Agreement</h3>
            <div className="text-sm flex justify-between"><span>Borrowing Fee</span><span>₹{resource.borrowingFee}</span></div>
            <div className="text-sm flex justify-between"><span>Platform Fee</span><span>₹{Math.round(resource.borrowingFee * 0.05)}</span></div>
            <div className="text-sm flex justify-between font-semibold"><span>Refundable Deposit</span><span>₹{resource.securityDeposit}</span></div>
            <div className="pt-2 border-t border-border text-sm flex justify-between font-bold">
              <span>Total to pay now</span>
              <span>₹{resource.borrowingFee + Math.round(resource.borrowingFee * 0.05) + resource.securityDeposit}</span>
            </div>
            <p className="text-[10px] text-text-muted flex gap-1 mt-2">
              <AlertCircle size={12} /> Deposit is refunded fully if returned without damage.
            </p>
          </Card>
        )}

        {exchange.status === 'INSPECTION' && (
          <Card className="bg-warning/10 border-warning/20 space-y-4">
            <h3 className="font-semibold text-warning flex items-center gap-2">
              <AlertCircle size={16} /> Inspection Report
            </h3>
            <p className="text-sm text-text-muted">Simulate a damage report to see settlement calculation.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => updateExchangeStatus(exchange.id, 'SETTLEMENT')} className="flex-1">No Damage</Button>
              <Button size="sm" variant="danger" onClick={() => {
                 // Hack for demo: store a flag
                 exchange.isDamaged = true;
                 updateExchangeStatus(exchange.id, 'SETTLEMENT');
              }} className="flex-1">Report Scratch</Button>
            </div>
          </Card>
        )}

        {exchange.status === 'SETTLEMENT' && (
          <Card className="bg-surface-hover border-none space-y-3">
            <h3 className="font-semibold text-sm">Settlement Summary</h3>
            {(() => {
              const settlement = calculateSettlement({
                borrowingFee: exchange.borrowingFee || resource.borrowingFee,
                platformFee: exchange.platformFee || Math.round(resource.borrowingFee * 0.05),
                securityDeposit: exchange.securityDeposit || resource.securityDeposit
              }, exchange.isDamaged, 250);
              return (
                <>
                  <div className="text-sm flex justify-between"><span>Security Deposit</span><span>₹{exchange.securityDeposit || resource.securityDeposit}</span></div>
                  {settlement.isDamaged && (
                    <div className="text-sm flex justify-between text-danger"><span>Damage Deduction</span><span>-₹{settlement.deduction}</span></div>
                  )}
                  <div className="pt-2 border-t border-border text-sm flex justify-between font-bold text-success">
                    <span>Final Refund</span>
                    <span>₹{settlement.refund}</span>
                  </div>
                </>
              );
            })()}
          </Card>
        )}
      </div>

      {/* Action Area */}
      {exchange.status !== 'INSPECTION' && exchange.status !== 'RATED' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface border-t border-border z-30 max-w-md mx-auto">
          <Button className="w-full" onClick={handleNext}>
            {exchange.status === 'AVAILABLE' ? 'Confirm & Pay' : `Simulate: Move to ${getNextState(exchange.status)}`}
          </Button>
        </div>
      )}
      {exchange.status === 'RATED' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface border-t border-border z-30 max-w-md mx-auto">
          <Button className="w-full" variant="secondary" onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      )}
    </div>
  );
};
