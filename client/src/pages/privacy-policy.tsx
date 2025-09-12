import LegalPageLayout from "@/components/legal-page-layout";

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout 
      title="Privacy Policy" 
      lastUpdated="Effective Date: January 1, 2025 | Last Updated: August 4, 2025"
    >
      <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">1. Introduction</h2>
              <p>ai-jobhunter.com ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our job application automation service. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">2.1 Personal Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account Information: Email address, name, and profile picture from Google OAuth</li>
                    <li>Resume Data: CV/resume documents and extracted text for job applications</li>
                    <li>Job Preferences: Search criteria, target positions, and location preferences</li>
                    <li>Application History: Jobs applied to, email content, and application status</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">2.2 Authentication Data</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Google OAuth tokens and refresh tokens</li>
                    <li>Gmail API access tokens (only when explicitly authorized)</li>
                    <li>Session identifiers and authentication timestamps</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">2.3 Payment Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Billing details processed by Cashfree (we don't store card numbers)</li>
                    <li>Subscription status and payment history</li>
                    <li>Customer ID for payment processing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">2.4 Usage Data</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Log data: IP address, browser type, and access times</li>
                    <li>Feature usage patterns and preferences</li>
                    <li>Error reports and performance metrics</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">3. How We Use Your Information</h2>
              <p className="mb-3">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our job application automation service</li>
                <li>To authenticate users and manage accounts securely</li>
                <li>To generate personalized job application emails using AI</li>
                <li>To send job applications via your Gmail account (with explicit consent)</li>
                <li>To process payments and manage subscriptions</li>
                <li>To improve our service based on usage patterns</li>
                <li>To send service updates, security alerts, and support messages</li>
                <li>To comply with legal obligations and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">4. Legal Basis for Processing (GDPR)</h2>
              <p className="mb-3">We process your personal data under the following legal bases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contract:</strong> Processing necessary to perform our services</li>
                <li><strong>Consent:</strong> For Gmail access and email sending on your behalf</li>
                <li><strong>Legitimate Interests:</strong> For improving our service and security</li>
                <li><strong>Legal Obligation:</strong> When required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">5. Data Sharing and Disclosure</h2>
              <div className="space-y-4">
                <p>We do not sell, trade, or rent your personal information. We may share your information only in these circumstances:</p>
                <div>
                  <h3 className="font-medium text-foreground mb-2">5.1 Service Providers</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Google:</strong> For OAuth authentication and Gmail API access</li>
                    <li><strong>OpenAI:</strong> For generating personalized email content (no PII shared)</li>
                    <li><strong>Apify:</strong> For job data collection from public sources</li>
                    <li><strong>Cashfree:</strong> For payment processing</li>
                    <li><strong>SendGrid:</strong> For transactional emails</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">5.2 Legal Requirements</h3>
                  <p>We may disclose information if required by law, court order, or government request.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">6. Data Security</h2>
              <p className="mb-3">We implement industry-standard security measures including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>TLS/SSL encryption for all data in transit</li>
                <li>Encryption at rest for sensitive data</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication for internal systems</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
              <p className="mt-3">However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">7. Data Retention</h2>
              <p className="mb-3">We retain your data for different periods based on its type:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Until account deletion request</li>
                <li><strong>Resume Data:</strong> Until manually deleted or account closed</li>
                <li><strong>Application History:</strong> 2 years for your reference</li>
                <li><strong>Payment Records:</strong> 7 years for tax compliance</li>
                <li><strong>Logs:</strong> 90 days for security and debugging</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">8. Your Rights</h2>
              <div className="space-y-4">
                <p>Depending on your location, you may have the following rights:</p>
                <div>
                  <h3 className="font-medium text-foreground mb-2">8.1 GDPR Rights (European Users)</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                    <li><strong>Erasure:</strong> Request deletion of your data</li>
                    <li><strong>Restriction:</strong> Limit processing of your data</li>
                    <li><strong>Portability:</strong> Receive your data in a portable format</li>
                    <li><strong>Object:</strong> Object to certain processing activities</li>
                    <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">8.2 CCPA Rights (California Users)</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Right to know what personal information is collected</li>
                    <li>Right to delete personal information</li>
                    <li>Right to opt-out of sale (we don't sell data)</li>
                    <li>Right to non-discrimination</li>
                  </ul>
                </div>
                <p className="mt-3">To exercise these rights, contact us at support@ai-jobhunter.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">9. Children's Privacy</h2>
              <p>Our service is not intended for individuals under 18. We do not knowingly collect personal information from children under 18. If we become aware of such collection, we will delete the information immediately.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">10. International Data Transfers</h2>
              <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, including standard contractual clauses approved by relevant authorities.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">11. Third-Party Links</h2>
              <p>Our service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">12. Changes to This Policy</h2>
              <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. For significant changes, we may also notify you via email.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">13. Contact Information</h2>
              <p className="mb-3">For privacy-related questions or to exercise your rights, contact us at:</p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p><strong>Email:</strong> support@ai-jobhunter.com</p>
                <p><strong>Data Protection Officer:</strong> support@ai-jobhunter.com</p>
                <p><strong>Address:</strong> ai-jobhunter.com, c/o Ashutosh Lath</p>
              </div>
            </section>
      </div>
    </LegalPageLayout>
  );
}