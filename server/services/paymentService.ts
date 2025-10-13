import crypto from 'crypto';

// Pricing structure for subscriptions
export const SUBSCRIPTION_PRICING = {
  starter_trader: {
    1: { price: 49, discount: 0 },      // 1 month - $49
    3: { price: 117, discount: 20 },    // 3 months - $117 (20% off)
    12: { price: 319, discount: 45 }    // 1 year - $319 (45% off)
  },
  pro_trader: {
    1: { price: 99, discount: 0 },      // 1 month - $99
    3: { price: 237, discount: 20 },    // 3 months - $237 (20% off)
    12: { price: 700, discount: 45 }    // 1 year - $700 (45% off)
  }
} as const;

const FIRST_TIME_DISCOUNT = 10; // 10% discount for first-time subscribers

interface PricingCalculation {
  originalAmount: number;
  finalAmount: number;
  discountPercentage: number;
  periodDiscount: number;
  firstTimeDiscount: number;
}

/**
 * Calculate pricing for a subscription with all applicable discounts
 */
export function calculateSubscriptionPrice(
  plan: 'starter_trader' | 'pro_trader',
  period: 1 | 3 | 12,
  isFirstTime: boolean
): PricingCalculation {
  const pricing = SUBSCRIPTION_PRICING[plan][period];
  const basePrice = pricing.price;
  const periodDiscount = pricing.discount;
  
  // Calculate first-time discount on top of period discount
  let finalAmount = basePrice;
  let totalDiscount = periodDiscount;
  
  if (isFirstTime) {
    // First-time discount applies to the already-discounted price
    const firstTimeReduction = (basePrice * FIRST_TIME_DISCOUNT) / 100;
    finalAmount = basePrice - firstTimeReduction;
    totalDiscount = periodDiscount + FIRST_TIME_DISCOUNT;
  }
  
  return {
    originalAmount: basePrice,
    finalAmount: Math.round(finalAmount * 100) / 100, // Round to 2 decimal places
    discountPercentage: totalDiscount,
    periodDiscount,
    firstTimeDiscount: isFirstTime ? FIRST_TIME_DISCOUNT : 0
  };
}

/**
 * Generate unique payment reference code (e.g., PAY-ABC123)
 */
export function generateReferenceCode(): string {
  const randomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PAY-${randomCode}`;
}

/**
 * Generate WhatsApp message for payment request
 */
export function generateWhatsAppMessage(
  userEmail: string,
  plan: 'starter_trader' | 'pro_trader',
  period: 1 | 3 | 12,
  amount: number,
  referenceCode: string
): string {
  const planName = plan === 'starter_trader' ? 'Starter Trader' : 'Pro Trader';
  const periodText = period === 1 ? '1 Month' : period === 3 ? '3 Months' : '1 Year';
  
  return `Hi! I want to upgrade my NTL Trading Platform subscription.

📧 Email: ${userEmail}
📦 Plan: ${planName}
⏱️ Period: ${periodText}
💵 Amount: $${amount}
🔖 Reference: ${referenceCode}

Please guide me through the payment process.`;
}

/**
 * Get WhatsApp chat URL with pre-filled message
 */
export function getWhatsAppUrl(
  phoneNumber: string,
  message: string
): string {
  const encodedMessage = encodeURIComponent(message);
  // Remove any + or - from phone number
  const cleanNumber = phoneNumber.replace(/[+-\s]/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

/**
 * Calculate subscription end date based on start date and period
 */
export function calculateSubscriptionEndDate(
  startDate: Date,
  periodMonths: number
): Date {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + periodMonths);
  return endDate;
}

/**
 * Calculate grace period end date (48 hours after subscription end)
 */
export function calculateGracePeriodEndDate(subscriptionEndDate: Date): Date {
  const graceEndDate = new Date(subscriptionEndDate);
  graceEndDate.setHours(graceEndDate.getHours() + 48);
  return graceEndDate;
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: string): string {
  switch (plan) {
    case 'starter_trader':
      return 'Starter Trader';
    case 'pro_trader':
      return 'Pro Trader';
    case 'admin':
      return 'Admin';
    default:
      return 'Free';
  }
}

/**
 * Get period display text
 */
export function getPeriodDisplayText(period: number): string {
  if (period === 1) return '1 Month';
  if (period === 3) return '3 Months';
  if (period === 12) return '1 Year';
  return `${period} Months`;
}
