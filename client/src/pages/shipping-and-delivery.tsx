import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Zap, Mail, Search, Clock, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card p-8 space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Shipping and Delivery
              </h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  Digital Service Delivery
                </h2>
                <p>
                  ai-jobhunter.com is a digital service that provides instant access to job search automation tools. 
                  There is no physical shipping involved as all services are delivered electronically through our web platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  Service Activation Timeline
                </h2>
                <div className="space-y-3">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="font-semibold">Free Plan</h3>
                    <p>Instant activation upon successful registration</p>
                  </div>
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <h3 className="font-semibold">Pro Plan</h3>
                    <p>Immediate activation upon successful payment processing (typically within 2-3 minutes)</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Search className="h-6 w-6 text-primary" />
                  Service Delivery Times
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Job Search Results:</strong> Delivered within 30-60 seconds of initiating search</li>
                  <li><strong>AI Email Generation:</strong> Generated instantly (2-5 seconds)</li>
                  <li><strong>Contact Information:</strong> Available immediately for Pro Plan users</li>
                  <li><strong>Resume Processing:</strong> Analyzed within 5 seconds of upload</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Mail className="h-6 w-6 text-primary" />
                  How Services Are Delivered
                </h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Access your dashboard at gigfloww.com immediately after login</li>
                  <li>All features are available through your web browser</li>
                  <li>Email notifications are sent to your registered email address</li>
                  <li>Generated emails can be sent directly through our Gmail integration</li>
                </ol>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  Service Availability
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Services are available 24/7 from any location with internet access</li>
                  <li>No geographical restrictions on service delivery</li>
                  <li>All features work on modern web browsers (Chrome, Firefox, Safari, Edge)</li>
                  <li>Mobile-responsive design for access on smartphones and tablets</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Service Guarantees
                </h2>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p><strong>Uptime Guarantee:</strong> We maintain 99.9% service availability</p>
                  <p><strong>Data Processing:</strong> All searches and email generation completed within specified timeframes</p>
                  <p><strong>Support Response:</strong> Email support responses within 24-48 business hours</p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Technical Requirements</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Stable internet connection (minimum 1 Mbps recommended)</li>
                  <li>Modern web browser updated within the last 2 years</li>
                  <li>JavaScript enabled in your browser</li>
                  <li>Cookies enabled for authentication</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Service Interruptions</h2>
                <p>
                  In the rare event of service interruption:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Pro Plan users will receive service credit for any downtime exceeding 4 hours</li>
                  <li>Notifications will be sent via email about scheduled maintenance</li>
                  <li>Status updates available at status.gigfloww.com</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Contact Information</h2>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p>For questions about service delivery:</p>
                  <p className="font-semibold">Email: support@ai-jobhunter.com</p>
                  <p className="font-semibold">Response Time: Within 24-48 business hours</p>
                </div>
              </section>

              <section className="space-y-4 border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  By using ai-jobhunter.com services, you acknowledge that this is a digital product with no physical 
                  delivery requirements. All services are provided electronically through our secure web platform.
                </p>
              </section>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}