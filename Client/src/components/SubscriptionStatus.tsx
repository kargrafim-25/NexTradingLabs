import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Crown, Calendar, AlertTriangle, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function SubscriptionStatus() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) return null;

  const tier = user.subscriptionTier;
  const isFree = tier === 'free';
  const isAdmin = tier === 'admin';
  
  const subscriptionEndDate = (user as any).subscriptionEndDate;
  const gracePeriodEndDate = (user as any).gracePeriodEndDate;
  
  const hasActiveSubscription = subscriptionEndDate && new Date(subscriptionEndDate) > new Date();
  
  // Calculate if we should show grace period warning (only when 4 days or less remaining or already expired)
  const shouldShowGracePeriod = () => {
    if (!gracePeriodEndDate || !subscriptionEndDate) return false;
    const now = new Date();
    const subEnd = new Date(subscriptionEndDate);
    const graceEnd = new Date(gracePeriodEndDate);
    
    // Check if grace period is still active
    if (now > graceEnd) return false;
    
    // Show if subscription has expired
    if (subEnd < now) return true;
    
    // Show if subscription has 4 days or less remaining
    const daysUntilExpiry = Math.ceil((subEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 4;
  };
  
  const isInGracePeriod = shouldShowGracePeriod();
  const isExpired = subscriptionEndDate && new Date(subscriptionEndDate) < new Date() && !isInGracePeriod;

  const getDaysRemaining = () => {
    if (!subscriptionEndDate) return null;
    const endDate = new Date(subscriptionEndDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGracePeriodDaysRemaining = () => {
    if (!gracePeriodEndDate) return null;
    const endDate = new Date(gracePeriodEndDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours;
  };

  const daysRemaining = getDaysRemaining();
  const gracePeriodHoursRemaining = getGracePeriodDaysRemaining();

  const getTierDisplay = () => {
    switch (tier) {
      case 'admin': return { name: 'Admin', color: 'bg-purple-600', icon: Crown };
      case 'pro_trader': return { name: 'Pro Trader', color: 'bg-yellow-600', icon: Crown };
      case 'starter_trader': return { name: 'Starter Trader', color: 'bg-blue-600', icon: TrendingUp };
      default: return { name: 'Free', color: 'bg-slate-600', icon: TrendingUp };
    }
  };

  const tierInfo = getTierDisplay();
  const TierIcon = tierInfo.icon;

  // Don't show subscription status for admins or free users without history
  if (isAdmin) return null;
  if (isFree && !subscriptionEndDate) return (
    <Card className="trading-card border-primary/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ready to unlock more signals?</p>
              <p className="text-lg font-bold">Upgrade Your Plan</p>
            </div>
          </div>
          <Button
            className="gradient-primary text-white"
            onClick={() => setLocation('/upgrade')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className={`trading-card ${isInGracePeriod ? 'border-orange-500/50' : isExpired ? 'border-red-500/50' : 'border-primary/30'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${tierInfo.color} rounded-full flex items-center justify-center`}>
              <TierIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{tierInfo.name} Plan</CardTitle>
              {hasActiveSubscription && (
                <Badge className="mt-1 bg-success text-white">Active</Badge>
              )}
              {isInGracePeriod && (
                <Badge className="mt-1 bg-orange-600 text-white flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Grace Period
                </Badge>
              )}
              {isExpired && (
                <Badge className="mt-1 bg-destructive text-white">Expired</Badge>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/upgrade')}
          >
            Renew / Upgrade
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Subscription End Date */}
          {hasActiveSubscription && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Subscription expires on</p>
                <p className="font-semibold">
                  {new Date(subscriptionEndDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {daysRemaining !== null && (
                  <p className={`text-sm ${daysRemaining <= 7 ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                    {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expires today'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Grace Period Warning */}
          {isInGracePeriod && (
            <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-orange-600">Grace Period Active</p>
                <p className="text-sm text-muted-foreground">
                  Your subscription expired. You have {gracePeriodHoursRemaining} hours remaining before being downgraded to Free tier.
                </p>
                <Button
                  className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => setLocation('/upgrade')}
                >
                  Renew Now
                </Button>
              </div>
            </div>
          )}

          {/* Expired Message */}
          {isExpired && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-destructive">Subscription Expired</p>
                <p className="text-sm text-muted-foreground">
                  Your {tierInfo.name} subscription has expired. Renew to regain access to premium features.
                </p>
                <Button
                  className="mt-3 w-full gradient-primary text-white"
                  onClick={() => setLocation('/upgrade')}
                >
                  Reactivate Subscription
                </Button>
              </div>
            </div>
          )}

          {/* Upgrade CTA for Free Users */}
          {isFree && !hasActiveSubscription && (
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-sm font-medium mb-2">Want more signals?</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="w-full gradient-primary text-white"
                      onClick={() => setLocation('/upgrade')}
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-sm">
                      <strong>Get more with Premium:</strong> 10-60 signals/day, Discord access, MT5 & TradingView discounts
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
