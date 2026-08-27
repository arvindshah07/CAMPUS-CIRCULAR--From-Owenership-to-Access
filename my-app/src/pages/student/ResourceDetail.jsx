import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle2, AlertCircle, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ResourceImage } from '../../components/ui/ResourceImage';
import { useAppStore } from '../../app/store';

function conditionWidth(c) {
  if (c === 'Like New') return '100%';
  if (c === 'Excellent') return '90%';
  if (c === 'Good') return '70%';
  if (c === 'Fair') return '45%';
  return '30%';
}

function conditionColor(c) {
  if (c === 'Like New' || c === 'Excellent') return 'var(--success)';
  if (c === 'Good') return 'var(--warning)';
  return 'var(--danger)';
}

export const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const resources = useAppStore(s => s.resources);
  const users     = useAppStore(s => s.users);

  const resource = resources.find(r => r.id === id);
  if (!resource) return <div className="p-6 text-[var(--text-secondary)]">Resource not found.</div>;

  const owner = users.find(u => u.id === resource.ownerId);
  const isAvailable = !resource.availability.includes('Unavailable');

  return (
    <div className="animate-in fade-in duration-300 bg-[var(--bg)] min-h-full">
      {/* Back button */}
      <div className="px-4 md:px-6 pt-4">
        <button onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Two-column on desktop */}
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 px-4 md:px-6 lg:px-8 py-6 max-w-5xl mx-auto">

        {/* Left: image + accessories */}
        <div className="lg:w-2/5 space-y-4">
          <div className="rounded-2xl overflow-hidden bg-[var(--surface-raised)] aspect-[4/3]">
            <ResourceImage src={resource.image} alt={resource.name} className="w-full h-full object-cover" />
          </div>

          <Card>
            <h3 className="font-serif text-base mb-3 text-[var(--text-primary)]">What's included</h3>
            <ul className="space-y-2">
              {resource.accessories.map((acc, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <CheckCircle2 size={14} className="text-[var(--success)] shrink-0" /> {acc}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right: details */}
        <div className="lg:w-3/5 space-y-5 mt-6 lg:mt-0">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="primary">{resource.category}</Badge>
              <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide
                ${isAvailable ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--danger)]/10 text-[var(--danger)]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--danger)]'}`} />
                {resource.availability}
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif leading-tight text-[var(--text-primary)]">{resource.name}</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-2">{resource.description}</p>
          </div>

          {/* Pricing */}
          <Card className="bg-[var(--surface-raised)] border-none">
            <div className="flex divide-x divide-[var(--border)]">
              <div className="flex-1 px-4 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Daily Fee</div>
                <div className="font-mono text-xl font-bold text-[var(--text-primary)]">₹{resource.borrowingFee}</div>
              </div>
              <div className="flex-1 px-4 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Deposit</div>
                <div className="font-mono text-xl font-bold text-[var(--text-primary)]">₹{resource.securityDeposit}</div>
                <div className="text-[9px] text-[var(--success)]">Refundable</div>
              </div>
              <div className="flex-1 px-4 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Location</div>
                <div className="text-xs font-medium text-[var(--text-primary)] flex items-center justify-center gap-1">
                  <MapPin size={11} /> {resource.distanceMins} min
                </div>
              </div>
            </div>
          </Card>

          {/* Condition */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-base text-[var(--text-primary)]">Condition</h3>
              <span className="text-sm font-medium text-[var(--text-primary)]">{resource.condition}</span>
            </div>
            <div className="h-2 bg-[var(--surface-raised)] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: conditionWidth(resource.condition), backgroundColor: conditionColor(resource.condition) }} />
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1 mt-2">
              <AlertCircle size={11} /> Assessed during last return
            </p>
          </Card>

          {/* Owner trust */}
          {owner && (
            <Card className="border-2 border-[var(--accent)]/10 bg-[var(--accent)]/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--accent)] text-[var(--bg)] rounded-full flex items-center justify-center font-serif text-xl shrink-0">
                  {owner.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="font-bold text-[var(--text-primary)]">{owner.name}</h3>
                    {owner.verified && <ShieldCheck size={15} className="text-[var(--success)]" />}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-3">{owner.department} · {owner.year}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {[
                      { label: 'Trust Score',  value: `${owner.trustScore}/100` },
                      { label: 'Exchanges',    value: owner.successfulExchanges },
                      { label: 'On-time',      value: `${owner.onTimeReturns}%` },
                      { label: 'Disputes',     value: owner.activeDisputes },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[var(--surface)] rounded-lg p-2 text-center">
                        <div className="font-bold text-[var(--accent)]">{value}</div>
                        <div className="text-[9px] uppercase tracking-wide text-[var(--text-tertiary)] mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* CTA */}
          <div className="pt-2">
            <Button
              className="w-full"
              disabled={!isAvailable}
              onClick={() => navigate(`/borrow/${resource.id}`)}
            >
              {isAvailable ? 'Request to Borrow' : 'Currently Unavailable'}
            </Button>
            {!isAvailable && (
              <p className="text-xs text-center text-[var(--text-tertiary)] mt-2 flex items-center justify-center gap-1">
                <Clock size={11} /> Check back soon or post a community request
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
