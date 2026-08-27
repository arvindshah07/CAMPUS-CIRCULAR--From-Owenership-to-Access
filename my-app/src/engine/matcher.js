export const calculateMatch = (resource, needProfile) => {
  let score = {
    suitability: 0, // max 35
    availability: 0, // max 20
    trust: 0, // max 15
    distance: 0, // max 10
    condition: 0, // max 10
    cost: 0, // max 5
    deposit: 0, // max 5
  };

  let explanations = [];

  // Suitability (35)
  let matchedCaps = 0;
  if (needProfile.capabilities.length > 0) {
    needProfile.capabilities.forEach(cap => {
      if (resource.capabilities.includes(cap)) matchedCaps++;
    });
    score.suitability = Math.round((matchedCaps / needProfile.capabilities.length) * 35);
    if (score.suitability > 25) explanations.push("Highly suitable for your need");
    else if (score.suitability > 10) explanations.push("Partially matches your need");
  } else {
    // If no specific capabilities needed, base on category
    score.suitability = 20;
  }

  // Availability (20)
  if (needProfile.urgency === "Tomorrow" && resource.availability.includes("Tomorrow")) {
    score.availability = 20;
    explanations.push("Available tomorrow");
  } else if (needProfile.urgency === "Today" && resource.availability.includes("Now")) {
    score.availability = 20;
    explanations.push("Available today");
  } else if (resource.availability.includes("Now") || resource.availability.includes("Tomorrow")) {
    score.availability = 15;
    explanations.push("Available soon");
  } else {
    score.availability = 5;
  }

  // Trust (15)
  score.trust = Math.round((resource.trustScore / 100) * 15);
  if (resource.trustScore > 90) explanations.push("Highly trusted owner");

  // Distance (10)
  if (resource.distanceMins <= 5) {
    score.distance = 10;
    explanations.push("Very close (< 5 mins)");
  } else if (resource.distanceMins <= 10) {
    score.distance = 8;
    explanations.push("Nearby (5-10 mins)");
  } else {
    score.distance = 5;
  }

  // Condition (10)
  if (resource.condition === "Like New" || resource.condition === "Excellent") {
    score.condition = 10;
    explanations.push("Excellent condition");
  } else if (resource.condition === "Good") {
    score.condition = 7;
  } else {
    score.condition = 4;
  }

  // Cost (5)
  if (resource.borrowingFee <= 100) score.cost = 5;
  else if (resource.borrowingFee <= 200) score.cost = 3;
  else score.cost = 1;

  // Deposit (5)
  if (resource.securityDeposit <= 500) score.deposit = 5;
  else if (resource.securityDeposit <= 1000) {
    score.deposit = 3;
    explanations.push("Requires refundable deposit");
  } else {
    score.deposit = 1;
    explanations.push("High refundable deposit");
  }

  const totalScore = Object.values(score).reduce((a, b) => a + b, 0);

  return {
    scoreDetails: score,
    totalScore,
    explanations
  };
};

export const rankResources = (resources, needProfile) => {
  return resources
    .map(resource => ({
      resource,
      match: calculateMatch(resource, needProfile)
    }))
    .sort((a, b) => b.match.totalScore - a.match.totalScore);
};
