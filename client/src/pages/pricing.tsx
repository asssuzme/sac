import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Check, X, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { CheckoutButton } from "@/components/checkout-button";

export default function Pricing() {
  const [pricing, setPricing] = useState({
    currency: 'USD',
    price: 29,
    symbol: '$'
  });
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  
  // Fetch user location and pricing
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch('/api/user-location');
        if (response.ok) {
          const data = await response.json();
          setPricing({
            currency: data.currency,
            price: data.price,
            symbol: data.symbol
          });
        }
      } catch (error) {
        console.error('Failed to fetch pricing:', error);
      } finally {
        setIsLoadingPricing(false);
      }
    };
    
    fetchPricing();
  }, []);

  const plans = [
    {
      name: "Free",
      price: `${pricing.symbol}0`,
      period: "forever",
      description: "Perfect for getting started with job automation",
      features: [
        { text: "5 job searches per month", included: true },
        { text: "Basic email generation", included: true },
        { text: "Standard support", included: true },
        { text: "Contact discovery", included: false },
        { text: "Bulk operations", included: false },
        { text: "Advanced analytics", included: false },
        { text: "Priority support", included: false },
        { text: "API access", included: false }
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: `${pricing.symbol}${pricing.price}`,
      period: "per month",
      description: "For serious job seekers who want to accelerate their search",
      features: [
        { text: "Unlimited job searches", included: true },
        { text: "AI-powered email generation", included: true },
        { text: "Contact discovery & verification", included: true },
        { text: "Bulk operations (up to 50)", included: true },
        { text: "Advanced analytics", included: true },
        { text: "Priority email support", included: true },
        { text: "API access", included: false },
        { text: "Custom integrations", included: false }
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact sales",
      description: "For recruitment agencies and large teams",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Unlimited bulk operations", included: true },
        { text: "Full API access", included: true },
        { text: "Custom integrations", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "SLA guarantee", included: true },
        { text: "White-label options", included: true },
        { text: "Advanced security features", included: true }
      ],
      cta: "Contact Sales",
      popular: false
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
                autoapply.ai
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your job search journey
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-2xl shadow-xl border ${
                plan.popular 
                  ? 'border-blue-500/50 ring-2 ring-blue-500/20' 
                  : 'border-white/20 dark:border-slate-700/50'
              } p-8 hover:shadow-2xl transition-shadow`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600">
                  Most Popular
                </Badge>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400 shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground line-through'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.name === "Enterprise" ? (
                <Link href="/contact">
                  <Button className="w-full" variant="outline">
                    {plan.cta}
                  </Button>
                </Link>
              ) : plan.name === "Pro" ? (
                <CheckoutButton
                  plan="pro"
                  price={pricing.price}
                  currency={pricing.currency}
                  className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700`}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {plan.cta}
                </CheckoutButton>
              ) : (
                <Link href="/api/auth/google">
                  <Button className="w-full" variant="outline">
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="grid gap-6">
            <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-xl p-6 border border-white/20 dark:border-slate-700/50">
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any differences.
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-xl p-6 border border-white/20 dark:border-slate-700/50">
              <h3 className="font-semibold mb-2">Is there a free trial for Pro?</h3>
              <p className="text-muted-foreground">
                Yes, we offer a 7-day free trial for Pro plans. No credit card required to start your trial.
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-xl p-6 border border-white/20 dark:border-slate-700/50">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, and UPI payments through our secure payment partner Cashfree.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}