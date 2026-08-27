import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle2, AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAppStore } from '../../app/store';

export const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const resources = useAppStore(state => state.resources);
  const users = useAppStore(state => state.users);
  
  const resource = resources.find(r => r.id === id);
  if (!resource) return <div className="p-6">Resource not found.</div>;
  
  const owner = users.find(u => u.id === resource.ownerId);

  return (
    <div className="bg-surface animate-in fade-in duration-300 pb-24">
      <div className="relative h-72">
        <img src={resource.image} alt={resource.name} className="w-full h-full object-cover" />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-surface/50 backdrop-blur-md rounded-full flex items-center justify-center text-primary"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <div className="flex justify-between items-start mb-2">
            <Badge variant="primary">{resource.category}</Badge>
            <div className="flex items-center gap-1 bg-success/10 text-success px-2 py-1 rounded-md text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              {resource.availability}
            </div>
          </div>
          <h1 className="text-2xl font-serif leading-tight">{resource.name}</h1>
          <p className="text-text-muted text-sm mt-2">{resource.description}</p>
        </div>

        {/* Pricing Card */}
        <Card className="bg-surface-hover border-none flex divide-x divide-border">
          <div className="flex-1 px-4 py-2 text-center">
            <div className="text-xs uppercase tracking-wide text-text-muted mb-1">Fee</div>
            <div className="text-lg font-bold">₹{resource.borrowingFee}<span className="text-sm font-normal text-text-muted">/day</span></div>
          </div>
          <div className="flex-1 px-4 py-2 text-center">
            <div className="text-xs uppercase tracking-wide text-text-muted mb-1">Deposit</div>
            <div className="text-lg font-bold">₹{resource.securityDeposit}</div>
          </div>
        </Card>

        {/* Trust Card - Prominent */}
        <Card className="border-2 border-primary/10 bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary text-surface rounded-full flex items-center justify-center font-serif text-xl shrink-0">
              {owner?.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-bold">{owner?.name}</h3>
                <ShieldCheck size={16} className="text-success" />
              </div>
              <p className="text-xs text-text-muted mb-3">{owner?.department} • {owner?.year}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-surface rounded-md p-2">
                  <div className="font-bold text-primary">{owner?.trustScore}/100</div>
                  <div className="text-text-light text-[10px] uppercase tracking-wide">Trust Score</div>
                </div>
                <div className="bg-surface rounded-md p-2">
                  <div className="font-bold text-primary">{owner?.successfulExchanges}</div>
                  <div className="text-text-light text-[10px] uppercase tracking-wide">Exchanges</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="font-serif text-lg">What's included</h3>
          <ul className="space-y-2">
            {resource.accessories.map((acc, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-success" />
                {acc}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-serif text-lg">Condition</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-surface-hover h-2 rounded-full overflow-hidden">
              <div className="bg-success w-full h-full" />
            </div>
            <span className="text-sm font-medium">{resource.condition}</span>
          </div>
          <p className="text-xs text-text-muted flex items-center gap-1">
            <AlertCircle size={12} /> Assessed during last return
          </p>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface border-t border-border z-30 max-w-md mx-auto">
        <Button className="w-full" onClick={() => navigate(`/borrow/${resource.id}`)}>
          Request to Borrow
        </Button>
      </div>
    </div>
  );
};
