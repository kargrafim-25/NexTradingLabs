import { Card } from "@/components/ui/card";
import { X, Sparkles, Smartphone, MessageSquare, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Card className="mb-6 p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/30 relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="pr-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">Exciting Updates Coming Soon!</h3>
        </div>
        
        <div className="grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Smartphone className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Mobile App</p>
              <p>iOS & Android apps launching Q1 2025</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">AI Chat Analysis</p>
              <p>Ask questions about any signal</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Trade Portfolio</p>
              <p>Pro users: Track performance & stats</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
