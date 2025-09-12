import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Search, UserCheck, Mail, Send, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "1. Search for Jobs",
      description: "Enter your job preferences and location",
      details: [
        "Choose from 1000+ cities worldwide",
        "Select job roles from our curated list",
        "Set experience level and work type preferences",
        "Our AI finds the best LinkedIn job matches"
      ]
    },
    {
      icon: <UserCheck className="h-8 w-8" />,
      title: "2. Find Decision Makers",
      description: "We identify the right people to contact",
      details: [
        "Scrape company profiles automatically",
        "Find hiring managers and HR contacts",
        "Verify email addresses for accuracy",
        "Build a targeted contact list"
      ]
    },
    {
      icon: <Mail className="h-8 w-8" />,
      title: "3. Generate Personalized Emails",
      description: "AI creates tailored application emails",
      details: [
        "Upload your resume for personalization",
        "GPT-4 analyzes job requirements",
        "Creates unique emails for each application",
        "Professional tone and formatting"
      ]
    },
    {
      icon: <Send className="h-8 w-8" />,
      title: "4. Send Applications",
      description: "Apply with one click using your Gmail",
      details: [
        "Connect your Gmail account securely",
        "Send emails directly from your account",
        "Track email delivery status",
        "Schedule follow-up reminders"
      ]
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "5. Track Your Progress",
      description: "Monitor your job search success",
      details: [
        "View application statistics",
        "Track response rates",
        "Get insights on what's working",
        "Optimize your approach"
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
            How ai-jobhunter.com Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From job search to application in 5 simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="mb-12 last:mb-0"
            >
              <div className={`flex gap-8 items-center ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                {/* Icon */}
                <div className="shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-50" />
                    <div className="relative backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
                      <div className="text-blue-600 dark:text-blue-400">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                    <p className="text-lg text-muted-foreground mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-8">
                  <div className="w-0.5 h-16 bg-gradient-to-b from-blue-500/50 to-indigo-500/50" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <div className="relative backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Automate Your Job Search?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands who've found their dream jobs faster with autoapply.ai
            </p>
            <Link href="/api/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}