import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Shield, Zap, Brain, LineChart, Clock } from "lucide-react";
import { useLocation } from "wouter";
import logoUrl from '../assets/logo.png';
import Footer from '@/components/Footer';

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation('/')}>
            <img src={logoUrl} alt="Next Trading Labs" className="h-10 w-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Next Trading Labs
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation('/')}>Home</Button>
            <Button variant="ghost" onClick={() => setLocation('/contact')}>Contact</Button>
            <Button onClick={() => setLocation('/login')}>Sign In</Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 pb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            About Next Trading Labs
          </h1>
          <p className="text-xl text-muted-foreground">
            Empowering traders with cutting-edge AI technology for smarter, 
            more confident trading decisions in the forex market.
          </p>
        </div>

        {/* Our Mission */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-3xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground space-y-4">
            <p>
              At Next Trading Labs, we believe that advanced trading technology should be accessible to everyone. 
              Our mission is to democratize professional-grade trading insights by combining artificial intelligence 
              with decades of trading expertise.
            </p>
            <p>
              We've built a platform that analyzes market data in real-time, identifies high-probability trading 
              opportunities, and delivers actionable signals with precision timing and risk management built in.
            </p>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Brain className="w-12 h-12 text-primary mb-4" />
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Our advanced machine learning models analyze multiple timeframes, technical indicators, 
                and market conditions to identify optimal entry points.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <LineChart className="w-12 h-12 text-accent mb-4" />
                <CardTitle>Signal Generation</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Every signal includes precise entry price, stop-loss, and multiple take-profit levels, 
                giving you complete control over your risk management.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-12 h-12 text-secondary mb-4" />
                <CardTitle>Real-Time Delivery</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Signals are generated and delivered instantly during market hours, ensuring you never miss 
                a trading opportunity.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Our Technology */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-3xl">Our Technology</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground space-y-4">
            <p>
              <strong>AI-Powered Engine:</strong> Built on GPT-4 architecture with custom training on historical 
              forex data, our AI engine understands market patterns, sentiment, and momentum like an experienced trader.
            </p>
            <p>
              <strong>Multi-Timeframe Analysis:</strong> We analyze 7 different timeframes (5M, 15M, 30M, 1H, 4H, 1D, 1W) 
              to ensure confluence across multiple perspectives before generating a signal.
            </p>
            <p>
              <strong>Risk Management:</strong> Every signal includes calculated stop-loss and take-profit levels based 
              on volatility, support/resistance, and optimal risk-reward ratios.
            </p>
            <p>
              <strong>24/5 Market Coverage:</strong> Our system monitors the forex market continuously during trading hours, 
              adapting to changing conditions in real-time.
            </p>
          </CardContent>
        </Card>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-primary mb-3" />
                <CardTitle>Proven Performance</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Our signals are backtested against years of historical data and continuously optimized 
                based on real-world performance.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-accent mb-3" />
                <CardTitle>Transparent Operation</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                We provide full transparency in our signal generation process and include detailed analysis 
                with every trade suggestion.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-secondary mb-3" />
                <CardTitle>Easy Integration</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Access signals through our web platform, mobile app, or integrate with your favorite 
                trading platforms via our API.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="w-10 h-10 text-primary mb-3" />
                <CardTitle>Continuous Learning</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Our AI models are continuously updated and refined based on market evolution and user feedback.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading Smarter?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of traders who trust Next Trading Labs for their forex signals.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = '/signup'}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation('/contact')}>
              Contact Us
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
