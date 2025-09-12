import LegalPageLayout from "@/components/legal-page-layout";

export default function TermsOfService() {
  return (
    <LegalPageLayout 
      title="Terms of Service" 
      lastUpdated="Effective Date: January 1, 2025 | Last Updated: August 4, 2025"
    >
      <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">1. Agreement to Terms</h2>
              <p>
                By accessing or using ai-jobhunter.com ("Service"), operated by Ashutosh Lath ("we," "us," or "our"), 
                you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, 
                you do not have permission to access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">2. Description of Service</h2>
              <p className="mb-3">ai-jobhunter.com provides:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Automated job search and scraping from LinkedIn</li>
                <li>AI-powered personalized email generation for job applications</li>
                <li>Gmail integration for sending applications</li>
                <li>Resume storage and management</li>
                <li>Application tracking and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">3. Account Terms</h2>
              <div className="space-y-3">
                <p><strong>3.1 Registration:</strong> You must provide accurate and complete information during registration.</p>
                <p><strong>3.2 Security:</strong> You are responsible for maintaining the security of your account and password.</p>
                <p><strong>3.3 Responsibility:</strong> You are responsible for all activities that occur under your account.</p>
                <p><strong>3.4 Age Requirement:</strong> You must be at least 18 years old to use this Service.</p>
                <p><strong>3.5 One Account:</strong> Each user may maintain only one active account.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">4. Acceptable Use</h2>
              <p className="mb-3">You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Harass, abuse, or harm another person or entity</li>
                <li>Submit false or misleading information</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Use automated scripts to collect information or interact with the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Violate LinkedIn's or any third-party platform's terms of service</li>
                <li>Use the Service for spam or unsolicited communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">5. Content and Intellectual Property</h2>
              <div className="space-y-3">
                <p><strong>5.1 Your Content:</strong> You retain all rights to your resume, personal information, and other content you upload.</p>
                <p><strong>5.2 License to Us:</strong> You grant us a limited license to use your content solely to provide the Service.</p>
                <p><strong>5.3 Our Property:</strong> The Service, including its design, features, and content, is owned by us and protected by intellectual property laws.</p>
                <p><strong>5.4 Feedback:</strong> Any feedback you provide may be used by us without obligation to you.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">6. Third-Party Services</h2>
              <p className="mb-3">Our Service integrates with third-party services:</p>
              <div className="space-y-3">
                <p><strong>6.1 Google/Gmail:</strong> Subject to Google's Terms of Service</p>
                <p><strong>6.2 LinkedIn Data:</strong> We access publicly available data in compliance with applicable laws</p>
                <p><strong>6.3 Payment Processing:</strong> Handled by Cashfree, subject to their terms</p>
                <p><strong>6.4 AI Services:</strong> Email generation uses OpenAI, subject to their usage policies</p>
              </div>
              <p className="mt-3">We are not responsible for third-party services' availability or accuracy.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">7. Payment Terms</h2>
              <div className="space-y-3">
                <p><strong>7.1 Subscription:</strong> Pro features require a paid subscription</p>
                <p><strong>7.2 Billing:</strong> Subscriptions are billed monthly in advance</p>
                <p><strong>7.3 Refunds:</strong> See our Refund Policy for details</p>
                <p><strong>7.4 Price Changes:</strong> We may change prices with 30 days' notice</p>
                <p><strong>7.5 Failed Payments:</strong> We may suspend access for failed payments</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">8. Service Availability</h2>
              <div className="space-y-3">
                <p><strong>8.1 Uptime:</strong> We strive for high availability but don't guarantee uninterrupted service</p>
                <p><strong>8.2 Maintenance:</strong> We may perform maintenance with or without notice</p>
                <p><strong>8.3 Modifications:</strong> We may modify or discontinue features at any time</p>
                <p><strong>8.4 Data Accuracy:</strong> Job listings are sourced from third parties; we don't guarantee accuracy</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">9. Privacy and Data Protection</h2>
              <p>
                Your use of the Service is subject to our Privacy Policy. By using the Service, you consent to our 
                collection and use of personal information as detailed in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">10. Disclaimers and Limitations</h2>
              <div className="space-y-3">
                <p><strong>10.1 "AS IS" Service:</strong> The Service is provided "as is" without warranties of any kind.</p>
                <p><strong>10.2 No Employment Guarantee:</strong> We don't guarantee job placement or interview success.</p>
                <p><strong>10.3 Third-Party Actions:</strong> We're not responsible for employer or platform actions.</p>
                <p><strong>10.4 Data Loss:</strong> We're not liable for any data loss or corruption.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">11. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED 
                DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="mt-3">
                Our total liability shall not exceed the amount you paid us in the last 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">12. Indemnification</h2>
              <p>
                You agree to indemnify and hold us harmless from any claims, losses, liabilities, damages, 
                expenses, and costs (including attorney fees) arising from your use of the Service or violation 
                of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">13. Termination</h2>
              <div className="space-y-3">
                <p><strong>13.1 By You:</strong> You may terminate your account at any time through account settings.</p>
                <p><strong>13.2 By Us:</strong> We may terminate or suspend your account for Terms violations.</p>
                <p><strong>13.3 Effect:</strong> Upon termination, your right to use the Service ceases immediately.</p>
                <p><strong>13.4 Data Retention:</strong> Some information may be retained as described in our Privacy Policy.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">14. Governing Law and Disputes</h2>
              <div className="space-y-3">
                <p><strong>14.1 Governing Law:</strong> These Terms are governed by the laws of the jurisdiction where the service provider is established.</p>
                <p><strong>14.2 Dispute Resolution:</strong> Any disputes shall be resolved through binding arbitration.</p>
                <p><strong>14.3 Class Action Waiver:</strong> You waive any right to bring claims as a class action.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">15. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Material changes will be notified via email 
                or Service announcement. Continued use after changes constitutes acceptance of new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">16. Miscellaneous</h2>
              <div className="space-y-3">
                <p><strong>16.1 Entire Agreement:</strong> These Terms constitute the entire agreement between you and us.</p>
                <p><strong>16.2 Severability:</strong> If any provision is unenforceable, the remaining provisions continue.</p>
                <p><strong>16.3 No Waiver:</strong> Our failure to enforce any right is not a waiver.</p>
                <p><strong>16.4 Assignment:</strong> You may not assign these Terms; we may assign them freely.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">17. Contact Information</h2>
              <p className="mb-3">For questions about these Terms, contact us at:</p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p><strong>Email:</strong> support@ai-jobhunter.com</p>
                <p><strong>Support:</strong> support@ai-jobhunter.com</p>
              </div>
            </section>
      </div>
    </LegalPageLayout>
  );
}