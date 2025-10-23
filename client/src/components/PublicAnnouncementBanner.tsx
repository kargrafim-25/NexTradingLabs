import { Card } from "@/components/ui/card";
import { Sparkles, Smartphone, MessageSquare, TrendingUp } from "lucide-react";

export function PublicAnnouncementBanner() {
  return (
    <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/30 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
          <h3 className="font-bold text-base md:text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Coming Soon in 2025
          </h3>
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
        </div>
        
        <div className="grid sm:grid-cols-3 gap-3 md:gap-6 text-xs md:text-sm">
          <div className="flex flex-col items-center text-center p-3 md:p-4 bg-background/50 rounded-lg border border-accent/20 hover:border-accent/40 transition-colors">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mb-2 md:mb-3">
              <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <p className="font-semibold text-foreground mb-1">Mobile Apps</p>
            <p className="text-muted-foreground text-xs">iOS & Android - Q1 2025</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-3 md:p-4 bg-background/50 rounded-lg border border-secondary/20 hover:border-secondary/40 transition-colors">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center mb-2 md:mb-3">
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <p className="font-semibold text-foreground mb-1">AI Chat Analysis</p>
            <p className="text-muted-foreground text-xs">Ask questions about signals</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-3 md:p-4 bg-background/50 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-2 md:mb-3">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <p className="font-semibold text-foreground mb-1">Trade Portfolio</p>
            <p className="text-muted-foreground text-xs">Track performance (Pro)</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
