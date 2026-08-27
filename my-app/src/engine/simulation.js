export const EXCHANGES_STATES = [
  "REQUESTED",
  "ACCEPTED",
  "HANDOVER",
  "BORROWED",
  "RETURN_DUE",
  "RETURNED",
  "INSPECTION",
  "SETTLEMENT",
  "RATED"
];

export const getNextState = (currentState) => {
  const index = EXCHANGES_STATES.indexOf(currentState);
  if (index >= 0 && index < EXCHANGES_STATES.length - 1) {
    return EXCHANGES_STATES[index + 1];
  }
  return currentState;
};

export const calculateSettlement = (exchange, isDamagedParam, damageAmountParam) => {
  if (!exchange) return null;
  const borrowingFee = exchange.borrowingFee || 0;
  const platformFee = exchange.platformFee || 0;
  const securityDeposit = exchange.securityDeposit ?? 500;
  const transactionAmount = borrowingFee + platformFee + securityDeposit;
  
  const isDamaged = isDamagedParam !== undefined && typeof isDamagedParam === 'boolean'
    ? isDamagedParam
    : !!exchange.isDamaged;
  const damageAmount = typeof damageAmountParam === 'number'
    ? damageAmountParam
    : (exchange.damageAmount || 0);

  let deduction = isDamaged ? damageAmount : 0;
  // Ensure deduction doesn't exceed deposit
  if (deduction > securityDeposit) deduction = securityDeposit;
  
  const refund = Math.max(0, securityDeposit - deduction);
  
  return {
    transactionAmount,
    deduction,
    refund,
    isDamaged,
  };
};
