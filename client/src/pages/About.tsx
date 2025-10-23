import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TrendingUp, Shield, Zap, Brain, LineChart, Clock, Target, Award, Users, CheckCircle2, Play, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import logoUrl from '../assets/logo.png';
import Footer from '@/components/Footer';
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function About() {
  const [, setLocation] = useLocation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    story: true,
    mission: false,
    specialization: false,
    tech: false,
    data: false,
    risk: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simplified Header - Only buttons */}
      <header className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 bg-background/95">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo - click to go home */}
          <div className="cursor-pointer flex items-center gap-2" onClick={() => setLocation('/')}>
            <img src={logoUrl} alt="Next Trading Labs" className="h-10 w-10" />
            <span className="hidden sm:inline text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              NTL
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center gap-2 md:gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/contact')} 
              className="text-xs sm:text-sm md:size-default"
            >
              Contact
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation('/login')} 
              className="text-xs sm:text-sm md:size-default"
            >
              Sign In
            </Button>
            <Button 
              size="sm" 
              onClick={() => window.location.href = '/signup'} 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-xs sm:text-sm md:size-default"
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Hero Section with Clickable Stats */}
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 pb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            About Next Trading Labs
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 px-4">
            Institutional-grade AI trading intelligence, democratized for retail traders. 
            21+ years of combined expertise meets cutting-edge technology.
          </p>
          
          {/* Clickable Stat Badges - Colorful */}
          <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center flex-wrap px-2">
            <Badge 
              className="text-xs sm:text-sm md:text-base py-2 px-3 md:px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-80 cursor-pointer transition-all shadow-lg hover:shadow-xl hover:scale-105"
              onClick={() => scrollToSection('performance')}
            >
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              80.1% Win Rate
            </Badge>
            <Badge 
              className="text-xs sm:text-sm md:text-base py-2 px-3 md:px-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:opacity-80 cursor-pointer transition-all shadow-lg hover:shadow-xl hover:scale-105"
              onClick={() => scrollToSection('performance')}
            >
              <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              14,280+ Trades
            </Badge>
            <Badge 
              className="text-xs sm:text-sm md:text-base py-2 px-3 md:px-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:opacity-80 cursor-pointer transition-all shadow-lg hover:shadow-xl hover:scale-105"
              onClick={() => scrollToSection('performance')}
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              24 Months
            </Badge>
          </div>
        </div>

        {/* Video Section - First! */}
        <Card className="mb-6 md:mb-12 border-2 border-primary/30 shadow-2xl bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
              <Play className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl">How to Use Our Platform</CardTitle>
            <p className="text-muted-foreground mt-2 text-xs sm:text-sm md:text-base px-4">
              Watch this quick tutorial to get started with Next Trading Labs
            </p>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-lg flex items-center justify-center border-2 border-primary/20">
              {/* Placeholder for video */}
              <div className="text-center p-4">
                <Play className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground font-medium text-sm md:text-base">Video tutorial coming soon</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Learn how to generate signals, manage risk, and maximize your trading success
                </p>
              </div>
              {/* Replace with actual video embed when ready:
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

        {/* Collapsible Our Story - Mobile Responsive */}
        <Collapsible open={openSections.story} onOpenChange={() => toggleSection('story')} className="mb-4 md:mb-6">
          <Card className="border-l-4 border-l-primary shadow-lg hover:shadow-xl transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-primary/5 transition-colors">
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-left">Our Story</CardTitle>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.story ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="text-sm md:text-base text-muted-foreground space-y-3 md:space-y-4 pt-0">
                <p>
                  Next Trading Labs was founded by three seasoned trading professionals with over 21 years of 
                  combined institutional-grade trading experience. Our founding team emerged from diverse backgrounds 
                  within the financial markets ecosystem—spanning proprietary trading desks, quantitative research 
                  divisions, and algorithmic trading development.
                </p>
                <p>
                  We believe that transparency in performance metrics and methodology far outweighs personal branding. 
                  Our commitment is to let our technology and results speak for themselves. This approach allows us to 
                  focus entirely on product excellence and client success.
                </p>
                <p>
                  Our collaborative expertise spans market microstructure analysis, algorithmic strategy development, 
                  risk management systems, and real-time data processing.
                </p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Collapsible Mission & Specialization */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <Collapsible open={openSections.mission} onOpenChange={() => toggleSection('mission')}>
            <Card className="border-l-4 border-l-accent h-full shadow-lg hover:shadow-xl transition-shadow">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-accent/5 transition-colors">
                  <CardTitle className="text-base sm:text-lg md:text-xl text-left">Our Mission</CardTitle>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.mission ? 'rotate-180' : ''}`} />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="text-xs sm:text-sm md:text-base text-muted-foreground space-y-2 md:space-y-3 pt-0">
                  <p>
                    We harness cutting-edge AI to deliver institutional-quality trading signals that consistently 
                    outperform traditional market analysis methods.
                  </p>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-start gap-2 text-xs md:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Data-driven decisions over speculation</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs md:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Transparent performance reporting</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs md:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Continuous algorithm improvement</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs md:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Ethical AI with human oversight</span>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={openSections.specialization} onOpenChange={() => toggleSection('specialization')}>
            <Card className="border-l-4 border-l-secondary h-full shadow-lg hover:shadow-xl transition-shadow">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-secondary/5 transition-colors">
                  <CardTitle className="text-base sm:text-lg md:text-xl text-left">Core Specialization</CardTitle>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.specialization ? 'rotate-180' : ''}`} />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="text-xs sm:text-sm md:text-base text-muted-foreground space-y-2 md:space-y-3 pt-0">
                  <div>
                    <p className="font-semibold text-foreground text-xs sm:text-sm md:text-base">Primary Focus:</p>
                    <p className="text-xs md:text-sm">XAUUSD (Gold/USD) with 81.3% success rate across 9,840+ trades</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-xs sm:text-sm md:text-base">Secondary Expertise:</p>
                    <p className="text-xs md:text-sm">Bitcoin trading with 77.6% success rate across 4,440+ trades</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-xs sm:text-sm md:text-base">Coming Soon:</p>
                    <p className="text-xs md:text-sm">EUR/USD, GBP/USD, and crude oil markets</p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Collapsible Technology */}
        <Collapsible open={openSections.tech} onOpenChange={() => toggleSection('tech')} className="mb-4 md:mb-6">
          <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-primary/5 transition-colors">
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-left">Our Technology</CardTitle>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.tech ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                  A sophisticated multi-layer AI architecture combining institutional-grade quantitative methods 
                  with next-generation machine learning capabilities.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div className="p-3 md:p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-colors">
                    <Brain className="w-8 h-8 md:w-10 md:h-10 text-primary mb-2" />
                    <h4 className="font-semibold text-xs sm:text-sm md:text-base mb-2">NLP Engine</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Real-time market sentiment analysis from news and social media
                    </p>
                  </div>

                  <div className="p-3 md:p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 hover:border-accent/40 transition-colors">
                    <LineChart className="w-8 h-8 md:w-10 md:h-10 text-accent mb-2" />
                    <h4 className="font-semibold text-xs sm:text-sm md:text-base mb-2">Pattern Recognition</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Advanced neural networks identify complex price patterns
                    </p>
                  </div>

                  <div className="p-3 md:p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 hover:border-secondary/40 transition-colors">
                    <Shield className="w-8 h-8 md:w-10 md:h-10 text-secondary mb-2" />
                    <h4 className="font-semibold text-xs sm:text-sm md:text-base mb-2">Risk Assessment</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Comprehensive volatility and risk-reward evaluation
                    </p>
                  </div>

                  <div className="p-3 md:p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-colors">
                    <Clock className="w-8 h-8 md:w-10 md:h-10 text-green-500 mb-2" />
                    <h4 className="font-semibold text-xs sm:text-sm md:text-base mb-2">Real-Time Processing</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Millisecond-level market analysis and signal generation
                    </p>
                  </div>

                  <div className="p-3 md:p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                    <Target className="w-8 h-8 md:w-10 md:h-10 text-blue-500 mb-2" />
                    <h4 className="font-semibold text-xs sm:text-sm md:text-base mb-2">Multi-Layer Validation</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Historical matching with human expert review
                    </p>
                  </div>

                  <div className="p-3 md:p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                    <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-purple-500 mb-2" />
                    <h4 className="font-semibold text-xs sm:text-sm md:text-base mb-2">Continuous Learning</h4>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Adaptive algorithms evolving with market conditions
                    </p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Performance Track Record - Scrollable anchor */}
        <div id="performance" className="scroll-mt-20">
          <Card className="mb-6 md:mb-12 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-2 border-primary/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center">Proven Track Record</CardTitle>
              <p className="text-center text-muted-foreground mt-2 text-xs sm:text-sm md:text-base">
                24 months of rigorous testing across diverse market conditions
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <div className="text-center p-3 md:p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/10 border border-green-500/30 hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-1 md:mb-2">80.1%</div>
                  <div className="text-muted-foreground text-xs md:text-sm font-medium">Overall Win Rate</div>
                  <div className="text-xs text-muted-foreground mt-1">14,280 trades</div>
                </div>
                <div className="text-center p-3 md:p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border border-blue-500/30 hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1 md:mb-2">1:2.3</div>
                  <div className="text-muted-foreground text-xs md:text-sm font-medium">Risk-Reward</div>
                  <div className="text-xs text-muted-foreground mt-1">Average</div>
                </div>
                <div className="text-center p-3 md:p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-600/10 border border-purple-500/30 hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1 md:mb-2">2.84</div>
                  <div className="text-muted-foreground text-xs md:text-sm font-medium">Sharpe Ratio</div>
                  <div className="text-xs text-muted-foreground mt-1">Risk-adjusted</div>
                </div>
                <div className="text-center p-3 md:p-4 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-600/10 border border-orange-500/30 hover:scale-105 transition-transform">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600 mb-1 md:mb-2">22/24</div>
                  <div className="text-muted-foreground text-xs md:text-sm font-medium">Profitable</div>
                  <div className="text-xs text-muted-foreground mt-1">91.7% months</div>
                </div>
              </div>

              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border">
                <h4 className="font-semibold text-sm sm:text-base md:text-lg mb-3 md:mb-4">Performance by Market Condition:</h4>
                <div className="grid sm:grid-cols-3 gap-3 md:gap-4">
                  <div className="p-3 md:p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors">
                    <div className="font-semibold text-xs sm:text-sm md:text-base mb-2">Trending Markets</div>
                    <div className="text-2xl sm:text-3xl font-bold text-primary">83.4%</div>
                    <div className="text-xs text-muted-foreground">7,890 trades</div>
                  </div>
                  <div className="p-3 md:p-4 bg-background rounded-lg border border-border hover:border-accent transition-colors">
                    <div className="font-semibold text-xs sm:text-sm md:text-base mb-2">Ranging Markets</div>
                    <div className="text-2xl sm:text-3xl font-bold text-accent">75.8%</div>
                    <div className="text-xs text-muted-foreground">4,210 trades</div>
                  </div>
                  <div className="p-3 md:p-4 bg-background rounded-lg border border-border hover:border-secondary transition-colors">
                    <div className="font-semibold text-xs sm:text-sm md:text-base mb-2">High Volatility</div>
                    <div className="text-2xl sm:text-3xl font-bold text-secondary">78.2%</div>
                    <div className="text-xs text-muted-foreground">2,180 trades</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collapsible Data Sources */}
        <Collapsible open={openSections.data} onOpenChange={() => toggleSection('data')} className="mb-4 md:mb-6">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-blue-500/5 transition-colors">
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-left">Data Integration & Quality</CardTitle>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.data ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="text-xs sm:text-sm md:text-base text-muted-foreground space-y-3 md:space-y-4 pt-0">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-xs sm:text-sm md:text-base">Data Sources:</h4>
                  <ul className="space-y-2 ml-2">
                    <li className="flex items-start gap-2 text-xs md:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Real-time market data from multiple tier-1 providers</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs md:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Economic calendar integration with impact assessment</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs md:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Central bank policy tracking and analysis</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs md:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Historical data spanning over 15 years for model training</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <h4 className="font-semibold text-foreground mb-2 text-xs sm:text-sm md:text-base">Quality Validation:</h4>
                  <p className="text-xs md:text-sm">
                    Every signal undergoes rigorous multi-layer validation including historical pattern matching, 
                    risk-adjusted return calculation, market condition appropriateness filtering, and human expert review.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Risk Disclosure - Collapsible */}
        <Collapsible open={openSections.risk} onOpenChange={() => toggleSection('risk')} className="mb-6 md:mb-8">
          <Card className="border-2 border-amber-500/50 bg-amber-500/5 shadow-lg hover:shadow-xl transition-shadow">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-amber-500/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-500" />
                  <CardTitle className="text-base sm:text-lg md:text-xl text-left">Important Risk Disclosure</CardTitle>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSections.risk ? 'rotate-180' : ''}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="text-xs md:text-sm text-muted-foreground space-y-2 md:space-y-3 pt-0">
                <p>
                  <strong className="text-foreground">Past Performance Notice:</strong> Historical testing results 
                  do not guarantee future performance. Trading involves substantial risk of loss.
                </p>
                <p>
                  <strong className="text-foreground">Market Risk:</strong> Leveraged trading means small market 
                  movements can result in significant gains or losses.
                </p>
                <p>
                  <strong className="text-foreground">Realistic Expectations:</strong> Expect win rates between 65-85%, 
                  monthly returns from 2-25%, and normal drawdown periods of 5-15%.
                </p>
                <p>
                  <strong className="text-foreground">Required Understanding:</strong> Successful trading requires 
                  adequate capitalization, strict risk management, patience, and discipline.
                </p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-lg p-6 md:p-12 border-2 border-primary/30 shadow-xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to Start Trading Smarter?</h2>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground mb-4 md:mb-8">
            Join traders who trust Next Trading Labs for institutional-grade signals.
          </p>
          <div className="flex gap-3 md:gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/signup'} 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm sm:text-base"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setLocation('/contact')}
              className="hover:bg-primary/10 hover:scale-105 transition-all text-sm sm:text-base"
            >
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
