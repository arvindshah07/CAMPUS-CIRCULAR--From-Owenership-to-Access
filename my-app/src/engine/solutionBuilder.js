// ─── Kit definitions: need intent → required resource slots ──────
const KIT_DEFINITIONS = {
  reel:         { name: 'Creator Kit',       emoji: '🎬', slots: ['Camera', 'Stabilizer', 'Microphone', 'Lighting'] },
  film:         { name: 'Film Kit',          emoji: '🎥', slots: ['Camera', 'Microphone', 'Lighting', 'Stabilizer'] },
  vlog:         { name: 'Vlog Kit',          emoji: '📱', slots: ['Camera', 'Stabilizer', 'Microphone'] },
  video:        { name: 'Video Kit',         emoji: '🎞', slots: ['Camera', 'Microphone'] },
  photo:        { name: 'Photography Kit',   emoji: '📷', slots: ['Camera', 'Lighting', 'Tripod'] },
  presentation: { name: 'Presentation Kit', emoji: '📊', slots: ['Projector', 'Speaker'] },
  event:        { name: 'Event Kit',         emoji: '🎉', slots: ['Speaker', 'Projector', 'Lighting'] },
  fest:         { name: 'Fest Kit',          emoji: '🎊', slots: ['Speaker', 'Projector'] },
  trek:         { name: 'Trek Kit',          emoji: '🏕', slots: ['Backpack', 'Tent'] },
  trekking:     { name: 'Trek Kit',          emoji: '🏕', slots: ['Backpack', 'Tent'] },
  camping:      { name: 'Camp Kit',          emoji: '⛺', slots: ['Tent', 'Backpack'] },
  sports:       { name: 'Sports Kit',        emoji: '⚽', slots: ['Ball', 'Racket'] },
  music:        { name: 'Music Kit',         emoji: '🎵', slots: ['Guitar', 'Keyboard'] },
  study:        { name: 'Study Kit',         emoji: '📚', slots: ['Calculator', 'Drawing Kit'] },
};

// Slot → capability keywords for matching
const SLOT_CAPS = {
  Camera:       ['Video capture', 'Photography', 'Vlogging'],
  Stabilizer:   ['Stable recording', 'Smartphone'],
  Microphone:   ['Clear audio', 'Wireless'],
  Lighting:     ['Lighting', 'Photography'],
  Tripod:       ['Stable recording'],
  Projector:    ['Projection', 'Display', 'Presentation'],
  Speaker:      ['Audio', 'Outdoor'],
  Backpack:     ['Trekking', 'Portable'],
  Tent:         ['Camping', 'Shelter'],
  Ball:         ['Football', 'Sports'],
  Racket:       ['Badminton', 'Sports'],
  Guitar:       ['Guitar', 'Music'],
  Keyboard:     ['Production', 'Music'],
  Calculator:   ['Calculation', 'Study'],
  'Drawing Kit':['Drawing', 'Engineering'],
};

// ─── Match a resource to a slot ───────────────────────────────────
function slotScore(resource, slot) {
  const caps = SLOT_CAPS[slot] ?? [];
  const resCaps = resource.capabilities ?? [];
  const matched = caps.filter(c => resCaps.includes(c)).length;
  return caps.length > 0 ? matched / caps.length : 0;
}

// ─── Build solution bundles from a need string ────────────────────
export function buildSolution(needText, resources) {
  const lower = needText.toLowerCase();

  // Detect kit
  const kitKey = Object.keys(KIT_DEFINITIONS).find(k => lower.includes(k));
  if (!kitKey) return null;

  const kit = KIT_DEFINITIONS[kitKey];
  const approved = resources.filter(r => r.adminStatus === 'APPROVED');

  // For each slot, rank matching resources
  const slotOptions = kit.slots.map(slot => {
    const ranked = approved
      .map(r => ({ resource: r, score: slotScore(r, slot) }))
      .filter(x => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.resource.trustScore - a.resource.trustScore;
      });
    return { slot, options: ranked.slice(0, 3) };
  });

  // Filter slots that have at least one match
  const filledSlots = slotOptions.filter(s => s.options.length > 0);
  if (filledSlots.length === 0) return null;

  // ── Bundle A: Cheapest — pick lowest fee per slot ──
  const cheapest = filledSlots.map(s => ({
    slot: s.slot,
    resource: [...s.options].sort((a, b) => a.resource.borrowingFee - b.resource.borrowingFee)[0].resource,
  }));

  // ── Bundle B: Best Match — pick highest score per slot ──
  const bestMatch = filledSlots.map(s => ({
    slot: s.slot,
    resource: s.options[0].resource,
  }));

  // ── Bundle C: One-Owner — prefer single owner, fallback to fewest owners ──
  const ownerCounts = {};
  filledSlots.forEach(s => s.options.forEach(o => {
    ownerCounts[o.resource.ownerId] = (ownerCounts[o.resource.ownerId] ?? 0) + 1;
  }));
  const topOwner = Object.entries(ownerCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const oneOwner = filledSlots.map(s => {
    const ownerOpt = s.options.find(o => o.resource.ownerId === topOwner);
    return { slot: s.slot, resource: (ownerOpt ?? s.options[0]).resource };
  });

  const totalCost = (bundle) => bundle.reduce((s, b) => s + b.resource.borrowingFee, 0);
  const uniqueOwners = (bundle) => new Set(bundle.map(b => b.resource.ownerId)).size;

  return {
    kit,
    slotOptions: filledSlots,
    bundles: [
      {
        id: 'cheapest',
        label: 'Cheapest',
        description: 'Lowest total daily cost',
        items: cheapest,
        totalCost: totalCost(cheapest),
        owners: uniqueOwners(cheapest),
        highlight: false,
      },
      {
        id: 'best',
        label: 'Best Match',
        description: 'Highest trust & suitability',
        items: bestMatch,
        totalCost: totalCost(bestMatch),
        owners: uniqueOwners(bestMatch),
        highlight: true,
      },
      {
        id: 'one_owner',
        label: 'One-Owner Bundle',
        description: 'Simplest handover — fewest owners',
        items: oneOwner,
        totalCost: totalCost(oneOwner),
        owners: uniqueOwners(oneOwner),
        highlight: false,
      },
    ],
  };
}
