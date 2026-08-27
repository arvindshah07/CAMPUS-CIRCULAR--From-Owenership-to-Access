import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle2, AlertCircle, ShieldCheck, Clock, Award, TrendingDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ResourceImage } from '../../components/ui/ResourceImage';
import { CampusMap } from '../../components/ui/CampusMap';
import { useAppStore, computeDeposit } from '../../app/store';
import { ContactProtectionBadge } from '../../components/protection/CircularShield';
import { ResourcePassport } from '../../components/protection/ResourcePassport';

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
  const resources   = useAppStore(s => s.resources);
  const users       = useAppStore(s => s.users);
  const currentUser = useAppStore(s => s.currentUser);

  const resource = resources.find(r => r.id === id);
  const owner = resource ? users.find(u => u.id === resource.ownerId) : null;

  if (!resource) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 mb-4">
          <ArrowLeft size={16} /> Back
        </Button>
        <Card className="text-center py-12">
          <p className="text-[var(--text-secondary)] font-medium">Resource not found.</p>
        </Card>
      </div>
    );
  }

  const isAvailable = resource.adminStatus === 'APPROVED' && resource.availability !== 'Unavailable (Booked)';
  const depositInfo = computeDeposit(resource.securityDeposit, currentUser?.trustScore ?? 70);

  // Economic comparison calculations (Borrow vs Buy)
  const estimatedRetail = Math.round(resource.borrowingFee * 120 + resource.securityDeposit * 1.5);
  const borrowCost3Days = resource.borrowingFee * 3;
  const savingsAmount = Math.max(0, estimatedRetail - borrowCost3Days);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft size={16} /> Back
      </Button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: image & Resource Passport */}
        <div className="lg:w-2/5 space-y-4">
          <div className="rounded-2xl overflow-hidden aspect-4/3 bg-[var(--surface-raised)] border border-[var(--border)]">
            <ResourceImage src={resource.image} alt={resource.name} className="w-full h-full object-cover" />
          </div>

          {/* Interactive Resource Passport */}
          <ResourcePassport resource={resource} owner={owner} />

          {/* What's included */}
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

          {/* Pricing & Trust-Adaptive Deposit */}
          <Card className="bg-[var(--surface-raised)] border-none space-y-3">
            <div className="flex divide-x divide-[var(--border)]">
              <div className="flex-1 px-4 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Daily Fee</div>
                <div className="font-mono text-xl font-bold text-[var(--text-primary)]">₹{resource.borrowingFee}</div>
              </div>
              <div className="flex-1 px-4 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Your Deposit</div>
                <div className="font-mono text-xl font-bold text-[var(--accent)]">₹{depositInfo.adjusted}</div>
                {depositInfo.saving > 0 ? (
                  <div className="text-[9px] text-[var(--success)] font-semibold">Save ₹{depositInfo.saving} (Trust {currentUser?.trustScore})</div>
                ) : (
                  <div className="text-[9px] text-[var(--success)]">100% Refundable</div>
                )}
              </div>
              <div className="flex-1 px-4 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Location</div>
                <div className="text-xs font-medium text-[var(--text-primary)] flex items-center justify-center gap-1">
                  <MapPin size={11} /> {resource.distanceMins} min
                </div>
              </div>
            </div>

            {depositInfo.saving > 0 && (
              <div className="text-[11px] text-[var(--text-secondary)] bg-[var(--surface)] p-2 rounded-xl flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" /> Standard deposit ₹{resource.securityDeposit} reduced for you
                </span>
                <span className="font-mono font-bold text-emerald-600">{depositInfo.label}</span>
              </div>
            )}
          </Card>

          {/* Borrow vs Buy Economic Calculator */}
          <Card className="border border-blue-500/20 bg-blue-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <TrendingDown size={14} /> Should you Borrow or Buy?
              </span>
              <span className="text-[10px] uppercase tracking-wide font-mono text-blue-600">3-Day Comparison</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-[var(--surface)] p-2.5 rounded-xl">
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Borrow on Campus</div>
                <div className="font-mono text-lg font-bold text-[var(--accent)]">₹{borrowCost3Days}</div>
                <div className="text-[9px] text-emerald-600 font-medium">3 days + 0 maintenance</div>
              </div>
              <div className="bg-[var(--surface)] p-2.5 rounded-xl">
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Buy New (Retail)</div>
                <div className="font-mono text-lg font-bold text-[var(--text-tertiary)] line-through">₹{estimatedRetail.toLocaleString()}</div>
                <div className="text-[9px] text-red-500 font-medium">Depreciates immediately</div>
              </div>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)] pt-1 text-center">
              [Economic Advantage] Borrowing saves you <span className="font-bold text-emerald-600">₹{savingsAmount.toLocaleString()}</span> for this short-term project.
            </div>
          </Card>

          {/* Condition & Health Meter */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-base text-[var(--text-primary)] flex items-center gap-1.5">
                <Award size={16} className="text-amber-500" /> Resource Health & Condition
              </h3>
              <span className="text-sm font-medium text-[var(--text-primary)]">{resource.condition}</span>
            </div>
            <div className="h-2 bg-[var(--surface-raised)] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: conditionWidth(resource.condition), backgroundColor: conditionColor(resource.condition) }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 pt-2 border-t border-[var(--border)]">
              <div>
                <div className="font-mono font-bold text-[var(--text-primary)]">96%</div>
                <div className="text-[9px] text-[var(--text-tertiary)]">Physical Shell</div>
              </div>
              <div>
                <div className="font-mono font-bold text-[var(--text-primary)]">94%</div>
                <div className="text-[9px] text-[var(--text-tertiary)]">Electronics</div>
              </div>
              <div>
                <div className="font-mono font-bold text-[var(--text-primary)]">100%</div>
                <div className="text-[9px] text-[var(--text-tertiary)]">Accessories</div>
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1 mt-2">
              <AlertCircle size={11} /> Assessed during last return inspection
            </p>
          </Card>

          {/* Campus map */}
          {resource.coords && (
            <div className="space-y-1">
              <h3 className="font-serif text-base text-[var(--text-primary)]">Location</h3>
              <CampusMap mode="single" resource={resource} />
            </div>
          )}

          {/* Owner trust & Circular Shield Protected Contact */}
          {owner && (
            <Card className="border-2 border-[var(--accent)]/10 bg-[var(--accent)]/5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--accent)] text-[var(--bg)] rounded-full flex items-center justify-center font-serif text-xl shrink-0">
                  {owner.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="font-bold text-[var(--text-primary)]">{owner.name}</h3>
                    {owner.verified && <ShieldCheck size={15} className="text-[var(--success)]" />}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{owner.department} · {owner.year}</p>
                </div>
              </div>

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

              {/* Circular Shield Protection Barrier */}
              <ContactProtectionBadge ownerName={owner.name} />
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
