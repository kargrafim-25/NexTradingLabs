import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function HomeButton() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const handleHomeClick = () => {
    if (isAuthenticated) {
      setLocation('/');
    } else {
      setLocation('/');
    }
  };

  // Don't show on landing page itself
  if (location === '/') {
    return null;
  }

  return (
    <Button
      onClick={handleHomeClick}
      size="icon"
      className="fixed top-4 left-4 z-50 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:scale-110 transition-all duration-300"
      title="Go to Home"
    >
      <Home className="h-5 w-5" />
    </Button>
  );
}
