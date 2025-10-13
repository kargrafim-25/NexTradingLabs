import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last Updated: October 2, 2025</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. INTRODUCTION</h2>
              <p className="mb-4">
                NexTradingLabs ("Company," "we," "us," or "our") is committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy explains how we collect, use, process, store, and protect your personal information when you use our AI-powered trading platform and related services (the "Service").
              </p>
              <p className="mb-4">
                This Privacy Policy complies with the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and other applicable data protection laws.
              </p>
              <p className="font-semibold">By using our Service, you consent to the data practices described in this Privacy Policy.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. COMPANY INFORMATION</h2>
              <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg">
                <p className="font-semibold mb-2 text-foreground">Data Controller:</p>
                <p>Company Name: NexTradingLabs</p>
                <p>Address: n.9 av. tokyo rabat morocco</p>
                <p>Email: support@nextradinglabs.com</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. INFORMATION WE COLLECT</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Personal Information You Provide</h3>
              <div className="mb-4">
                <p className="font-semibold mb-2">Account Information:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Full name and email address</li>
                  <li>Username and encrypted password</li>
                  <li>Phone number (optional)</li>
                  <li>Country/region of residence</li>
                </ul>

                <p className="font-semibold mb-2">Payment Information:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Billing name and address</li>
                  <li>Payment method details (processed securely by third-party payment processors)</li>
                  <li>Transaction history and subscription details</li>
                </ul>

                <p className="font-semibold mb-2">Profile Information:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Trading preferences and risk tolerance</li>
                  <li>Communication preferences</li>
                  <li>Profile picture (optional)</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Automatically Collected Information</h3>
              <div className="mb-4">
                <p className="font-semibold mb-2">Technical Data:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>IP address and device identifiers</li>
                  <li>Browser type and version</li>
                  <li>Operating system information</li>
                  <li>Access times and duration of use</li>
                  <li>Pages viewed and features accessed</li>
                  <li>Device location data (with consent)</li>
                </ul>

                <p className="font-semibold mb-2">Usage Analytics:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Platform interaction patterns</li>
                  <li>Signal viewing and response data</li>
                  <li>Credit usage patterns</li>
                  <li>Feature utilization statistics</li>
                  <li>Performance metrics and error logs</li>
                </ul>

                <p className="font-semibold mb-2">Cookies and Tracking Technologies:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Session cookies for platform functionality</li>
                  <li>Analytics cookies for service improvement</li>
                  <li>Preference cookies for user settings</li>
                  <li>Security cookies for fraud prevention</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Trading-Related Data</h3>
              <div className="mb-4">
                <p className="font-semibold mb-2">Market Interaction Data:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Signal requests and responses</li>
                  <li>Analysis viewing patterns</li>
                  <li>Platform usage during market hours</li>
                  <li>Subscription tier utilization</li>
                  <li>Credit consumption patterns</li>
                </ul>

                <p className="font-semibold mb-2">AI-Generated Insights:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Personalized trading recommendations</li>
                  <li>User behavior analysis</li>
                  <li>Platform optimization data</li>
                  <li>Custom preference profiles</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. LEGAL BASIS FOR PROCESSING (GDPR)</h2>
              <p className="mb-4">We process your personal data based on the following legal grounds:</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Contract Performance</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Account creation and management</li>
                <li>Service delivery and subscription management</li>
                <li>Payment processing and billing</li>
                <li>Customer support and communication</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Legitimate Interests</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Platform security and fraud prevention</li>
                <li>Service improvement and optimization</li>
                <li>Analytics and performance monitoring</li>
                <li>Direct marketing (with opt-out options)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Legal Compliance</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Regulatory reporting requirements</li>
                <li>Anti-money laundering (AML) compliance</li>
                <li>Tax obligations and record-keeping</li>
                <li>Law enforcement cooperation when required</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">4.4 Consent</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Marketing communications</li>
                <li>Optional data collection</li>
                <li>Cookies and tracking technologies</li>
                <li>Location data processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. HOW WE USE YOUR INFORMATION</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Service Provision</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Deliver AI-powered trading signals and analysis</li>
                <li>Process subscription payments and manage accounts</li>
                <li>Provide customer support and technical assistance</li>
                <li>Maintain platform security and prevent fraud</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Service Improvement</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Develop new features and services</li>
                <li>Optimize AI algorithms and trading models</li>
                <li>Conduct research and analytics for platform improvement</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Communication</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Send service-related notifications and updates</li>
                <li>Provide important account and security information</li>
                <li>Deliver marketing communications (with consent)</li>
                <li>Respond to customer inquiries and support requests</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">5.4 Legal and Security</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Comply with applicable laws and regulations</li>
                <li>Prevent fraud, abuse, and unauthorized access</li>
                <li>Protect intellectual property rights</li>
                <li>Maintain audit trails and security logs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. DATA SHARING AND DISCLOSURE</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Third-Party Service Providers</h3>
              <p className="mb-4">We may share your data with trusted third-party providers for:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Payment processing (encrypted payment data only)</li>
                <li>Cloud hosting and data storage</li>
                <li>Analytics and performance monitoring</li>
                <li>Customer support tools</li>
                <li>Email and communication services</li>
              </ul>
              <p className="mb-4">All third-party providers are contractually required to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Protect your data with appropriate security measures</li>
                <li>Process data only for specified purposes</li>
                <li>Comply with applicable data protection laws</li>
                <li>Delete or return data upon contract termination</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Legal Requirements</h3>
              <p className="mb-4">We may disclose your information when required by law:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Court orders and legal subpoenas</li>
                <li>Regulatory investigations and compliance</li>
                <li>Law enforcement requests (with proper authorization)</li>
                <li>Protection of our legal rights and interests</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Business Transfers</h3>
              <p className="mb-4">In case of merger, acquisition, or business transfer, your data may be transferred to the new entity, subject to the same privacy protections.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">6.4 No Sale of Personal Data</h3>
              <p className="font-semibold mb-4">WE DO NOT SELL, RENT, OR TRADE YOUR PERSONAL INFORMATION TO THIRD PARTIES FOR MARKETING PURPOSES OR ANY OTHER PURPOSES.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. DATA PROTECTION AND SECURITY</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Security Measures</h3>
              <p className="mb-4">We implement industry-standard security measures:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Encryption:</strong> End-to-end encryption for data transmission and storage</li>
                <li><strong>Access Controls:</strong> Multi-factor authentication and role-based access</li>
                <li><strong>Network Security:</strong> Firewalls, intrusion detection, and monitoring</li>
                <li><strong>Data Backup:</strong> Secure, encrypted backup systems</li>
                <li><strong>Security Audits:</strong> Regular security assessments and penetration testing</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Data Breach Response</h3>
              <p className="mb-4">In case of a data breach:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>We will assess the impact and contain the breach immediately</li>
                <li>Affected users will be notified within 72 hours if required by law</li>
                <li>Regulatory authorities will be notified as required</li>
                <li>We will provide support and remediation measures</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Employee Training</h3>
              <p className="mb-4">All employees undergo data protection training and sign confidentiality agreements.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. DATA RETENTION</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">8.1 Retention Periods</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Account Data:</strong> Retained while your account is active plus 7 years for legal compliance</li>
                <li><strong>Payment Data:</strong> Retained for 7 years for tax and accounting purposes</li>
                <li><strong>Usage Analytics:</strong> Retained for 2 years for service improvement</li>
                <li><strong>Communication Records:</strong> Retained for 3 years for support purposes</li>
                <li><strong>Security Logs:</strong> Retained for 1 year for security monitoring</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">8.2 Data Deletion</h3>
              <p className="mb-4">We automatically delete personal data when retention periods expire, unless longer retention is required by law.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">9. YOUR RIGHTS (GDPR AND OTHER LAWS)</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">9.1 Access Rights</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Request copies of your personal data</li>
                <li>Understand how your data is processed</li>
                <li>Receive data in a structured, machine-readable format</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">9.2 Correction Rights</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Correct inaccurate personal information</li>
                <li>Complete incomplete data records</li>
                <li>Update outdated information</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">9.3 Deletion Rights ("Right to be Forgotten")</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Request deletion of your personal data</li>
                <li>Exercise this right when data is no longer necessary</li>
                <li>Subject to legal retention requirements</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">9.4 Restriction Rights</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Limit how we process your data</li>
                <li>Object to certain types of processing</li>
                <li>Restrict processing during disputes</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">9.5 Portability Rights</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Receive your data in a portable format</li>
                <li>Transfer data to another service provider</li>
                <li>Applies to data processed by automated means</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">9.6 Objection Rights</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Object to direct marketing (absolute right)</li>
                <li>Object to legitimate interest processing</li>
                <li>Object to automated decision-making</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">10. AUTOMATED DECISION-MAKING AND AI</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">10.1 AI Processing</h3>
              <p className="mb-4">Our platform uses artificial intelligence to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Generate trading signals and market analysis</li>
                <li>Personalize user experience and recommendations</li>
                <li>Detect fraud and suspicious activities</li>
                <li>Optimize platform performance</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">10.2 Your Rights</h3>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Not be subject to solely automated decision-making</li>
                <li>Request human review of automated decisions</li>
                <li>Challenge automated decisions that significantly affect you</li>
                <li>Understand the logic behind automated processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">11. INTERNATIONAL DATA TRANSFERS</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">11.1 Cross-Border Transfers</h3>
              <p className="mb-4">If we transfer your data outside your jurisdiction, we ensure adequate protection through:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Adequacy Decisions:</strong> Transfers to countries with adequate protection levels</li>
                <li><strong>Standard Contractual Clauses:</strong> EU-approved contract terms</li>
                <li><strong>Binding Corporate Rules:</strong> Internal data protection standards</li>
                <li><strong>Consent:</strong> Your explicit consent for specific transfers</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">11.2 Data Location</h3>
              <p className="mb-4">Your data is primarily processed and stored in secure data centers. We may use global cloud services with appropriate safeguards.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">12. COOKIES AND TRACKING</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">12.1 Types of Cookies</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Track usage for service improvement</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and choices</li>
                <li><strong>Marketing Cookies:</strong> Deliver relevant advertisements (with consent)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">12.2 Cookie Consent</h3>
              <p className="mb-4">You can manage cookie preferences through:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Browser settings and controls</li>
                <li>Our cookie consent banner</li>
                <li>Account privacy settings</li>
                <li>Third-party opt-out tools</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">12.3 Do Not Track</h3>
              <p className="mb-4">We respect browser "Do Not Track" signals and provide opt-out mechanisms for tracking.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">13. CHILDREN'S PRIVACY</h2>
              <p className="mb-4">Our Service is not intended for users under 18 years old. We do not knowingly collect personal information from children. If we discover we have collected data from a child, we will delete it immediately and terminate the account.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">14. CALIFORNIA PRIVACY RIGHTS (CCPA/CPRA)</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">14.1 California Consumer Rights</h3>
              <p className="mb-4">California residents have additional rights:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Right to Know:</strong> Categories and sources of personal information collected</li>
                <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt out of the sale of personal information (we don't sell data)</li>
                <li><strong>Right to Non-Discrimination:</strong> Not be discriminated against for exercising rights</li>
                <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">14.2 Sensitive Personal Information</h3>
              <p className="mb-4">We may collect sensitive personal information for account security and fraud prevention. You can limit the use of sensitive data by contacting us.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">15. EXERCISING YOUR RIGHTS</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">15.1 How to Contact Us</h3>
              <p className="mb-4">To exercise your privacy rights, contact us:</p>
              <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg mb-4">
                <p>Email: support@nextradinglabs.com</p>
                <p>Online Form: Available on our website under Contact Us section</p>
                <p>Mail: n.9 av. tokyo rabat morocco</p>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">15.2 Response Timeframes</h3>
              <p className="mb-4">We will respond to your requests:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Initial Response:</strong> Within 1 month (GDPR) or 45 days (CCPA)</li>
                <li><strong>Complex Requests:</strong> May require additional time with notification</li>
                <li><strong>Identity Verification:</strong> Required for security purposes</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">15.3 No Fees</h3>
              <p className="mb-4">We do not charge fees for exercising your privacy rights unless requests are excessive or unfounded.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">16. SUPERVISORY AUTHORITY</h2>
              <p className="mb-4">If you are not satisfied with our handling of your personal data, you have the right to lodge a complaint with your local data protection authority:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>EU Residents:</strong> Contact your national data protection authority</li>
                <li><strong>California Residents:</strong> California Attorney General's Office</li>
                <li><strong>Other Jurisdictions:</strong> Contact your local privacy regulator</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">17. PRIVACY POLICY UPDATES</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">17.1 Policy Changes</h3>
              <p className="mb-4">We may update this Privacy Policy to reflect:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Changes in applicable laws and regulations</li>
                <li>New features and services</li>
                <li>Improved data protection practices</li>
                <li>User feedback and requests</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">17.2 Notification of Changes</h3>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Material Changes:</strong> 30 days' advance notice via email and platform notification</li>
                <li><strong>Minor Updates:</strong> Notice on our website and platform</li>
                <li><strong>Continued Use:</strong> Constitutes acceptance of updated terms</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">17.3 Version History</h3>
              <p className="mb-4">Previous versions of this Privacy Policy are available upon request.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">18. DATA PROTECTION OFFICER</h2>
              <p className="mb-4">If applicable in your jurisdiction, you may contact our Data Protection Officer. We provide you with our Data protection officer upon request.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">19. CONTACT INFORMATION</h2>
              <p className="mb-4">For privacy-related questions, concerns, or requests:</p>
              <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg mb-4">
                <p className="font-semibold text-foreground">NexTradingLabs Privacy Team</p>
                <p>Email: support@nextradinglabs.com</p>
                <p>Address: n.9 av. tokyo rabat morocco</p>
                <p>Response Time: Within 48 hours for initial acknowledgment</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mt-8 mb-4">20. EFFECTIVE DATE</h2>
              <p className="mb-4">This Privacy Policy is effective as of October 2, 2025, and applies to all personal data collected from that date forward.</p>
            </section>

            <div className="bg-primary/10 border border-primary/30 p-6 rounded-lg mt-8">
              <p className="mb-4 text-foreground/90">
                By using our Service, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and processing of your personal information as described herein.
              </p>
              <p className="text-sm text-muted-foreground">© 2025 NexTradingLabs. All rights reserved.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
