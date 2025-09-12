import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, FileText, Shield, CreditCard, Phone, Info, Home, Search, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Sitemap() {
  const sections = [
    {
      title: "Main Pages",
      icon: Home,
      links: [
        { name: "Home", href: "/", description: "Dashboard and overview" },
        { name: "Job Search", href: "/search", description: "Search LinkedIn jobs" },
        { name: "Applications", href: "/applications", description: "Track sent applications" },
        { name: "Analytics", href: "/analytics", description: "View your job search stats" },
        { name: "Settings", href: "/settings", description: "Manage your account" },
        { name: "Subscribe", href: "/subscribe", description: "Upgrade to Pro Plan" },
      ]
    },
    {
      title: "Legal & Policies",
      icon: Shield,
      links: [
        { name: "Privacy Policy", href: "/privacy-policy", description: "How we handle your data" },
        { name: "Terms of Service", href: "/terms-of-service", description: "Terms and conditions" },
        { name: "Refund Policy", href: "/refund-policy", description: "Refund and cancellation terms" },
      ]
    },
    {
      title: "Support",
      icon: Phone,
      links: [
        { name: "Contact Us", href: "/contact", description: "Get in touch with support" },
        { name: "Sitemap", href: "/sitemap", description: "You are here" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Sitemap</h1>
            <p className="text-muted-foreground">
              Complete overview of all pages and resources
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <section.icon className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">{section.title}</h2>
                  </div>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="block hover:bg-accent/10 p-2 rounded-lg transition-colors">
                          <p className="font-medium text-foreground hover:text-primary">
                            {link.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {link.description}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="glass-card p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-medium mb-2">Company Details</h3>
                <p className="text-muted-foreground">
                  JobHunter Technologies Private Limited<br />
                  Bengaluru, Karnataka, India
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Compliance</h3>
                <p className="text-muted-foreground">
                  All required policies for payment gateway compliance<br />
                  Secure payment processing • Data protection
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}