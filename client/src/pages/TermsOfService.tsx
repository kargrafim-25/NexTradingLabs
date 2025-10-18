import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsOfService() {
  const [, setLocation] = useLocation();
  
  const handleClose = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 md:p-12 relative bg-card/50 backdrop-blur border-border shadow-xl">
          {/* Close Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 hover:bg-primary/10 z-10"
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="max-w-none [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-foreground/80 [&_li]:text-foreground/80 [&_strong]:text-foreground">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last Updated: October 2, 2025</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. ACCEPTANCE OF TERMS</h2>
              <p className="mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and NexTradingLabs ("Company," "we," "us," or "our"), governing your access to and use of our AI-powered trading platform and related services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms and all applicable laws and regulations.
              </p>
              <p className="font-semibold">IF YOU DO NOT AGREE TO THESE TERMS, DO NOT ACCESS OR USE THE SERVICE.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. COMPANY INFORMATION</h2>
              <p className="mb-4">
                NexTradingLabs is a proprietary trading platform providing AI-powered trading signals and analysis services. Our platform operates under cutting-edge artificial intelligence technology to deliver real-time market insights and trading recommendations.
              </p>
              <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg">
                <p className="font-semibold mb-2 text-foreground">Contact Information:</p>
                <p>Company: NexTradingLabs</p>
                <p>Website: www.nextradinglabs.com</p>
                <p>Email: support@nextradinglabs.com</p>
                <p>Address: n.9 av. tokyo rabat morocco</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. SERVICE DESCRIPTION</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Platform Services</h3>
              <p className="mb-4">Our Service provides:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Real-time trading signals powered by advanced AI technology</li>
                <li>Market analysis and insights</li>
                <li>TradingView chart integration</li>
                <li>Subscription-based access tiers</li>
                <li>Credit-based usage system</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Subscription Tiers</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li><strong>Free Tier:</strong> 2 daily signals, basic analysis (1.5-hour cooldown)</li>
                <li><strong>Starter Trader:</strong> 10 daily signals / 60 monthly, multiple take-profits, brief analysis (30-minute cooldown)</li>
                <li><strong>Pro Trader:</strong> Unlimited signals, detailed analysis, future predictions (15-minute cooldown)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. USER ACCOUNTS AND ELIGIBILITY</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Age Requirements</h3>
              <p className="mb-4">You must be at least 18 years old to use our Service. Users under 18 are strictly prohibited from accessing the platform.</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Account Registration</h3>
              <p className="mb-4">You must provide accurate, complete, and current information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Geographic Restrictions</h3>
              <p className="mb-4">Our Service may not be available in all jurisdictions. You are responsible for ensuring your use complies with local laws and regulations.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. INTELLECTUAL PROPERTY RIGHTS</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Company Ownership</h3>
              <p className="font-semibold mb-4">ALL INTELLECTUAL PROPERTY RIGHTS IN THE SERVICE ARE OWNED EXCLUSIVELY BY NEXTRADINGLABS. This includes but is not limited to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Proprietary AI algorithms and trading models</li>
                <li>Software code, architecture, and design</li>
                <li>Trading signals, analysis, and methodologies</li>
                <li>Platform interface, graphics, and content</li>
                <li>Company name, logos, and branding</li>
                <li>All data, analytics, and insights generated by our AI system</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Protection of Proprietary Technology</h3>
              <p className="font-semibold mb-4">USERS ARE STRICTLY PROHIBITED FROM:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Reverse engineering, decompiling, or attempting to derive our AI algorithms</li>
                <li>Copying, reproducing, or distributing our trading signals or analysis</li>
                <li>Creating derivative works based on our proprietary methods</li>
                <li>Using our intellectual property in competing platforms or services</li>
                <li>Disclosing, sharing, or publishing our proprietary information</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Trade Secrets Protection</h3>
              <p className="mb-4">Our AI technology, trading algorithms, and analytical methods constitute valuable trade secrets. Any unauthorized disclosure, use, or misappropriation of these trade secrets will result in immediate legal action for damages, injunctive relief, and all available remedies under law.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. DATA PROTECTION AND CONFIDENTIALITY</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Proprietary Information</h3>
              <p className="mb-4">All data, signals, analyses, and information provided through our Service constitute confidential and proprietary information of NexTradingLabs. Users acknowledge that this information:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Has commercial value due to its secrecy</li>
                <li>Is subject to reasonable efforts by NexTradingLabs to maintain confidentiality</li>
                <li>Must not be disclosed to third parties under any circumstances</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Prohibited Data Use</h3>
              <p className="font-semibold mb-4">USERS WHO MISUSE, DISCLOSE, OR PUBLISH OUR PROPRIETARY DATA WILL FACE IMMEDIATE LEGAL ACTION INCLUDING:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Claims for breach of confidentiality</li>
                <li>Trade secret misappropriation lawsuits</li>
                <li>Injunctive relief to prevent further misuse</li>
                <li>Monetary damages including lost profits and legal fees</li>
                <li>Criminal prosecution where applicable</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. PROHIBITED USES</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Unauthorized Activities</h3>
              <p className="mb-4">You may not:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Engage in market manipulation based on our signals</li>
                <li>Share account credentials or access with third parties</li>
                <li>Attempt to hack, reverse engineer, or compromise the platform</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Competitive Activities</h3>
              <p className="font-semibold mb-4">STRICTLY PROHIBITED:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Creating competing platforms using our methods or insights</li>
                <li>Redistributing our signals through other channels</li>
                <li>Copying our AI-generated content for commercial use</li>
                <li>Analyzing our algorithms for competitive intelligence</li>
                <li>Recruiting our users for competing services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. SUBSCRIPTION AND PAYMENT TERMS</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">8.1 Credit System</h3>
              <p className="mb-4">Our Service operates on a credit-based system with automatic daily/monthly resets based on your subscription tier. Credits cannot be transferred between users or refunded.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">8.2 Payment Terms</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>All fees are paid in advance</li>
                <li>Subscriptions auto-renew unless cancelled</li>
                <li>No refunds for unused credits or partial subscription periods</li>
                <li>We reserve the right to modify pricing with 30 days' notice</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">8.3 Market Hours</h3>
              <p className="mb-4">Our Service operates during market hours. Signal generation is restricted outside these hours.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">9. DISCLAIMERS AND RISK WARNINGS</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">9.1 AI-Generated Content Disclaimer</h3>
              <p className="mb-4">Our trading signals and analysis are generated by artificial intelligence technology. While we strive for accuracy, AI-generated content may contain errors, omissions, or inaccuracies. Users should not rely solely on our AI outputs for trading decisions.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">9.2 Financial Risk Warning</h3>
              <p className="mb-4 font-semibold">TRADING INVOLVES SUBSTANTIAL RISK OF LOSS. You should carefully consider your financial situation before trading. Past performance does not guarantee future results. Our signals are for informational purposes only and do not constitute financial advice.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">9.3 No Investment Advice</h3>
              <p className="mb-4">We are not licensed financial advisors. Our Service provides analysis and signals for informational purposes only. You should consult with qualified financial professionals before making investment decisions.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">10. LIMITATION OF LIABILITY</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">10.1 Maximum Liability</h3>
              <p className="mb-4 font-semibold">TO THE FULLEST EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">10.2 Excluded Damages</h3>
              <p className="font-semibold mb-4">WE SHALL NOT BE LIABLE FOR:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Indirect, incidental, special, or consequential damages</li>
                <li>Lost profits, trading losses, or missed opportunities</li>
                <li>Business interruption or loss of data</li>
                <li>Any damages resulting from use of our AI-generated content</li>
                <li>Technical failures, service interruptions, or system downtime</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">10.3 Service Availability</h3>
              <p className="mb-4">The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant uninterrupted or error-free operation.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">11. TERMINATION</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">11.1 Termination by Company</h3>
              <p className="mb-4">We may suspend or terminate your account immediately for:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Violation of these Terms</li>
                <li>Misuse of proprietary information</li>
                <li>Suspected intellectual property infringement</li>
                <li>Any unauthorized use of the Service</li>
                <li>At our sole discretion without cause</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">11.2 Termination by User</h3>
              <p className="mb-4">You may terminate your account at any time through account settings. Termination does not entitle you to refunds for unused subscription periods.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">11.3 Effects of Termination</h3>
              <p className="mb-4">Upon termination:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Your access to the Service ends immediately</li>
                <li>All licenses and rights granted to you terminate</li>
                <li>You must cease all use of our proprietary information</li>
                <li>Confidentiality obligations survive termination indefinitely</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">12. LEGAL ENFORCEMENT</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">12.1 Injunctive Relief</h3>
              <p className="mb-4">Given the proprietary nature of our technology and information, you acknowledge that any breach may cause irreparable harm for which monetary damages would be inadequate. We are entitled to seek immediate injunctive relief without posting bond.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">12.2 Legal Costs</h3>
              <p className="mb-4">In any legal action arising from these Terms, the prevailing party shall be entitled to recover reasonable attorneys' fees and costs.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">12.3 Jurisdiction and Governing Law</h3>
              <p className="mb-4">These Terms are governed by Moroccan law. Any disputes shall be resolved exclusively in the courts of Morocco.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">13. INDEMNIFICATION</h2>
              <p className="mb-4">You agree to indemnify, defend, and hold harmless NexTradingLabs from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your infringement of intellectual property rights</li>
                <li>Any unauthorized disclosure of our proprietary information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">14. MONITORING AND ENFORCEMENT</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">14.1 Platform Monitoring</h3>
              <p className="mb-4">We reserve the right to monitor user activity to detect violations of these Terms and protect our intellectual property.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">14.2 Investigation Rights</h3>
              <p className="mb-4">We may investigate suspected violations and cooperate with law enforcement authorities in pursuing legal remedies.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">15. MODIFICATIONS TO TERMS</h2>
              <p className="mb-4">We may modify these Terms at any time by posting updated terms on our platform. Continued use after modifications constitutes acceptance of the new Terms. Material changes will be communicated with reasonable notice.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">16. SEVERABILITY</h2>
              <p className="mb-4">If any provision of these Terms is found unenforceable, the remaining provisions shall continue in full force and effect.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">17. ENTIRE AGREEMENT</h2>
              <p className="mb-4">These Terms constitute the entire agreement between you and NexTradingLabs regarding the Service and supersede all prior agreements and understandings.</p>
            </section>

            <div className="bg-primary/10 border border-primary/30 p-6 rounded-lg mt-8">
              <p className="mb-4 text-foreground/90">
                By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. Violation of these Terms may result in immediate account termination and legal action.
              </p>
              <p className="text-sm text-muted-foreground">© 2025 NexTradingLabs. All rights reserved.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
