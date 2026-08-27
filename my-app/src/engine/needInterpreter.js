const INTENT_RULES = {
  reel:         { purpose: 'Video creation',       capabilities: ['Video capture', 'Stable recording', 'Clear audio', 'Lighting'],          suggestedTypes: ['Camera', 'Tripod', 'Microphone', 'Lighting'] },
  film:         { purpose: 'Short film',            capabilities: ['Video capture', 'Stable recording', 'Clear audio', 'Lighting'],          suggestedTypes: ['Camera', 'Tripod', 'Microphone', 'Lighting'] },
  vlog:         { purpose: 'Vlogging',              capabilities: ['Video capture', 'Vlogging', 'Clear audio'],                              suggestedTypes: ['Camera', 'Gimbal', 'Microphone'] },
  video:        { purpose: 'Video recording',       capabilities: ['Video capture', 'Clear audio'],                                          suggestedTypes: ['Camera', 'Microphone'] },
  photo:        { purpose: 'Photography',           capabilities: ['Photography', 'Interchangeable lens'],                                   suggestedTypes: ['Camera', 'Tripod', 'Lighting'] },
  presentation: { purpose: 'Presentation',          capabilities: ['Display', 'Projection', 'Presentation', 'Audio'],                       suggestedTypes: ['Projector', 'Speaker', 'Laptop'] },
  event:        { purpose: 'Event',                 capabilities: ['Audio', 'Projection', 'Screening', 'Outdoor'],                          suggestedTypes: ['Speaker', 'Projector', 'Extension Board'] },
  fest:         { purpose: 'College fest',          capabilities: ['Audio', 'Projection', 'Outdoor'],                                       suggestedTypes: ['Speaker', 'Projector'] },
  study:        { purpose: 'Study / Exams',         capabilities: ['Calculation', 'Study', 'Exams', 'Engineering'],                         suggestedTypes: ['Calculator', 'Drawing Kit', 'Textbook'] },
  exam:         { purpose: 'Exam preparation',      capabilities: ['Calculation', 'Study', 'Exams'],                                        suggestedTypes: ['Calculator'] },
  calculator:   { purpose: 'Calculation',           capabilities: ['Calculation', 'Study', 'Exams'],                                        suggestedTypes: ['Calculator'] },
  sports:       { purpose: 'Sports',                capabilities: ['Sports', 'Physical activity', 'Outdoor'],                               suggestedTypes: ['Football', 'Badminton', 'Cricket'] },
  badminton:    { purpose: 'Badminton',             capabilities: ['Sports', 'Badminton', 'Indoor'],                                        suggestedTypes: ['Badminton Racket Set'] },
  football:     { purpose: 'Football',              capabilities: ['Sports', 'Football', 'Outdoor'],                                        suggestedTypes: ['Football'] },
  trek:         { purpose: 'Trekking',              capabilities: ['Trekking', 'Outdoor', 'Camping', 'Portable'],                           suggestedTypes: ['Backpack', 'Tent', 'Torch'] },
  trekking:     { purpose: 'Trekking',              capabilities: ['Trekking', 'Outdoor', 'Camping', 'Portable'],                           suggestedTypes: ['Backpack', 'Tent', 'Torch'] },
  camping:      { purpose: 'Camping',               capabilities: ['Camping', 'Shelter', 'Outdoor'],                                        suggestedTypes: ['Tent', 'Backpack'] },
  outdoor:      { purpose: 'Outdoor activity',      capabilities: ['Outdoor', 'Portable'],                                                  suggestedTypes: ['Tent', 'Backpack'] },
  music:        { purpose: 'Music',                 capabilities: ['Music', 'Performance', 'Practice'],                                     suggestedTypes: ['Guitar', 'Keyboard'] },
  guitar:       { purpose: 'Guitar practice',       capabilities: ['Music', 'Guitar', 'Practice'],                                          suggestedTypes: ['Acoustic Guitar'] },
  audio:        { purpose: 'Audio recording',       capabilities: ['Clear audio', 'Wireless', 'Interviews'],                                suggestedTypes: ['Microphone'] },
  microphone:   { purpose: 'Audio recording',       capabilities: ['Clear audio', 'Wireless'],                                              suggestedTypes: ['Microphone'] },
  camera:       { purpose: 'Camera use',            capabilities: ['Video capture', 'Photography', 'Interchangeable lens'],                 suggestedTypes: ['Camera', 'Tripod'] },
  lighting:     { purpose: 'Lighting',              capabilities: ['Lighting', 'Photography', 'Video capture'],                             suggestedTypes: ['Ring Light', 'LED Light'] },
};

const URGENCY_MAP = [
  { tokens: ['right now', 'immediately', 'asap'],          value: 'Right now' },
  { tokens: ['today', 'tonight', 'this evening'],          value: 'Today' },
  { tokens: ['tomorrow'],                                   value: 'Tomorrow' },
  { tokens: ['this weekend', 'weekend'],                    value: 'This weekend' },
  { tokens: ['next week'],                                  value: 'Next week' },
  { tokens: ['this month'],                                 value: 'This month' },
];

const DURATION_MAP = [
  { tokens: ['for an hour', 'for a few hours', 'a couple of hours'], value: 'A few hours' },
  { tokens: ['for a day', 'one day', '1 day'],                       value: '1 day' },
  { tokens: ['for the weekend', 'over the weekend'],                  value: 'Weekend' },
  { tokens: ['for a week', 'one week'],                               value: '1 week' },
];

export const interpretNeed = (text) => {
  const lower = text.toLowerCase();

  // Score every intent
  const scores = Object.entries(INTENT_RULES).map(([key, rules]) => ({
    key,
    rules,
    score: lower.includes(key) ? 1 : 0,
  })).filter(e => e.score > 0);

  // Merge capabilities from all matched intents
  let merged = { purpose: 'General use', capabilities: [], suggestedTypes: [], activity: 'General' };

  if (scores.length > 0) {
    // Primary intent = first match
    const primary = scores[0];
    merged.purpose = primary.rules.purpose;
    merged.activity = primary.key.charAt(0).toUpperCase() + primary.key.slice(1);

    // Union all capabilities and types
    const capSet = new Set();
    const typeSet = new Set();
    scores.forEach(({ rules }) => {
      rules.capabilities.forEach(c => capSet.add(c));
      rules.suggestedTypes.forEach(t => typeSet.add(t));
    });
    merged.capabilities = [...capSet];
    merged.suggestedTypes = [...typeSet];
  }

  // Urgency
  merged.urgency = 'Flexible';
  for (const { tokens, value } of URGENCY_MAP) {
    if (tokens.some(t => lower.includes(t))) { merged.urgency = value; break; }
  }

  // Duration
  merged.duration = null;
  for (const { tokens, value } of DURATION_MAP) {
    if (tokens.some(t => lower.includes(t))) { merged.duration = value; break; }
  }

  return merged;
};
