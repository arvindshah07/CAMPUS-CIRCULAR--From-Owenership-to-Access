const intentRules = {
  reel: {
    purpose: "Video creation",
    capabilities: ["Video capture", "Stable recording", "Clear audio", "Lighting"],
    suggestedTypes: ["Camera", "Tripod", "Microphone", "Lighting"]
  },
  presentation: {
    purpose: "Presentation",
    capabilities: ["Display", "Projection", "Presentation control"],
    suggestedTypes: ["Projector", "Laptop", "Clicker", "Speaker"]
  },
  trekking: {
    purpose: "Outdoor Activity",
    capabilities: ["Shelter", "Outdoor", "Portable"],
    suggestedTypes: ["Tent", "Backpack", "Torch", "Camping stove"]
  },
  sports: {
    purpose: "Sports",
    capabilities: ["Physical activity", "Sports equipment"],
    suggestedTypes: ["Football", "Cricket bat", "Badminton racket"]
  },
  film: {
    purpose: "Short film",
    capabilities: ["High-quality video", "Stable shots", "Clear audio"],
    suggestedTypes: ["Camera", "Tripod", "Microphone", "Lighting"]
  },
  vlog: {
    purpose: "Vlogging",
    capabilities: ["Video capture", "Vlogging", "Clear audio"],
    suggestedTypes: ["Camera", "Gimbal", "Microphone"]
  }
};

export const interpretNeed = (text) => {
  const lowerText = text.toLowerCase();
  
  // Default fallback
  let profile = {
    purpose: "General use",
    urgency: "Flexible",
    activity: "General",
    capabilities: [],
    suggestedTypes: []
  };

  // Find intent
  for (const [key, rules] of Object.entries(intentRules)) {
    if (lowerText.includes(key)) {
      profile.purpose = rules.purpose;
      profile.capabilities = rules.capabilities;
      profile.suggestedTypes = rules.suggestedTypes;
      profile.activity = key.charAt(0).toUpperCase() + key.slice(1);
      break;
    }
  }

  // Find urgency
  if (lowerText.includes("tomorrow")) profile.urgency = "Tomorrow";
  else if (lowerText.includes("today")) profile.urgency = "Today";
  else if (lowerText.includes("weekend")) profile.urgency = "Weekend";

  return profile;
};
