import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logoUrl from "@/assets/logo.png";
import { ArrowRight } from "lucide-react";

export default function OnboardingQuestions() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    heardFrom: "",
    tradingExperience: "",
    tradingGoals: "",
    currentOccupation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.heardFrom || !formData.tradingExperience) {
      alert('Please answer all required questions');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding/save-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        setLocation('/onboarding/verify');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to save responses');
      }
    } catch (error) {
      alert('Failed to save responses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
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
            Tell Us About Yourself
          </h1>
          <p className="text-lg text-muted-foreground">
            Help us personalize your trading experience
          </p>
        </div>

        <Card className="trading-card">
          <CardHeader>
            <CardTitle>Quick Onboarding</CardTitle>
            <CardDescription>
              This helps us provide better recommendations and support for your trading journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="heardFrom" className="text-base">
                  How did you hear about us? <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.heardFrom}
                  onValueChange={(value) => setFormData({ ...formData, heardFrom: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social_media">Social Media (Instagram, Twitter, etc.)</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="google_search">Google Search</SelectItem>
                    <SelectItem value="friend_referral">Friend Referral</SelectItem>
                    <SelectItem value="trading_forum">Trading Forum</SelectItem>
                    <SelectItem value="online_ad">Online Advertisement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base">
                  What's your trading experience level? <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={formData.tradingExperience}
                  onValueChange={(value) => setFormData({ ...formData, tradingExperience: value })}
                  required
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent transition-colors">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner" className="flex-1 cursor-pointer">
                      <div className="font-medium">Beginner</div>
                      <div className="text-sm text-muted-foreground">New to trading, still learning the basics</div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent transition-colors">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
                      <div className="font-medium">Intermediate</div>
                      <div className="text-sm text-muted-foreground">Have some trading experience and understanding</div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent transition-colors">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced" className="flex-1 cursor-pointer">
                      <div className="font-medium">Advanced</div>
                      <div className="text-sm text-muted-foreground">Experienced trader with proven track record</div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent transition-colors">
                    <RadioGroupItem value="professional" id="professional" />
                    <Label htmlFor="professional" className="flex-1 cursor-pointer">
                      <div className="font-medium">Professional</div>
                      <div className="text-sm text-muted-foreground">Full-time professional trader or fund manager</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="currentOccupation" className="text-base">
                  What's your current occupation?
                </Label>
                <Select
                  value={formData.currentOccupation}
                  onValueChange={(value) => setFormData({ ...formData, currentOccupation: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time_trader">Full-Time Trader</SelectItem>
                    <SelectItem value="part_time_trader">Part-Time Trader</SelectItem>
                    <SelectItem value="finance_professional">Finance Professional</SelectItem>
                    <SelectItem value="it_tech">IT/Tech Professional</SelectItem>
                    <SelectItem value="entrepreneur">Entrepreneur/Business Owner</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="employed_other">Employed (Other Field)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="tradingGoals" className="text-base">
                  What are your trading goals?
                </Label>
                <Textarea
                  id="tradingGoals"
                  placeholder="E.g., Generate consistent monthly income, Learn professional trading strategies, Build long-term wealth..."
                  value={formData.tradingGoals}
                  onChange={(e) => setFormData({ ...formData, tradingGoals: e.target.value })}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Optional - Help us understand how we can best support you
                </p>
              </div>

              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-muted-foreground">
                  <span className="text-destructive">*</span> Required fields
                </p>
                <Button
                  type="submit"
                  className="gradient-primary text-white"
                  disabled={isLoading || !formData.heardFrom || !formData.tradingExperience}
                >
                  {isLoading ? (
                    'Saving...'
                  ) : (
                    <>
                      Continue to Verification
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
