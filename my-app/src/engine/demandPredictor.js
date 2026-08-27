// ─── Simulated campus events calendar ────────────────────────────
export const CAMPUS_EVENTS = [
  {
    id: 'EVT-001',
    name: 'Annual Tech Fest',
    date: (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString().split('T')[0]; })(),
    daysAway: 5,
    demandSpike: { Create: 0.91, Events: 0.88, Study: 0.30, Sports: 0.20, Outdoor: 0.15, Music: 0.60 },
    description: 'Campus-wide technology festival with competitions, exhibitions and performances.',
    icon: 'TECH',
  },
  {
    id: 'EVT-002',
    name: 'End-Semester Exams',
    date: (() => { const d = new Date(); d.setDate(d.getDate() + 12); return d.toISOString().split('T')[0]; })(),
    daysAway: 12,
    demandSpike: { Study: 0.95, Create: 0.20, Events: 0.10, Sports: 0.15, Outdoor: 0.10, Music: 0.10 },
    description: 'Final examinations across all departments.',
    icon: 'ACAD',
  },
  {
    id: 'EVT-003',
    name: 'Cultural Night',
    date: (() => { const d = new Date(); d.setDate(d.getDate() + 9); return d.toISOString().split('T')[0]; })(),
    daysAway: 9,
    demandSpike: { Music: 0.94, Events: 0.85, Create: 0.78, Sports: 0.25, Outdoor: 0.20, Study: 0.05 },
    description: 'Annual cultural performances, music and arts showcase.',
    icon: 'ARTS',
  },
  {
    id: 'EVT-004',
    name: 'Sports Day',
    date: (() => { const d = new Date(); d.setDate(d.getDate() + 18); return d.toISOString().split('T')[0]; })(),
    daysAway: 18,
    demandSpike: { Sports: 0.97, Outdoor: 0.80, Create: 0.55, Events: 0.40, Study: 0.05, Music: 0.10 },
    description: 'Inter-department sports competitions and outdoor activities.',
    icon: 'SPORT',
  },
];

// ─── Predict demand per resource given upcoming events ────────────
export function predictDemand(resources, events = CAMPUS_EVENTS) {
  const nextEvent = events.sort((a, b) => a.daysAway - b.daysAway)[0];

  return resources
    .filter(r => r.adminStatus === 'APPROVED')
    .map(resource => {
      // Base demand from availability
      const isAvailable = !resource.availability.includes('Unavailable');
      let baseDemand = isAvailable ? 0.35 : 0.65; // already booked = high demand

      // Event spike
      const spike = nextEvent?.demandSpike?.[resource.category] ?? 0.3;

      // Proximity factor — closer = more demand
      const proximityBoost = resource.distanceMins <= 5 ? 0.10 : resource.distanceMins <= 10 ? 0.05 : 0;

      // Trust factor — high trust = more demand
      const trustBoost = resource.trustScore >= 90 ? 0.08 : resource.trustScore >= 80 ? 0.04 : 0;

      const demand = Math.min(0.99, baseDemand + spike * 0.5 + proximityBoost + trustBoost);

      // Days until likely unavailable (simulated)
      const daysUntilUnavailable = demand > 0.85
        ? Math.max(1, Math.round((1 - demand) * 10))
        : null;

      return {
        resource,
        demand: Math.round(demand * 100),
        daysUntilUnavailable,
        nextEvent,
        urgency: demand > 0.85 ? 'critical' : demand > 0.65 ? 'high' : demand > 0.45 ? 'medium' : 'low',
      };
    })
    .sort((a, b) => b.demand - a.demand);
}

// ─── Category-level demand summary ───────────────────────────────
export function categorySummary(resources, events = CAMPUS_EVENTS) {
  const nextEvent = events.sort((a, b) => a.daysAway - b.daysAway)[0];
  if (!nextEvent) return [];

  const categories = ['Create', 'Events', 'Study', 'Sports', 'Outdoor', 'Music'];
  return categories.map(cat => ({
    category: cat,
    demand: Math.round((nextEvent.demandSpike[cat] ?? 0.3) * 100),
    resourceCount: resources.filter(r => r.category === cat && r.adminStatus === 'APPROVED').length,
  })).sort((a, b) => b.demand - a.demand);
}
