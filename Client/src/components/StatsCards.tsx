import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Zap, TrendingUp, BarChart3, Crown, Calendar } from "lucide-react";
import { User, TradingSignal } from "@/types/trading";
import { format } from "date-fns";

export default function StatsCards() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: signals = [] } = useQuery<TradingSignal[]>({
    queryKey: ["/api/v1/signals"],
    enabled: !!user && user.subscriptionTier !== 'free',
  });

  const getCreditsDisplay = () => {
    if (!user) return { used: 0, total: 'N/A' };
    if (user.subscriptionTier === 'pro_trader') return { used: user.dailyCredits, total: 'Unlimited' };
    return { used: user.dailyCredits, total: user.maxDailyCredits };
  };

  const getProgressPercentage = () => {
    if (!user || user.subscriptionTier === 'pro_trader') return 85;
    return Math.min(100, (user.dailyCredits / user.maxDailyCredits) * 100);
  };

  const getSuccessRate = () => {
    if (!signals.length) return '0.0';
    
    // Only count trades that user actually took (not 'pending' or 'didnt_take')
    const takenTrades = signals.filter((s: any) => 
      s.status === 'closed' && 
      s.userAction && 
      ['successful', 'unsuccessful'].includes(s.userAction)
    );
    
    if (!takenTrades.length) return '0.0';
    
    // Count successful trades
    const successfulTrades = takenTrades.filter((s: any) => s.userAction === 'successful');
    return ((successfulTrades.length / takenTrades.length) * 100).toFixed(1);
  };

  const getTodaySignalsCount = () => {
    if (!signals.length) return 0;
    const today = new Date().toDateString();
    return signals.filter((s: any) => new Date(s.createdAt).toDateString() === today).length;
  };

  const getAccountFeatures = () => {
    if (!user) return [];
    const features = [];
    
    if (user.subscriptionTier === 'pro_trader') {
      features.push({ icon: '🔗', text: 'Discord Access' });
      features.push({ icon: '🤖', text: 'MT5 EA Discounts' });
    } else if (user.subscriptionTier === 'starter_trader') {
      features.push({ icon: '📊', text: 'Signal History' });
    }
    
    return features;
  };

  const credits = getCreditsDisplay();
  
  const getDaysRemaining = () => {
    const subscriptionEndDate = (user as any)?.subscriptionEndDate;
    if (!subscriptionEndDate) return null;
    const endDate = new Date(subscriptionEndDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isFree = user?.subscriptionTier === 'free';

  const getCooldownText = () => {
    switch (user?.subscriptionTier) {
      case 'admin': return 'No cooldown';
      case 'pro_trader': return '15 min';
      case 'starter_trader': return '30 min';
      case 'free': return '90 min';
      default: return '90 min';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
      {/* Credit Usage with Plan Display */}
      <Card className="trading-card" data-testid="card-credits">
        <CardContent className="p-2.5 md:p-4">
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            <h3 className="text-[10px] md:text-xs font-medium text-muted-foreground">Daily Credits</h3>
            <Zap className="h-3 w-3 md:h-3.5 md:w-3.5 text-warning" />
          </div>
          <div className="flex items-baseline space-x-1 md:space-x-1.5">
            <span className="text-lg md:text-xl font-bold" data-testid="text-credits-used">{credits.used}</span>
            <span className="text-xs md:text-sm text-muted-foreground">/ {credits.total}</span>
          </div>
          <div className="mt-1.5 md:mt-2 bg-muted/20 rounded-full h-1 md:h-1.5">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-1 md:h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${getProgressPercentage()}%` }}
              data-testid="progress-credits"
            />
          </div>
          {/* Plan Display */}
          <div className="mt-1.5 md:mt-2 flex items-center justify-between">
            <span className="text-[10px] md:text-xs text-muted-foreground">Plan:</span>
            <span className={`text-[10px] md:text-xs font-semibold px-1 md:px-1.5 py-0.5 rounded-full ${
              user?.subscriptionTier === 'pro_trader' ? 'bg-gradient-to-r from-secondary to-accent text-white' :
              user?.subscriptionTier === 'starter_trader' ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            }`} data-testid="text-plan-badge">
              {user?.subscriptionTier === 'pro_trader' ? 'Pro Trader' : 
               user?.subscriptionTier === 'starter_trader' ? 'Starter Trader' : 'Free User'}
            </span>
          </div>
          {/* Cooldown Period */}
          <div className="mt-1.5 md:mt-2 flex items-center justify-between">
            <span className="text-[10px] md:text-xs text-muted-foreground">Cooldown:</span>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground">
              {getCooldownText()}
            </span>
          </div>
          {/* Expiration Date */}
          {(user as any)?.subscriptionEndDate && (
            <div className="mt-1.5 md:mt-2 flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-muted-foreground">Expires:</span>
              <span className={`text-[10px] md:text-xs font-medium ${
                daysRemaining && daysRemaining <= 7 && daysRemaining > 0 ? 'text-warning' :
                daysRemaining && daysRemaining <= 0 ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {format(new Date((user as any).subscriptionEndDate), 'MMM dd, yyyy')}
                {daysRemaining !== null && daysRemaining > 0 && ` (${daysRemaining}d)`}
              </span>
            </div>
          )}
          {/* Upgrade Button for Free Users */}
          {isFree && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full mt-2 gradient-primary text-white h-7 text-[10px] md:text-xs"
                    onClick={() => setLocation('/upgrade')}
                  >
                    <Crown className="mr-1 h-3 w-3" />
                    Upgrade to Premium
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs bg-popover text-popover-foreground">
                  <p className="text-xs font-medium">
                    10-60 signals/day · Discord · MT5 & TradingView discounts
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card className="trading-card" data-testid="card-success-rate">
        <CardContent className="p-2.5 md:p-4">
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            <h3 className="text-[10px] md:text-xs font-medium text-muted-foreground">Success Rate</h3>
            <TrendingUp className="h-3 w-3 md:h-3.5 md:w-3.5 text-success" />
          </div>
          <div className="flex items-baseline space-x-1 md:space-x-1.5">
            <span className="text-lg md:text-xl font-bold text-success" data-testid="text-success-rate">
              {getSuccessRate()}%
            </span>
            <span className="text-success text-[10px] md:text-xs">↑ 2.1%</span>
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">Last 30 days</p>
        </CardContent>
      </Card>

      {/* Total Signals */}
      <Card className="trading-card" data-testid="card-signals-today">
        <CardContent className="p-2.5 md:p-4">
          <div className="flex items-center justify-between mb-0.5 md:mb-1">
            <h3 className="text-[10px] md:text-xs font-medium text-muted-foreground">Signals Today</h3>
            <BarChart3 className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
          </div>
          <div className="flex items-baseline space-x-1 md:space-x-1.5">
            <span className="text-lg md:text-xl font-bold" data-testid="text-signals-count">{getTodaySignalsCount()}</span>
            <span className="text-xs md:text-sm text-muted-foreground">generated</span>
          </div>
          <p className="text-[10px] md:text-xs text-success mt-0.5 md:mt-1">Active tracking</p>
        </CardContent>
      </Card>

    </div>
  );
}
