import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Zap, Search, Mail, Users, BarChart3, Target, Globe, Shield, CheckCircle, Sparkles, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Features() {
  const features = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Smart Job Scraping",
      description: "Automatically scrape thousands of LinkedIn jobs matching your criteria with advanced filtering",
      details: [
        "Location-based search with 1000+ supported cities",
        "Filter by experience level and work type",
        "Real-time job updates",
        "Keyword matching algorithms"
      ]
    },
    {
      icon: <Mail className="h-8 w-8" />,
      title: "AI-Powered Email Generation",
      description: "Generate personalized application emails using GPT-4 tailored to each job and company",
      details: [
        "Resume-aware personalization",
        "Company research integration",
        "Professional tone optimization",
        "Custom templates support"
      ]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Contact Discovery",
      description: "Find hiring managers and HR contacts with our advanced profile scraping technology",
      details: [
        "LinkedIn profile enrichment",
        "Email verification included",
        "Decision maker identification",
        "Company hierarchy mapping"
      ]
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Application Analytics",
      description: "Track your job search progress with comprehensive analytics and insights",
      details: [
        "Application success rates",
        "Response time tracking",
        "Industry insights",
        "Performance optimization tips"
      ]
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Bulk Operations",
      description: "Apply to multiple jobs simultaneously with our batch processing capabilities",
      details: [
        "Queue up to 100 applications",
        "Automated follow-ups",
        "Smart scheduling",
        "Rate limit protection"
      ]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Privacy & Security",
      description: "Your data is encrypted and secure with enterprise-grade protection",
      details: [
        "End-to-end encryption",
        "GDPR compliant",
        "No data sharing",
        "Secure Gmail integration"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/">
            <Button variant="ghost" className="gap-2 hover:bg-white/50 dark:hover:bg-slate-800/50">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur-md opacity-70" />
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                ai-jobhunter.com
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Powerful Features for Job Seekers
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to automate your job search and land your dream role faster
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-shadow"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 pointer-events-none" />
              
              <div className="relative">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-fit mb-4">
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="relative backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Job Search?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of job seekers who've accelerated their careers with autoapply.ai
            </p>
            <Link href="/api/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}