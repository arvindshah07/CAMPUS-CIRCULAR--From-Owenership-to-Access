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

export const calculateSettlement = (exchange, isDamaged = false, damageAmount = 0) => {
  const { borrowingFee, platformFee, securityDeposit } = exchange;
  const transactionAmount = borrowingFee + platformFee + securityDeposit;
  
  let deduction = isDamaged ? damageAmount : 0;
  // Ensure deduction doesn't exceed deposit
  if (deduction > securityDeposit) deduction = securityDeposit;
  
  const refund = securityDeposit - deduction;
  
  return {
    transactionAmount,
    deduction,
    refund,
    isDamaged
  };
};
