import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import AdminLogs from "@/pages/AdminLogs";
import About from "@/pages/About";
import AdminDashboard from "@/pages/AdminDashboard";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import PlanSelection from "@/pages/PlanSelection";
import OnboardingQuestions from "@/pages/OnboardingQuestions";
import OnboardingVerification from "@/pages/OnboardingVerification";
import Upgrade from "@/pages/Upgrade";
import Billing from "@/pages/Billing";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ContactUs from "@/pages/ContactUs";
import HomeButton from "@/components/HomeButton";
import { useEffect } from "react";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Public routes that don't need to wait for authentication check
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/terms', '/privacy', '/contact'];
  const currentPath = window.location.pathname;
  const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));

  // Show loading only for protected routes
  if (isLoading && !isPublicRoute) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/about" component={About} /> 
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/contact" component={ContactUs} />
        <Route path="/onboarding/plan" component={PlanSelection} />
        <Route path="/onboarding/questions" component={OnboardingQuestions} />
        <Route path="/onboarding/verify" component={OnboardingVerification} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  const needsOnboarding = !user?.onboardingCompleted;
  const needsEmailVerification = !user?.emailVerified;
  const hasSelectedPlan = !!user?.selectedPlan;
  const hasAnsweredQuestions = !!(user?.heardFrom && user?.tradingExperience);

  // Onboarding flow priority:
  // 1. No plan selected → Plan page
  // 2. Plan selected but questions not answered → Questions page
  // 3. Questions answered but email not verified → Verify page
  // 4. Everything complete → Dashboard

  if (needsOnboarding) {
    if (!hasSelectedPlan) {
      return (
        <Switch>
          <Route path="/onboarding/plan" component={PlanSelection} />
          <Route path="*">
            {() => {
              window.location.href = '/onboarding/plan';
              return null;
            }}
          </Route>
        </Switch>
      );
    }

    if (!hasAnsweredQuestions) {
      return (
        <Switch>
          <Route path="/onboarding/questions" component={OnboardingQuestions} />
          <Route path="*">
            {() => {
              window.location.href = '/onboarding/questions';
              return null;
            }}
          </Route>
        </Switch>
      );
    }

    // Questions answered but onboarding not complete → needs email verification
    if (needsEmailVerification) {
      return (
        <Switch>
          <Route path="/onboarding/verify" component={OnboardingVerification} />
          <Route path="*">
            {() => {
              window.location.href = '/onboarding/verify';
              return null;
            }}
          </Route>
        </Switch>
      );
    }
  }

  // This shouldn't normally be reached, but handles edge case
  if (needsEmailVerification) {
    return (
      <Switch>
        <Route path="/onboarding/verify" component={OnboardingVerification} />
        <Route path="*">
          {() => {
            window.location.href = '/onboarding/verify';
            return null;
          }}
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/settings" component={Settings} />
      <Route path="/upgrade" component={Upgrade} />
      <Route path="/billing" component={Billing} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/contact" component={ContactUs} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/logs" component={AdminLogs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Lightweight security protection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Only block right-click on non-interactive elements
      const target = e.target as HTMLElement;
      if (!target.closest('input, textarea, [contenteditable], button, a, [role="button"]')) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't block shortcuts in input fields
      if (target.matches('input, textarea, [contenteditable]')) {
        return;
      }
      
      // Only block developer tools shortcuts, not common user shortcuts
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        e.preventDefault();
      }
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Allow selection in input fields and editable content
      if (target.matches('input, textarea, [contenteditable], [role="textbox"]')) {
        return;
      }
      
      // Block selection on content areas only
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      
      // Only prevent dragging of images, not other elements
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <HomeButton />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
