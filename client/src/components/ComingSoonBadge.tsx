import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface ComingSoonBadgeProps {
  variant?: "default" | "colorful";
  className?: string;
}

export function ComingSoonBadge({ variant = "default", className = "" }: ComingSoonBadgeProps) {
  if (variant === "colorful") {
    return (
      <Badge className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs ${className}`}>
        <Sparkles className="w-3 h-3 mr-1" />
        Coming Soon
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className={`text-xs ${className}`}>
      Coming Soon
    </Badge>
  );
}
