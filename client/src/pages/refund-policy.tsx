import LegalPageLayout from "@/components/legal-page-layout";

export default function RefundPolicy() {
  return (
    <LegalPageLayout 
      title="Refund Policy" 
      lastUpdated="Effective Date: January 1, 2025 | Last Updated: August 4, 2025"
    >
      <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">1. Overview</h2>
              <p>
                At ai-jobhunter.com, we strive to provide exceptional service. This refund policy outlines the terms 
                under which you may request a refund for our subscription services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">2. Subscription Services</h2>
              <div className="space-y-3">
                <p><strong>2.1 Free Trial:</strong> We offer a free tier to try our service before subscribing.</p>
                <p><strong>2.2 Monthly Subscriptions:</strong> Billed monthly in advance, non-refundable except as stated below.</p>
                <p><strong>2.3 Annual Subscriptions:</strong> Billed annually in advance with special refund terms.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">3. Refund Eligibility</h2>
              <p className="mb-3">You may be eligible for a refund if:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Outage:</strong> Extended service unavailability (more than 24 hours) not caused by scheduled maintenance</li>
                <li><strong>Major Feature Failure:</strong> Core features completely non-functional for more than 48 hours</li>
                <li><strong>Billing Error:</strong> Accidental duplicate charges or incorrect amounts</li>
                <li><strong>First-Time Subscribers:</strong> 7-day money-back guarantee for first-time Pro subscribers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">4. Non-Refundable Situations</h2>
              <p className="mb-3">Refunds are NOT provided for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Change of mind after the refund period</li>
                <li>Failure to cancel subscription before renewal</li>
                <li>Partial month usage</li>
                <li>Third-party service issues (LinkedIn, Gmail, etc.)</li>
                <li>Job application outcomes or lack of responses</li>
                <li>Violation of our Terms of Service resulting in account termination</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">5. Refund Process</h2>
              <div className="space-y-3">
                <p><strong>5.1 Request Timeline:</strong> Submit refund requests within 7 days of the charge</p>
                <p><strong>5.2 How to Request:</strong> Email team@gigfloww.com with:</p>
                <ul className="list-disc pl-6 ml-4 space-y-2">
                  <li>Your account email</li>
                  <li>Transaction ID or invoice number</li>
                  <li>Reason for refund request</li>
                  <li>Any supporting documentation</li>
                </ul>
                <p><strong>5.3 Review Period:</strong> We'll review requests within 3-5 business days</p>
                <p><strong>5.4 Processing Time:</strong> Approved refunds processed within 5-10 business days</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">6. Cancellation Policy</h2>
              <div className="space-y-3">
                <p><strong>6.1 Subscription Cancellation:</strong> Cancel anytime through account settings</p>
                <p><strong>6.2 Effect of Cancellation:</strong> Access continues until the end of the billing period</p>
                <p><strong>6.3 No Partial Refunds:</strong> No refunds for unused time in the billing period</p>
                <p><strong>6.4 Re-subscription:</strong> You can re-subscribe at any time</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">7. Pro-Rated Refunds</h2>
              <p className="mb-3">Pro-rated refunds may be issued for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Annual subscriptions cancelled within 30 days</li>
                <li>Service permanently discontinued by us</li>
                <li>Account termination due to our error</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">8. Payment Disputes</h2>
              <p>
                If you dispute a charge with your bank or credit card company (chargeback), we reserve the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Suspend your account during investigation</li>
                <li>Terminate your account if chargeback is unwarranted</li>
                <li>Refuse future service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">9. Currency and Taxes</h2>
              <div className="space-y-3">
                <p><strong>9.1 Currency:</strong> All refunds issued in the original payment currency</p>
                <p><strong>9.2 Exchange Rates:</strong> We're not responsible for exchange rate fluctuations</p>
                <p><strong>9.3 Taxes:</strong> Refunded amounts may be subject to tax adjustments</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">10. Special Circumstances</h2>
              <p>
                We may consider refunds outside this policy for exceptional circumstances at our sole discretion. 
                This includes but is not limited to medical emergencies, natural disasters, or other force majeure events.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">11. Changes to This Policy</h2>
              <p>
                We reserve the right to modify this refund policy at any time. Changes will be effective immediately 
                upon posting to our website. Your continued use of the service constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">12. Contact Us</h2>
              <p className="mb-3">For refund requests or questions about this policy:</p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p><strong>Email:</strong> support@ai-jobhunter.com</p>
                <p><strong>Response Time:</strong> 24-48 hours (business days)</p>
                <p className="mt-2">Please include "Refund Request" in your email subject line</p>
              </div>
            </section>
      </div>
    </LegalPageLayout>
  );
}