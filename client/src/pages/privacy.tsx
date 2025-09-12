import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function Privacy() {
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
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: August 3, 2025</p>
          
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Information We Collect</h2>
              <p className="mb-3">
                ai-jobhunter.com collects the following information to provide our job application automation service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Google account information (email, name) for authentication</li>
                <li>Resume data you upload for job applications</li>
                <li>Job search preferences and application history</li>
                <li>Gmail access (only when explicitly authorized) to send emails on your behalf</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">How We Use Your Information</h2>
              <p className="mb-3">
                We use your information solely to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authenticate you securely through Google OAuth</li>
                <li>Generate personalized job application emails based on your resume</li>
                <li>Send job applications via Gmail (only with your explicit permission)</li>
                <li>Track your application history and provide analytics</li>
                <li>Process payments for premium features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>All data is encrypted in transit using HTTPS</li>
                <li>Passwords are never stored (we use Google OAuth)</li>
                <li>Gmail tokens are encrypted and can be revoked at any time</li>
                <li>Resume data is stored securely and only accessible by you</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Third-Party Services</h2>
              <p className="mb-3">
                We integrate with the following third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google OAuth:</strong> For secure authentication</li>
                <li><strong>Gmail API:</strong> To send emails on your behalf (optional)</li>
                <li><strong>Apify:</strong> For job data scraping from LinkedIn</li>
                <li><strong>OpenAI:</strong> To generate personalized application emails</li>
                <li><strong>Cashfree:</strong> For secure payment processing</li>
                <li><strong>Supabase:</strong> For authentication infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Your Rights</h2>
              <p className="mb-3">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data at any time</li>
                <li>Delete your account and all associated data</li>
                <li>Revoke Gmail access without deleting your account</li>
                <li>Export your application history</li>
                <li>Opt-out of any optional features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Data Retention</h2>
              <p>
                We retain your data only as long as necessary to provide our services. You can delete your account at any time, which will permanently remove all your data from our systems within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or how we handle your data, please contact us at:
              </p>
              <p className="mt-2">
                Email: support@ai-jobhunter.com<br />
                Website: https://ai-jobhunter.com
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}