import { Mail, MessageSquare, Clock, Shield } from "lucide-react";
import LegalPageLayout from "@/components/legal-page-layout";

export default function Contact() {
  return (
    <LegalPageLayout 
      title="Contact Us" 
      lastUpdated="We're here to help with any questions or concerns"
    >
      <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
            {/* Support Section */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-muted-foreground mb-2">
                    For general inquiries and support:
                  </p>
                  <a 
                    href="mailto:support@ai-jobhunter.com" 
                    className="text-primary hover:underline"
                  >
                    support@ai-jobhunter.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Response Time</h3>
                  <p className="text-muted-foreground">
                    We typically respond within 24-48 hours during business days
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Privacy & Security</h3>
                  <p className="text-muted-foreground mb-2">
                    For privacy concerns or data requests:
                  </p>
                  <a 
                    href="mailto:support@ai-jobhunter.com" 
                    className="text-primary hover:underline"
                  >
                    support@ai-jobhunter.com
                  </a>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Business Information</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <span className="font-medium">Company:</span> ai-jobhunter.com
                  </p>
                  <p>
                    <span className="font-medium">Operated by:</span> Ashutosh Lath
                  </p>
                  <p>
                    <span className="font-medium">Service Type:</span> Job Application Automation Platform
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Data Protection Officer</h3>
                <p className="text-muted-foreground mb-2">
                  For GDPR/CCPA inquiries and data protection matters:
                </p>
                <a 
                  href="mailto:support@ai-jobhunter.com" 
                  className="text-primary hover:underline"
                >
                  support@ai-jobhunter.com
                </a>
              </div>
            </div>
        </div>

        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Before You Contact Us
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Check our FAQ section for common questions</li>
            <li>• Review our Terms of Service and Privacy Policy</li>
            <li>• Include your account email when contacting support</li>
            <li>• Be specific about any issues you're experiencing</li>
          </ul>
        </div>
      </div>
    </LegalPageLayout>
  );
}