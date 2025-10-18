import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import VerificationModal from "@/components/VerificationModal";
import logoUrl from "@/assets/logo.png";

export default function OnboardingVerification() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [userEmail, setUserEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.email);
          setSelectedPlan(data.selectedPlan || "");
        } else {
          setLocation('/signup');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setLocation('/signup');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setLocation]);

  const handleVerificationComplete = async () => {
    // Ensure auth state is refreshed before redirecting
    await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    
    // Give a moment for the router to update
    setTimeout(() => {
      // If user selected a paid plan, redirect to upgrade/payment page
      if (selectedPlan === 'starter_trader' || selectedPlan === 'pro_trader') {
        setLocation('/upgrade');
      } else {
        // Free plan users go to dashboard
        setLocation('/');
      }
    }, 500);
  };

  const handleClose = () => {
    setLocation('/signup');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <img 
            src={logoUrl} 
            alt="Next Trading Labs Logo" 
            className="w-16 h-16 object-contain rounded-lg mx-auto mb-4"
          />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
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
        <h1 className="text-3xl font-bold mb-4">Verify Your Email</h1>
        <p className="text-muted-foreground mb-8">
          We've sent a verification code to your email address
        </p>
        
        <VerificationModal
          isOpen={true}
          onClose={handleClose}
          onComplete={handleVerificationComplete}
          userEmail={userEmail}
          emailVerified={false}
          phoneVerified={true}
          isEmailVerificationRequired={true}
        />
      </div>
    </div>
  );
}
