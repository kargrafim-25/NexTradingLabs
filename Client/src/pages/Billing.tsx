import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  Crown,
  ArrowLeft
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface PaymentRequest {
  id: string;
  requestedPlan: 'starter_trader' | 'pro_trader';
  subscriptionPeriod: number;
  referenceCode: string;
  amount: string;
  originalAmount: string;
  discountPercentage: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export default function Billing() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [paymentHistory, setPaymentHistory] = useState<PaymentRequest[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch('/api/v1/payment-requests/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data.paymentRequests || []);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const getSubscriptionLabel = (tier: string) => {
    switch (tier) {
      case 'admin': return 'Admin';
      case 'pro_trader': return 'Pro Trader';
      case 'starter_trader': return 'Starter Trader';
      default: return 'Free User';
    }
  };

  const getCooldownPeriod = (tier: string) => {
    switch (tier) {
      case 'admin': return '0 min (No cooldown)';
      case 'pro_trader': return '15 min';
      case 'starter_trader': return '30 min';
      case 'free': return '90 min';
      default: return '90 min';
    }
  };

  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case 'admin': return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
      case 'pro_trader': return 'bg-gradient-to-r from-secondary to-accent text-white';
      case 'starter_trader': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPlanLabel = (plan: string) => {
    return plan === 'starter_trader' ? 'Starter Trader' : plan === 'pro_trader' ? 'Pro Trader' : plan;
  };

  const getPeriodLabel = (months: number) => {
    if (months === 1) return '1 Month';
    if (months === 3) return '3 Months';
    if (months === 12) return '1 Year';
    return `${months} Months`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-white"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-white"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDaysRemaining = () => {
    if (!user?.subscriptionEndDate) return null;
    const endDate = new Date(user.subscriptionEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isInGracePeriod = () => {
    if (!user?.gracePeriodEndDate || !user?.subscriptionEndDate) return false;
    const gracePeriodEnd = new Date(user.gracePeriodEndDate);
    const subscriptionEnd = new Date(user.subscriptionEndDate);
    const now = new Date();
    // Only show grace period warning if subscription has expired or has 4 days or less remaining
    const hasExpired = subscriptionEnd < now;
    const daysUntilExpiry = Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return now < gracePeriodEnd && (hasExpired || daysUntilExpiry <= 4);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-semibold">Loading billing information...</p>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();
  const inGracePeriod = isInGracePeriod();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Billing & Plans
          </h1>
        </div>

        {/* Current Subscription */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-primary" />
              <span>Current Subscription</span>
            </CardTitle>
            <CardDescription>Manage your subscription and billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Plan</label>
                <div className="mt-2">
                  <Badge className={`${getSubscriptionBadgeColor(user?.subscriptionTier || 'free')} text-sm py-1 px-3`}>
                    {getSubscriptionLabel(user?.subscriptionTier || 'free')}
                  </Badge>
                </div>
              </div>

              {/* Signal Generation Cooldown */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Signal Cooldown</label>
                <p className="mt-2 text-lg font-semibold">
                  {getCooldownPeriod(user?.subscriptionTier || 'free')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Time between signal generations</p>
              </div>

              {/* Subscription Period */}
              {user?.subscriptionPeriod && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subscription Period</label>
                  <p className="mt-2 text-lg font-semibold">
                    {getPeriodLabel(user.subscriptionPeriod)}
                  </p>
                </div>
              )}

              {/* Start Date */}
              {user?.subscriptionStartDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Started On</label>
                  <div className="mt-2 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {format(new Date(user.subscriptionStartDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}

              {/* End Date */}
              {user?.subscriptionEndDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {daysRemaining && daysRemaining > 0 ? 'Renews On' : 'Expired On'}
                  </label>
                  <div className="mt-2 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {format(new Date(user.subscriptionEndDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  {daysRemaining !== null && (
                    <p className={`text-xs mt-1 ${
                      daysRemaining <= 7 && daysRemaining > 0 
                        ? 'text-warning' 
                        : daysRemaining <= 0 
                          ? 'text-destructive' 
                          : 'text-muted-foreground'
                    }`}>
                      {daysRemaining > 0 
                        ? `${daysRemaining} days remaining` 
                        : inGracePeriod
                          ? 'In grace period - renew now to avoid downgrade'
                          : 'Subscription expired'
                      }
                    </p>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {user?.subscriptionTier === 'free' ? (
                <Button 
                  onClick={() => setLocation('/upgrade')}
                  className="w-full sm:w-auto gradient-primary text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => setLocation('/upgrade')}
                    className="w-full sm:w-auto gradient-primary text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {daysRemaining !== null && daysRemaining <= 30 && (
                    <Button 
                      onClick={() => setLocation('/upgrade')}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Renew Subscription
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Grace Period Warning */}
            {inGracePeriod && (
              <div className="flex items-start space-x-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-warning">Grace Period Active</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your subscription has expired but you have until{' '}
                    {user?.gracePeriodEndDate && format(new Date(user.gracePeriodEndDate), 'MMM dd, yyyy')}
                    {' '}to renew before being downgraded to the free tier.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>Payment History</span>
            </CardTitle>
            <CardDescription>View all your payment transactions and requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 gradient-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading payment history...</p>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No payment history yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upgrade to a premium plan to start your trading journey
                </p>
                <Button 
                  onClick={() => setLocation('/upgrade')}
                  className="mt-4 gradient-primary text-white"
                >
                  View Plans
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div 
                    key={payment.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="font-semibold">{getPlanLabel(payment.requestedPlan)}</p>
                        <Badge variant="outline" className="text-xs">
                          {getPeriodLabel(payment.subscriptionPeriod)}
                        </Badge>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <span className="font-mono">{payment.referenceCode}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</span>
                        </span>
                        {payment.completedAt && (
                          <span className="flex items-center space-x-1">
                            <CheckCircle2 className="h-3 w-3 text-success" />
                            <span>Completed {formatDistanceToNow(new Date(payment.completedAt), { addSuffix: true })}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                      <p className="text-2xl font-bold">${payment.amount}</p>
                      {payment.discountPercentage > 0 && (
                        <div className="flex items-center justify-end space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground line-through">
                            ${payment.originalAmount}
                          </span>
                          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                            {payment.discountPercentage}% OFF
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
