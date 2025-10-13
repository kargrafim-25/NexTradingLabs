import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check } from "lucide-react";
import logoUrl from "@/assets/logo.png";

export default function PlanSelection() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelection = async (plan: string) => {
    setSelectedPlan(plan);
    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding/select-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ selectedPlan: plan }),
      });

      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        setLocation('/onboarding/questions');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to save plan selection');
      }
    } catch (error) {
      alert('Failed to save plan selection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
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
            Choose Your Trading Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the plan that best fits your trading goals. You can upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className={`trading-card relative cursor-pointer transition-all hover:scale-105 ${
              selectedPlan === 'free' ? 'border-primary ring-2 ring-primary' : 'bg-muted/20 border-muted'
            }`}
            onClick={() => !isLoading && handlePlanSelection('free')}
          >
            {selectedPlan === 'free' && (
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full p-2">
                <Check className="h-4 w-4" />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-muted-foreground">Free</CardTitle>
                <Badge variant="secondary" className="bg-muted text-muted-foreground">Basic</Badge>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  2 signals per day
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  10 signals per month
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-warning rounded-full mr-3" />
                  90 min cooldown between signals
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  Basic AI confirmation
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  Market status updates
                </li>
              </ul>
              <Button 
                className="w-full mt-6 border-muted text-muted-foreground hover:bg-muted/20"
                variant="outline"
                disabled={isLoading}
              >
                {selectedPlan === 'free' && isLoading ? 'Selecting...' : 'Start Free'}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`trading-card relative cursor-pointer transition-all hover:scale-105 ${
              selectedPlan === 'starter' ? 'border-primary ring-2 ring-primary' : 'border-primary'
            }`}
            onClick={() => !isLoading && handlePlanSelection('starter')}
          >
            {selectedPlan === 'starter' && (
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full p-2">
                <Check className="h-4 w-4" />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Starter Trader</CardTitle>
                <Badge className="bg-primary text-primary-foreground">Popular</Badge>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  10 signals per day
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  60 signals per month
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  30 min cooldown between signals
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  Access to Discord community
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  10% discount on MT5 EA
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  20% discount on TradingView indicators
                </li>
              </ul>
              <Button 
                className="w-full mt-6 gradient-primary text-white"
                disabled={isLoading}
              >
                {selectedPlan === 'starter' && isLoading ? 'Selecting...' : 'Choose Starter'}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`trading-card relative cursor-pointer transition-all hover:scale-105 ${
              selectedPlan === 'pro' ? 'border-secondary ring-2 ring-secondary' : ''
            }`}
            onClick={() => !isLoading && handlePlanSelection('pro')}
          >
            {selectedPlan === 'pro' && (
              <div className="absolute -top-3 -right-3 bg-secondary text-secondary-foreground rounded-full p-2">
                <Check className="h-4 w-4" />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Pro Trader</CardTitle>
                <Crown className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">$79</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  Unlimited signals
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  15 min cooldown between signals
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  Access to Discord community
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  40% discount on MT5 EA
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-success rounded-full mr-3" />
                  50% discount on TradingView indicators
                </li>
              </ul>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-secondary to-accent text-white"
                disabled={isLoading}
              >
                {selectedPlan === 'pro' && isLoading ? 'Selecting...' : 'Choose Pro'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            All plans include 24/7 support and risk management tools
          </p>
        </div>
      </div>
    </div>
  );
}
