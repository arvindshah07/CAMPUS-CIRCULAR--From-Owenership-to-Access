import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ArrowLeftRight, Clock, Activity, Footprints, Layers, Sparkles } from 'lucide-react';
import { Card, InteractiveCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CampusMap } from '../../components/ui/CampusMap';
import { ResourceImage } from '../../components/ui/ResourceImage';
import { useAppStore } from '../../app/store';

const RECENT_CIRCULATION_FEED = [
  { id: 'ACT-1', text: 'Sony ZV-E10 Mirrorless Camera in transit', from: 'North Campus', to: 'Main Block', time: '4m ago', status: 'IN_TRANSIT' },
  { id: 'ACT-2', text: 'Casio Scientific Calculator returned on time', from: 'Library', to: 'Library', time: '18m ago', status: 'RETURNED' },
  { id: 'ACT-3', text: 'DJI OM 5 Gimbal handed over to borrower', from: 'Library', to: 'Arts Block', time: '42m ago', status: 'HANDOVER' },
  { id: 'ACT-4', text: 'Camping Tent 4-Person checked in after trek', from: 'Hostel C', to: 'South Hostel', time: '1h ago', status: 'INSPECTED' },
  { id: 'ACT-5', text: 'JBL Bluetooth Speaker reserved for Cultural Night', from: 'Hostel B', to: 'Main Block', time: '2h ago', status: 'RESERVED' },
];

export const CampusTwin = () => {
  const navigate = useNavigate();
  const resources = useAppStore(s => s.resources);
  const exchanges = useAppStore(s => s.exchanges);
  const [selectedHub, setSelectedHub] = useState('ALL');

  const approvedResources = useMemo(
    () => resources.filter(r => r.adminStatus === 'APPROVED'),
    [resources]
  );

  const hubs = useMemo(() => {
    const map = {};
    approvedResources.forEach(r => {
      const landmark = r.landmark ?? 'Campus Hub';
      if (!map[landmark]) map[landmark] = [];
      map[landmark].push(r);
    });
    return Object.entries(map).map(([landmark, items]) => ({
      landmark,
      count: items.length,
      items,
      distanceMins: items[0]?.distanceMins ?? 5,
    })).sort((a, b) => b.count - a.count);
  }, [approvedResources]);

  const filteredResources = useMemo(() => {
    if (selectedHub === 'ALL') return approvedResources;
    return approvedResources.filter(r => (r.landmark ?? 'Campus Hub') === selectedHub);
  }, [approvedResources, selectedHub]);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Layers size={11} /> Digital Twin Network
            </span>
            <span className="text-xs text-[var(--text-tertiary)] font-mono">Live Node Circulation</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[var(--text-primary)]">
            Campus Resource Twin
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            A live digital representation of physical resources circulating across academic buildings, hostels, and recreational hubs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/demand')} className="gap-1.5 shrink-0">
            Demand Forecast ⚡
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/solution')} className="gap-1.5 shrink-0">
            Solution Builder ✨
          </Button>
        </div>
      </div>

      {/* Live Network Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Campus Asset Value', value: '₹48.6L', sub: 'Accessible without buying', icon: Sparkles, color: 'text-amber-500' },
          { label: 'Active Hubs', value: `${hubs.length} Hubs`, sub: '100% campus coverage', icon: MapPin, color: 'text-blue-500' },
          { label: 'Avg Transit Distance', value: '380 m', sub: '~5.2 min average walk', icon: Footprints, color: 'text-green-500' },
          { label: 'Live Exchanges', value: `${exchanges.length + 8}`, sub: '14 handovers today', icon: ArrowLeftRight, color: 'text-purple-500' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{label}</span>
              <Icon size={16} className={color} />
            </div>
            <div className="font-mono text-2xl font-bold text-[var(--text-primary)]">{value}</div>
            <div className="text-[10px] text-[var(--text-secondary)]">{sub}</div>
          </Card>
        ))}
      </div>

      {/* Interactive Digital Twin Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-[var(--text-primary)] flex items-center gap-2">
            <Navigation size={18} className="text-blue-500" /> Interactive Campus Node Map
          </h2>
          <span className="text-xs text-[var(--text-tertiary)]">Pinch or scroll to zoom · Click pins for walk routes</span>
        </div>

        <CampusMap mode="multi" resources={approvedResources} />
      </div>

      {/* Two Column Layout: Node Distribution & Live Circulation Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Hub Directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-[var(--text-primary)]">Campus Hub Directory</h3>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedHub('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedHub === 'ALL'
                    ? 'bg-[var(--accent)] text-[var(--bg)]'
                    : 'bg-[var(--surface-raised)] text-[var(--text-secondary)]'
                }`}
              >
                All ({approvedResources.length})
              </button>
              {hubs.slice(0, 4).map(h => (
                <button
                  key={h.landmark}
                  onClick={() => setSelectedHub(h.landmark)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedHub === h.landmark
                      ? 'bg-[var(--accent)] text-[var(--bg)]'
                      : 'bg-[var(--surface-raised)] text-[var(--text-secondary)]'
                  }`}
                >
                  {h.landmark} ({h.count})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredResources.map(resource => (
              <InteractiveCard
                key={resource.id}
                onClick={() => navigate(`/resource/${resource.id}`)}
                className="p-3 flex items-center gap-3 border border-[var(--border)] hover:border-[var(--accent)]"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-raised)] overflow-hidden shrink-0">
                  <ResourceImage src={resource.image} alt={resource.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)] flex items-center justify-between">
                    <span>{resource.category}</span>
                    <span className="text-[var(--accent)] font-mono font-bold">₹{resource.borrowingFee}/d</span>
                  </div>
                  <h4 className="font-serif font-semibold text-xs text-[var(--text-primary)] truncate">{resource.name}</h4>
                  <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {resource.landmark ?? resource.location} ({resource.distanceMins}m walk)
                  </div>
                </div>
              </InteractiveCard>
            ))}
          </div>
        </div>

        {/* Right 1 col: Live Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-[var(--text-primary)] flex items-center gap-2">
              <Activity size={16} className="text-green-500 animate-pulse" /> Live Circulation Feed
            </h3>
          </div>

          <Card className="space-y-3 p-4 bg-[var(--surface-raised)] border-none">
            {RECENT_CIRCULATION_FEED.map(feed => (
              <div key={feed.id} className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <Badge variant={feed.status === 'IN_TRANSIT' ? 'warning' : 'success'}>
                    {feed.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono flex items-center gap-1">
                    <Clock size={10} /> {feed.time}
                  </span>
                </div>
                <p className="font-medium text-[var(--text-primary)]">{feed.text}</p>
                <div className="text-[10px] text-[var(--text-secondary)] flex items-center justify-between pt-1 border-t border-[var(--border)]">
                  <span>From: {feed.from}</span>
                  <span>To: {feed.to}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};