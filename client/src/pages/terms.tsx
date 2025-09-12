import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: August 3, 2025</p>
          
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using autoapply.ai, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
              <p>
                autoapply.ai provides an automated job application service that helps users find job opportunities 
                and send personalized applications. Our service includes job scraping, AI-powered email generation, 
                and optional Gmail integration for sending applications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
              <p className="mb-3">To use our service, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create an account using Google OAuth authentication</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Acceptable Use</h2>
              <p className="mb-3">You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Send spam or unsolicited emails</li>
                <li>Misrepresent yourself or your qualifications</li>
                <li>Violate any laws or regulations</li>
                <li>Interfere with or disrupt the service</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Payment Terms</h2>
              <p className="mb-3">For premium features:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment is processed securely through Cashfree</li>
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>Prices may change with 30 days notice</li>
                <li>You are responsible for all applicable taxes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Intellectual Property</h2>
              <p>
                All content, features, and functionality of autoapply.ai are owned by us and are protected by 
                intellectual property laws. You retain ownership of any content you upload (such as your resume), 
                but grant us a license to use it for providing our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Third-Party Services</h2>
              <p>
                Our service integrates with third-party platforms (Google, LinkedIn, etc.). Your use of these 
                integrations is subject to their respective terms of service. We are not responsible for 
                third-party services or content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Disclaimer of Warranties</h2>
              <p>
                autoapply.ai is provided "as is" without warranties of any kind. We do not guarantee job placement, 
                interview success, or any specific outcomes from using our service. Job market results depend on 
                many factors beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, autoapply.ai shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages resulting from your use or inability 
                to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless autoapply.ai from any claims, damages, losses, or 
                expenses arising from your use of the service or violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">11. Termination</h2>
              <p>
                We may terminate or suspend your account at any time for violation of these terms. You may 
                also delete your account at any time. Upon termination, your right to use the service will 
                immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">12. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material 
                changes. Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">13. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                in which autoapply.ai operates, without regard to conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">14. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="mt-2">
                Email: support@ai-jobhunter.com<br />
                Website: https://ai-jobhunter.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}