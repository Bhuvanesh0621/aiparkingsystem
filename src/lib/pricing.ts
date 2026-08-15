export interface PricingResult {
  basePrice: number;
  surgeMultiplier: number;
  surgeAmount: number;
  totalPrice: number;
  isSurgeActive: boolean;
}

export function calculateDynamicPrice(durationHours: number, timeString: string, occupancyPercentage: number = 0): PricingResult {
  const baseRatePerHour = 50;
  const basePrice = durationHours * baseRatePerHour;
  
  let surgeMultiplier = 1.0;
  let isSurgeActive = false;

  // 1. Time-based surge
  if (timeString) {
    const hour = parseInt(timeString.split(':')[0], 10);
    
    // Peak hours: 9 AM to 11 AM (09:00 - 11:59), and 5 PM to 7 PM (17:00 - 19:59)
    if ((hour >= 9 && hour <= 11) || (hour >= 17 && hour <= 19)) {
      surgeMultiplier = 1.5;
      isSurgeActive = true;
    } 
    // Evening peak
    else if (hour === 20 || hour === 21) {
      surgeMultiplier = 1.25;
      isSurgeActive = true;
    }
  }

  // 2. Occupancy-based surge
  if (occupancyPercentage > 80) {
    // If it's already surging from time, compound it or take the max. Let's just use max 1.5x for simplicity or bump it.
    surgeMultiplier = Math.max(surgeMultiplier, 1.5);
    isSurgeActive = true;
  }

  const totalPrice = Math.round(basePrice * surgeMultiplier);
  const surgeAmount = totalPrice - basePrice;

  return {
    basePrice,
    surgeMultiplier,
    surgeAmount,
    totalPrice,
    isSurgeActive
  };
}
