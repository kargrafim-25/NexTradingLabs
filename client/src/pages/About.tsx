import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Shield, Zap, Brain, LineChart, Clock, Target, Award, Users, CheckCircle2, Play } from "lucide-react";
import { useLocation } from "wouter";
import logoUrl from '../assets/logo.png';
import Footer from '@/components/Footer';
import { Badge } from "@/components/ui/badge";

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
          <p className="text-xl text-muted-foreground mb-8">
            Institutional-grade AI trading intelligence, democratized for retail traders. 
            21+ years of combined expertise meets cutting-edge technology.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Badge variant="outline" className="text-base py-2 px-4">
              <Target className="w-4 h-4 mr-2" />
              80.1% Win Rate
            </Badge>
            <Badge variant="outline" className="text-base py-2 px-4">
              <Award className="w-4 h-4 mr-2" />
              14,280+ Tested Trades
            </Badge>
            <Badge variant="outline" className="text-base py-2 px-4">
              <Users className="w-4 h-4 mr-2" />
              24 Months Validated
            </Badge>
          </div>
        </div>

        {/* Our Story */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-3xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground space-y-4">
            <p>
              Next Trading Labs was founded by three seasoned trading professionals with over 21 years of 
              combined institutional-grade trading experience. Our founding team emerged from diverse backgrounds 
              within the financial markets ecosystem—spanning proprietary trading desks, quantitative research 
              divisions, and algorithmic trading development.
            </p>
            <p>
              We believe that transparency in performance metrics and methodology far outweighs personal branding. 
              Our commitment is to let our technology and results speak for themselves. This approach allows us to 
              focus entirely on product excellence and client success while maintaining the strategic flexibility 
              essential for navigating dynamic market conditions.
            </p>
            <p>
              Our collaborative expertise spans market microstructure analysis, algorithmic strategy development, 
              risk management systems, and real-time data processing. This comprehensive foundation enables us to 
              create trading solutions that bridge the gap between institutional-level sophistication and retail accessibility.
            </p>
          </CardContent>
        </Card>

        {/* Mission & Specialization */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3">
              <p>
                We harness cutting-edge artificial intelligence to deliver institutional-quality trading signals 
                that consistently outperform traditional market analysis methods.
              </p>
              <div className="space-y-2 mt-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Data-driven decisions over market speculation</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Transparent performance reporting</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Continuous algorithm improvement</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Ethical AI with human oversight</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Core Specialization</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3">
              <p className="font-semibold text-foreground">Primary Focus:</p>
              <p>XAUUSD (Gold/USD) market analysis and signal generation with 81.3% success rate across 9,840+ trades.</p>
              
              <p className="font-semibold text-foreground mt-4">Secondary Expertise:</p>
              <p>Bitcoin trading strategy development with 77.6% success rate across 4,440+ trades.</p>
              
              <p className="font-semibold text-foreground mt-4">Coming Soon:</p>
              <p>EUR/USD, GBP/USD, and crude oil markets expansion planned.</p>
            </CardContent>
          </Card>
        </div>

        {/* How to Use Platform - Video Section */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <Play className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl">How to Use Our Platform</CardTitle>
            <p className="text-muted-foreground mt-2">
              Watch this quick tutorial to get started with Next Trading Labs
            </p>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              {/* Placeholder for video - replace with actual video embed */}
              <div className="text-center">
                <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Video tutorial coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Learn how to generate signals, manage risk, and maximize your trading success
                </p>
              </div>
              {/* When ready, replace above div with:
              <iframe 
                width="100%" 
                height="100%" 
                src="YOUR_VIDEO_URL" 
                title="Platform Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
              */}
            </div>
          </CardContent>
        </Card>

        {/* Our Technology */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Our Technology</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            A sophisticated multi-layer AI architecture combining institutional-grade quantitative methods 
            with next-generation machine learning capabilities.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <Brain className="w-10 h-10 text-primary mb-3" />
                <CardTitle>NLP Engine</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Processes real-time market sentiment from financial news, social media, central bank 
                communications, and economic research to enhance technical analysis.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <LineChart className="w-10 h-10 text-accent mb-3" />
                <CardTitle>Pattern Recognition</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Advanced neural networks identify complex price patterns, support/resistance levels, 
                and market structures invisible to traditional analysis.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-secondary mb-3" />
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Integrated algorithms evaluate trades across volatility, correlation, and maximum 
                drawdown to ensure comprehensive risk-reward evaluation.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-10 h-10 text-primary mb-3" />
                <CardTitle>Real-Time Processing</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Cloud-based infrastructure enables millisecond-level market analysis and signal 
                generation for timely opportunity capture.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="w-10 h-10 text-accent mb-3" />
                <CardTitle>Multi-Layer Validation</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Every signal undergoes historical pattern matching, risk calculation, market condition 
                assessment, and human expert review.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-secondary mb-3" />
                <CardTitle>Continuous Learning</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Feedback loops analyze signal outcomes to refine algorithms, ensuring evolution with 
                changing market conditions.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Track Record */}
        <Card className="mb-12 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Proven Track Record</CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              24 months of rigorous testing across diverse market conditions
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">80.1%</div>
                <div className="text-muted-foreground">Overall Win Rate</div>
                <div className="text-sm text-muted-foreground mt-1">14,280 trades</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">1:2.3</div>
                <div className="text-muted-foreground">Risk-Reward Ratio</div>
                <div className="text-sm text-muted-foreground mt-1">Average per trade</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">2.84</div>
                <div className="text-muted-foreground">Sharpe Ratio</div>
                <div className="text-sm text-muted-foreground mt-1">Risk-adjusted</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">22/24</div>
                <div className="text-muted-foreground">Profitable Months</div>
                <div className="text-sm text-muted-foreground mt-1">91.7% consistency</div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <h4 className="font-semibold text-lg mb-4">Performance by Market Condition:</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <div className="font-semibold mb-2">Trending Markets</div>
                  <div className="text-3xl font-bold text-primary">83.4%</div>
                  <div className="text-sm text-muted-foreground">7,890 trades</div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <div className="font-semibold mb-2">Ranging Markets</div>
                  <div className="text-3xl font-bold text-accent">75.8%</div>
                  <div className="text-sm text-muted-foreground">4,210 trades</div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <div className="font-semibold mb-2">High Volatility</div>
                  <div className="text-3xl font-bold text-secondary">78.2%</div>
                  <div className="text-sm text-muted-foreground">2,180 trades</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sources & Quality */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-3xl">Data Integration & Quality Assurance</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Data Sources:</h4>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Real-time market data from multiple tier-1 providers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Economic calendar integration with impact assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Central bank policy tracking and analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Historical data spanning over 15 years for model training</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <h4 className="font-semibold text-foreground mb-2">Quality Validation:</h4>
              <p>Every signal undergoes rigorous multi-layer validation including historical pattern matching, 
              risk-adjusted return calculation, market condition appropriateness filtering, and human expert review 
              for contextual validation.</p>
            </div>
          </CardContent>
        </Card>

        {/* Important Disclaimers */}
        <Card className="mb-12 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-500" />
              Important Risk Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>
              <strong className="text-foreground">Past Performance Notice:</strong> Historical testing results 
              do not guarantee future performance. Trading in financial markets involves substantial risk of loss 
              and is not suitable for all investors.
            </p>
            <p>
              <strong className="text-foreground">Market Risk:</strong> The leveraged nature of forex trading 
              means small market movements can result in significant gains or losses. All trading involves risk, 
              and losses can exceed initial deposits.
            </p>
            <p>
              <strong className="text-foreground">Realistic Expectations:</strong> Based on our 24-month testing, 
              expect win rates between 65-85%, monthly returns from 2-25%, and normal drawdown periods of 5-15%.
            </p>
            <p>
              <strong className="text-foreground">Required Understanding:</strong> Successful trading requires 
              adequate capitalization, strict risk management, patience, discipline, and acceptance that losses 
              are inevitable.
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading Smarter?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join traders who trust Next Trading Labs for institutional-grade forex signals.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
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
