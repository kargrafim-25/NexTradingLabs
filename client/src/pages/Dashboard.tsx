import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useDeviceTracking } from "@/hooks/useDeviceFingerprint";
import { useMarketStatus } from "@/hooks/useMarketStatus";
import StatsCards from "@/components/StatsCards";
import SignalGenerator from "@/components/SignalGenerator";
import LatestSignal from "@/components/LatestSignal";
import TradingViewChart from "@/components/TradingViewChart";
import SignalHistory from "@/components/SignalHistory";
import PremiumFeatures from "@/components/PremiumFeatures";
import { EconomicNews } from "@/components/EconomicNews";
import VerificationModal from "@/components/VerificationModal";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import { TrendingUp, Database, ChevronDown, ChevronUp, Users, Mail } from "lucide-react";
import logoUrl from '../assets/logo.png';
import ChatbotTrigger from '@/components/ChatbotTrigger';
import ProfileAvatar from '@/components/ProfileAvatar';
import { NotificationBadge } from '@/components/NotificationBadge';
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AnnouncementBanner } from '@/components/AnnouncementBanner';

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user, isEmailVerificationRequired, emailVerificationError } = useAuth();
  const { isOpen: isMarketOpen, isLoading: isMarketLoading } = useMarketStatus();
  const { fingerprint, trackDeviceAction } = useDeviceTracking();
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1H');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  // Track dashboard access and device fingerprint
  useEffect(() => {
    if (isAuthenticated && user && fingerprint) {
      trackDeviceAction('dashboard_access', {
        userTier: user.subscriptionTier,
        dailyCredits: user.dailyCredits,
        monthlyCredits: user.monthlyCredits
      });
    }
  }, [isAuthenticated, user, fingerprint, trackDeviceAction]);

  // Check if verification is needed
  useEffect(() => {
    if (isEmailVerificationRequired) {
      // Show verification modal immediately if email verification is required
      setShowVerificationModal(true);
    } else if (user && isAuthenticated) {
      const needsPhoneVerification = (user as any).phoneNumber && !(user as any).phoneVerified;
      
      if (needsPhoneVerification) {
        // Show verification modal after a short delay to let the dashboard load
        const timer = setTimeout(() => {
          setShowVerificationModal(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user, isAuthenticated, isEmailVerificationRequired]);

  // Redirect to home if not authenticated (but not if email verification is required)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isEmailVerificationRequired) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, isEmailVerificationRequired, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-full animate-spin mb-4 flex items-center justify-center">
            <TrendingUp className="text-white text-2xl animate-bounce-gentle" />
          </div>
          <p className="text-lg font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <img 
                src={logoUrl} 
                alt="Next Trading Labs Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg"
                data-testid="img-logo"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Next Trading Labs
                </h1>
                <p className="text-xs text-muted-foreground hidden md:block">AI-Powered Trading Signals</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  NTL
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Market Status */}
              <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full ${
                isMarketLoading 
                  ? 'bg-muted/20' 
                  : isMarketOpen 
                    ? 'bg-success/20' 
                    : 'bg-destructive/20'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isMarketLoading
                    ? 'bg-muted animate-pulse'
                    : isMarketOpen 
                      ? 'bg-success animate-pulse' 
                      : 'bg-destructive'
                }`} data-testid="status-market"></div>
                <span className={`text-xs sm:text-sm font-medium ${
                  isMarketLoading
                    ? 'text-muted-foreground'
                    : isMarketOpen 
                      ? 'text-success' 
                      : 'text-destructive'
                }`}>
                  <span className="hidden sm:inline">
                    {isMarketLoading ? 'Checking...' : isMarketOpen ? 'Market Open' : 'Market Closed'}
                  </span>
                  <span className="sm:hidden">
                    {isMarketLoading ? '...' : isMarketOpen ? 'Open' : 'Closed'}
                  </span>
                </span>
              </div>

              {/* Admin Buttons - Only for admin users */}
              {(user?.subscriptionTier as string) === 'admin' && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.location.href = '/admin/dashboard'}
                    className="hidden sm:flex text-muted-foreground hover:text-foreground"
                    data-testid="button-admin-dashboard"
                    title="User Management"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.location.href = '/admin/logs'}
                    className="hidden sm:flex text-muted-foreground hover:text-foreground"
                    data-testid="button-admin-logs"
                    title="View API Logs"
                  >
                    <Database className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Contact Us Button */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/contact'}
                className="hidden sm:flex text-muted-foreground hover:text-foreground"
                data-testid="button-contact-us"
                title="Contact Support"
              >
                <Mail className="h-4 w-4" />
              </Button>

              {/* Notification Badge */}
              <NotificationBadge />

              {/* Profile Avatar with dropdown */}
              <ProfileAvatar user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnnouncementBanner />
        {/* Top Stats Bar */}
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Signal Generation Panel */}
          <div className="lg:col-span-1">
            <SignalGenerator 
              selectedTimeframe={selectedTimeframe}
              onTimeframeChange={setSelectedTimeframe}
            />
            <div className="mt-6">
              <LatestSignal />
            </div>
            <div className="mt-6">
              <div className="trading-card p-4">
                <EconomicNews />
              </div>
            </div>
          </div>

          {/* Chart and Analysis */}
          <div className="lg:col-span-2">
            <TradingViewChart 
              selectedTimeframe={selectedTimeframe}
              onTimeframeChange={setSelectedTimeframe}
            />
            <div className="mt-6">
              <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <div className="trading-card p-4">
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity">
                    <h3 className="text-lg font-semibold">Recent Signals</h3>
                    {isHistoryOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <SignalHistory />
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          </div>
        </div>

        {/* Premium Features */}
        {user && user.subscriptionTier === 'pro' && (
          <div className="mt-8">
            <PremiumFeatures />
          </div>
        )}
      </div>
      
      {/* Support Chatbot */}
      <ChatbotTrigger />

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => {
          // Don't allow closing if email verification is required
          if (!isEmailVerificationRequired) {
            setShowVerificationModal(false);
          }
        }}
        onComplete={() => {
          setShowVerificationModal(false);
          toast({
            title: "Verification Complete!",
            description: "Your account has been successfully verified.",
          });
        }}
        userEmail={user?.email || emailVerificationError?.email}
        userPhone={(user as any)?.phoneNumber}
        // @ts-ignore - Null to boolean conversion for verification status
        emailVerified={(user as any)?.emailVerified || false}
        phoneVerified={(user as any)?.phoneVerified || false}
        isEmailVerificationRequired={isEmailVerificationRequired}
      />
    </div>
  );
}
