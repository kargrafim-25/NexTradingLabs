export interface TakeProfitLevel {
  level: number;
  price: number;
  risk_reward_ratio: number;
}

export interface TradingSignal {
  id: string;
  userId: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  timeframe: '15M' | '30M' | '1H' | '4H' | '1D' | '1W';
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  takeProfits?: TakeProfitLevel[];
  confidence: number;
  analysis: string | null;
  status: 'fresh' | 'active' | 'closed' | 'stopped';
  pips: string | null;
  createdAt: string;
  closedAt: string | null;
}

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  subscriptionTier: 'free' | 'starter_trader' | 'pro_trader' | 'admin';
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
  subscriptionPeriod?: number | null;
  gracePeriodEndDate?: string | null;
  isFirstTimeSubscriber?: boolean;
  dailyCredits: number;
  monthlyCredits: number;
  maxDailyCredits: number;
  maxMonthlyCredits: number;
  lastCreditReset: string | null;
  lastGenerationTime: string | null;
  onboardingCompleted: boolean;
  selectedPlan: string | null;
  heardFrom: string | null;
  tradingExperience: string | null;
  tradingGoals: string | null;
  currentOccupation: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketStatus {
  isOpen: boolean;
  timezone: string;
  message: string;
}

export interface GenerateSignalRequest {
  timeframe: '15M' | '30M' | '1H' | '4H' | '1D' | '1W';
}

export interface GenerateSignalResponse {
  signal?: TradingSignal;
  creditsUsed?: number;
  creditsRemaining?: number | 'unlimited';
  cooldownMinutes?: number;
  nextGenerationTime?: string;
  basicConfirmation?: {
    message: string;
    confidence: number;
    timeframe: string;
    timestamp: string;
  };
  upgrade?: boolean;
}
