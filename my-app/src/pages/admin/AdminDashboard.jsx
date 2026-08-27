import { Users, Package, RefreshCw, IndianRupee, ShieldAlert } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const AdminDashboard = () => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-serif">Campus Impact</h1>
        <p className="text-text-muted text-sm mt-1">Real-time statistics of the circular economy.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Large Metric */}
        <Card className="col-span-2 bg-primary text-surface border-none flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wide text-surface/70">Resources Reused</span>
            <RefreshCw size={16} className="text-surface/70" />
          </div>
          <div>
            <div className="text-4xl font-serif">1,284</div>
            <div className="text-xs text-surface/70 mt-1">↓ equivalent to 842 new purchases avoided</div>
          </div>
        </Card>

        {/* Small Metrics */}
        <Card className="flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wide text-text-muted">Money Saved</span>
            <IndianRupee size={14} className="text-primary" />
          </div>
          <div className="text-2xl font-bold">₹2.4L</div>
        </Card>

        <Card className="flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wide text-text-muted">Active Members</span>
            <Users size={14} className="text-primary" />
          </div>
          <div className="text-2xl font-bold">24.8K</div>
        </Card>

        <Card className="flex flex-col justify-between h-24">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wide text-text-muted">On-time Returns</span>
            <Package size={14} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-success">97.2%</div>
        </Card>
        
        <Card className="flex flex-col justify-between h-24 bg-danger/5 border-danger/10">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-wide text-danger">Active Disputes</span>
            <ShieldAlert size={14} className="text-danger" />
          </div>
          <div className="text-2xl font-bold text-danger">4</div>
        </Card>
      </div>

      <section className="pt-4 border-t border-border space-y-4">
        <h3 className="font-serif text-lg">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-success" />
              <div className="flex-1">
                <span className="font-semibold text-primary">Camera ZV-E10</span> returned safely by <span className="font-semibold text-primary">Arvind</span>
              </div>
              <div className="text-xs text-text-muted">2m ago</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
