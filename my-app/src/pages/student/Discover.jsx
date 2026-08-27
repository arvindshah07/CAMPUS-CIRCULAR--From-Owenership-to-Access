import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Clock, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { InteractiveCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ResourceImage } from '../../components/ui/ResourceImage';
import { useAppStore } from '../../app/store';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Study', 'Create', 'Sports', 'Events', 'Outdoor', 'Music'];
const AVAILABILITY = ['All', 'Available Now', 'Available Tomorrow'];
const SORT_OPTIONS = [
  { value: 'default',   label: 'Best Match' },
  { value: 'nearest',   label: 'Nearest' },
  { value: 'fee_asc',   label: 'Lowest Fee' },
  { value: 'trust',     label: 'Highest Trust' },
];

function conditionColor(c) {
  if (c === 'Like New' || c === 'Excellent') return 'success';
  if (c === 'Good') return 'primary';
  return 'warning';
}

export const Discover = () => {
  const navigate = useNavigate();
  const resources = useAppStore(s => s.resources);

  const [query, setQuery]       = useState('');
  const [category, setCategory] = useState('All');
  const [avail, setAvail]       = useState('All');
  const [sort, setSort]         = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = resources.filter(r => r.adminStatus === 'APPROVED');

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }
    if (category !== 'All') list = list.filter(r => r.category === category);
    if (avail !== 'All')    list = list.filter(r => r.availability.includes(avail === 'Available Now' ? 'Now' : 'Tomorrow'));

    if (sort === 'nearest')  list = [...list].sort((a, b) => a.distanceMins - b.distanceMins);
    if (sort === 'fee_asc')  list = [...list].sort((a, b) => a.borrowingFee - b.borrowingFee);
    if (sort === 'trust')    list = [...list].sort((a, b) => b.trustScore - a.trustScore);

    return list;
  }, [resources, query, category, avail, sort]);

  const hasFilters = category !== 'All' || avail !== 'All' || sort !== 'default';

  return (
    <div className="flex gap-0 lg:gap-6 min-h-full">
      {/* Desktop filter sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 p-6 border-r border-[var(--border)] space-y-6">
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">Category</h3>
          <div className="space-y-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${category === cat ? 'bg-[var(--accent)] text-[var(--bg)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">Availability</h3>
          <div className="space-y-1">
            {AVAILABILITY.map(a => (
              <button key={a} onClick={() => setAvail(a)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${avail === a ? 'bg-[var(--accent)] text-[var(--bg)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">Sort By</h3>
          <div className="space-y-1">
            {SORT_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setSort(o.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${sort === o.value ? 'bg-[var(--accent)] text-[var(--bg)] font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-4 md:p-6 space-y-6 min-w-0">
        {/* Hero */}
        <section className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif leading-tight text-[var(--text-primary)]">
            Need something?<br />
            <span className="text-[var(--text-secondary)]">Ask the campus.</span>
          </h1>

          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] px-4 py-3 rounded-2xl shadow-sm">
              <Search size={18} className="text-[var(--text-tertiary)] shrink-0" />
              <input
                type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search resources..."
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={16} className="text-[var(--text-tertiary)]" />
                </button>
              )}
            </div>
            <Button variant="secondary" size="icon" onClick={() => navigate('/needs')} aria-label="AI Need Discovery" className="shrink-0 rounded-2xl">
              <Sparkles size={18} />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => setShowFilters(v => !v)} aria-label="Filters" className="lg:hidden shrink-0 rounded-2xl">
              <SlidersHorizontal size={18} />
            </Button>
          </div>
        </section>

        {/* Mobile filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden lg:hidden space-y-4">
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Category</h3>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-full border text-xs font-medium whitespace-nowrap transition-colors
                        ${category === cat ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {AVAILABILITY.map(a => (
                  <button key={a} onClick={() => setAvail(a)}
                    className={`px-4 py-2 rounded-full border text-xs font-medium transition-colors
                      ${avail === a ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Mobile category chips (always visible) */}
        <section className="lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full border text-xs font-medium whitespace-nowrap transition-colors
                  ${category === cat ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]'}`}>
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Results header */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-tertiary)]">
            Showing <span className="font-semibold text-[var(--text-primary)]">{filtered.length}</span> of {resources.filter(r => r.adminStatus === 'APPROVED').length} resources
          </p>
          {hasFilters && (
            <button onClick={() => { setCategory('All'); setAvail('All'); setSort('default'); }}
              className="text-xs text-[var(--danger)] hover:underline">
              Clear filters
            </button>
          )}
        </div>

        {/* Resource grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-[var(--text-secondary)]">No resources match your search.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button variant="secondary" size="sm" onClick={() => navigate('/needs')}>
                <Sparkles size={14} className="mr-1.5" /> Try Need AI
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/community')}>
                Post Community Request
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(resource => (
              <InteractiveCard key={resource.id} className="p-0 overflow-hidden" onClick={() => navigate(`/resource/${resource.id}`)}>
                <div className="h-44 bg-[var(--surface-raised)] overflow-hidden">
                  <ResourceImage src={resource.image} alt={resource.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="primary">{resource.category}</Badge>
                    <Badge variant={conditionColor(resource.condition)}>{resource.condition}</Badge>
                  </div>
                  <h4 className="font-serif font-semibold text-sm leading-snug text-[var(--text-primary)]">{resource.name}</h4>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1"><Clock size={11} />{resource.availability}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} />{resource.distanceMins} min</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
                    <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">₹{resource.borrowingFee}<span className="text-[var(--text-tertiary)] font-normal">/day</span></span>
                    <span className="text-xs text-[var(--text-secondary)]">★ {resource.rating} · Trust {resource.trustScore}</span>
                  </div>
                </div>
              </InteractiveCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
