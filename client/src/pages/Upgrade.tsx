import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, ArrowLeft, ExternalLink } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type SubscriptionPeriod = 1 | 3 | 12;
type SubscriptionTier = 'starter_trader' | 'pro_trader';

const WHATSAPP_NUMBER = '212674820252';

const pricing = {
  starter_trader: {
    1: { price: 49, monthlyPrice: 49, savings: 0 },
    3: { price: 117, monthlyPrice: 39, savings: 20, original: 147 },
    12: { price: 319, monthlyPrice: 26.58, savings: 45, original: 588 }
  },
  pro_trader: {
    1: { price: 99, monthlyPrice: 99, savings: 0 },
    3: { price: 237, monthlyPrice: 79, savings: 20, original: 297 },
    12: { price: 700, monthlyPrice: 58.33, savings: 45, original: 1188 }
  }
};

export default function Upgrade() {
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setSelectedPeriod(1);
    setIsModalOpen(true);
  };

  const handleProceedToPayment = async () => {
    if (!selectedTier || !selectedPeriod) return;

    setIsProcessing(true);

    try {
      // Create payment request
      const response = await fetch('/api/v1/payment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan: selectedTier,
          period: selectedPeriod
        })
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || 'Failed to create payment request');
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      const paymentRequest = data.paymentRequest;
      const pricingData = data.pricing;

      // Generate WhatsApp link using backend-calculated prices
      const tierName = selectedTier === 'starter_trader' ? 'Starter Trader' : 'Pro Trader';
      const periodText = selectedPeriod === 1 ? '1 month' : selectedPeriod === 3 ? '3 months' : '1 year';
      const finalAmount = pricingData.finalAmount;
      const hasDiscount = pricingData.discountPercentage > 0;
      
      let discountText = '';
      if (hasDiscount) {
        if (pricingData.firstTimeDiscount > 0 && pricingData.periodDiscount > 0) {
          discountText = ` (${pricingData.periodDiscount}% period discount + ${pricingData.firstTimeDiscount}% first-time discount = ${pricingData.discountPercentage}% total discount)`;
        } else if (pricingData.firstTimeDiscount > 0) {
          discountText = ` (${pricingData.firstTimeDiscount}% first-time discount applied)`;
        } else if (pricingData.periodDiscount > 0) {
          discountText = ` (${pricingData.periodDiscount}% period discount applied)`;
        }
      }

      const message = `Hello! I want to subscribe to ${tierName} plan.\n\n` +
        `Plan: ${tierName}\n` +
        `Period: ${periodText}\n` +
        `Amount: $${finalAmount}${discountText}\n` +
        `Reference: ${paymentRequest.referenceCode}\n\n` +
        `Please confirm my payment.`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');

      // Close modal and show success message
      setIsModalOpen(false);
      setTimeout(() => {
        alert(`Payment request created!\n\nReference: ${paymentRequest.referenceCode}\n\nYou'll be upgraded once the admin confirms your payment via WhatsApp.`);
        setLocation('/');
      }, 500);

    } catch (error) {
      alert('Failed to create payment request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDisplayPrice = () => {
    if (!selectedTier || !selectedPeriod) return null;
    const priceInfo = pricing[selectedTier][selectedPeriod];
    return priceInfo;
  };

  const displayPrice = getDisplayPrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img 
                src={logoUrl} 
                alt="Next Trading Labs Logo" 
                className="w-12 h-12 object-contain rounded-lg"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Next Trading Labs
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Upgrade Your Trading Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get more signals, advanced features, and better discounts with our premium plans
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Starter Trader */}
          <Card className="trading-card relative border-primary shadow-lg hover:scale-105 transition-all cursor-pointer"
                onClick={() => handleSelectPlan('starter_trader')}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">Most Popular</Badge>
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl mb-4">Starter Trader</CardTitle>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-success font-medium">+ 10% off first subscription</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-success mr-3" />
                  10 signals per day
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-success mr-3" />
                  60 signals per month
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-success mr-3" />
                  30 min cooldown between signals
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-success mr-3" />
                  Discord community access
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-success mr-3" />
                  10% discount on MT5 EA
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-success mr-3" />
                  20% discount on TradingView indicators
                </li>
              </ul>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Save more with longer plans:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>3 months:</span>
                    <span className="font-semibold text-success">$117 (Save 20%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 year:</span>
                    <span className="font-semibold text-secondary">$319 (Save 45%)</span>
                  </div>
                </div>
              </div>

              <Button className="w-full gradient-primary text-white">
                Choose Starter Trader
              </Button>
            </CardContent>
          </Card>

          {/* Pro Trader */}
          <Card className="trading-card relative border-secondary hover:scale-105 transition-all cursor-pointer"
                onClick={() => handleSelectPlan('pro_trader')}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-secondary text-white px-4 py-1">Best Value</Badge>
            </div>
            <CardHeader className="pt-8">
              <div className="flex items-center gap-2 mb-4">
                <CardTitle className="text-2xl">Pro Trader</CardTitle>
                <Crown className="h-5 w-5 text-secondary" />
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-success font-medium">+ 10% off first subscription</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-success mr-3" />
                  <span className="font-semibold">Unlimited signals</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-success mr-3" />
                  15 min cooldown between signals
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-success mr-3" />
                  Discord community access
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-success mr-3" />
                  40% discount on MT5 EA
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-success mr-3" />
                  50% discount on TradingView indicators
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-success mr-3" />
                  Priority support
                </li>
              </ul>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Save more with longer plans:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>3 months:</span>
                    <span className="font-semibold text-success">$237 (Save 20%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 year:</span>
                    <span className="font-semibold text-secondary">$700 (Save 45%)</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-secondary to-accent text-white">
                Choose Pro Trader
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Payment Period Selection Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Choose Subscription Period
              </DialogTitle>
              <DialogDescription>
                Select how long you want to subscribe for {selectedTier === 'starter_trader' ? 'Starter Trader' : 'Pro Trader'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              {/* Monthly Option */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPeriod === 1 ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedPeriod(1)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">1 Month</p>
                    <p className="text-sm text-muted-foreground">
                      ${displayPrice?.monthlyPrice}/month
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${displayPrice?.price}</p>
                  </div>
                </div>
              </div>

              {/* Quarterly Option */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                  selectedPeriod === 3 ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedPeriod(3)}
              >
                <Badge className="absolute -top-2 -right-2 bg-success text-white">
                  Save 20%
                </Badge>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">3 Months</p>
                    <p className="text-sm text-muted-foreground">
                      ${selectedTier && pricing[selectedTier][3].monthlyPrice.toFixed(2)}/month
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      ${selectedTier && pricing[selectedTier][3].price}
                    </p>
                    <p className="text-xs text-muted-foreground line-through">
                      ${selectedTier && pricing[selectedTier][3].original}
                    </p>
                  </div>
                </div>
              </div>

              {/* Yearly Option */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                  selectedPeriod === 12 ? 'border-secondary bg-secondary/10' : 'border-border hover:border-secondary/50'
                }`}
                onClick={() => setSelectedPeriod(12)}
              >
                <Badge className="absolute -top-2 -right-2 bg-secondary text-white">
                  Save 45% - Best Value
                </Badge>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">1 Year</p>
                    <p className="text-sm text-muted-foreground">
                      ${selectedTier && pricing[selectedTier][12].monthlyPrice.toFixed(2)}/month
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      ${selectedTier && pricing[selectedTier][12].price}
                    </p>
                    <p className="text-xs text-muted-foreground line-through">
                      ${selectedTier && pricing[selectedTier][12].original}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="bg-muted/50 p-3 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  🎉 <span className="font-semibold">First-time subscriber bonus:</span> Additional 10% off!
                </p>
                <p className="text-lg font-bold">
                  Final Price: ${displayPrice && (displayPrice.price * 0.9).toFixed(2)}
                </p>
              </div>

              <Button
                className="w-full gradient-primary text-white"
                onClick={handleProceedToPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  'Creating request...'
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Proceed to WhatsApp Payment
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-3">
                You'll be redirected to WhatsApp to complete your payment. Your subscription will be activated once confirmed.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
