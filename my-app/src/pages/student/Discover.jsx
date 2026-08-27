import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Clock, MapPin } from 'lucide-react';
import { InteractiveCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAppStore } from '../../app/store';

export const Discover = () => {
  const navigate = useNavigate();
  const resources = useAppStore(state => state.resources);
  
  const popularResources = resources.slice(0, 3);

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section */}
      <section className="space-y-4">
        <h1 className="text-4xl font-serif leading-tight">
          Need something?<br/>
          <span className="text-text-muted">Ask the campus.</span>
        </h1>
        
        <div 
          onClick={() => navigate('/needs')}
          className="bg-surface border border-border p-4 rounded-2xl flex items-center gap-3 cursor-text shadow-sm"
        >
          <Search size={20} className="text-text-light" />
          <span className="text-text-muted flex-1">I need to make a reel...</span>
          <div className="bg-primary/10 p-2 rounded-full text-primary">
            <Sparkles size={16} />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Quick Categories</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['Study', 'Create', 'Sports', 'Events', 'Tech', 'Music'].map(cat => (
            <button key={cat} className="px-5 py-2.5 rounded-full border border-border bg-surface hover:bg-surface-hover text-sm font-medium whitespace-nowrap transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Nearby */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Nearby & Available</h3>
        <div className="space-y-4">
          {popularResources.map(resource => (
            <InteractiveCard key={resource.id} className="p-4 flex gap-4" onClick={() => navigate(`/resource/${resource.id}`)}>
              <div className="w-24 h-24 bg-surface-hover rounded-xl overflow-hidden shrink-0">
                <img src={resource.image} alt={resource.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <Badge variant="primary">{resource.category}</Badge>
                  <span className="text-xs font-semibold">★ {resource.rating}</span>
                </div>
                <h4 className="font-medium text-sm truncate">{resource.name}</h4>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Clock size={12} /> {resource.availability}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <MapPin size={12} /> {resource.location}
                  </div>
                </div>
              </div>
            </InteractiveCard>
          ))}
        </div>
      </section>
    </div>
  );
};
