import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Sparkles, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProPlanUpgradeProps {
  onSuccess?: () => void;
}

export function ProPlanUpgrade({ onSuccess }: ProPlanUpgradeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          successUrl: `${window.location.origin}/?payment=success`,
          cancelUrl: `${window.location.origin}/?payment=cancelled`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      window.location.href = data.checkoutUrl;
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const proFeatures = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Unlimited Job Searches",
      description: "Search for jobs without any limits"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Access to All Jobs",
      description: "View all jobs, including those without discoverable emails"
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: "Priority Support",
      description: "Get help faster with priority email support"
    },
    {
      icon: <Crown className="w-5 h-5" />,
      title: "Pro Badge",
      description: "Show your professional status with a Pro badge"
    }
  ];

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass-card p-8 border-2 border-gold/20">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/30">
                <Crown className="w-12 h-12 text-gold" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-navy via-gold to-navy bg-clip-text text-transparent mb-2">
              Upgrade to Pro
            </h2>
            <p className="text-gray-400 text-lg">
              Unlock the full potential of AI JobHunter
            </p>
          </div>

          <div className="mb-8">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-white mb-2">
                $29<span className="text-2xl text-gray-400">/month</span>
              </div>
              <p className="text-gray-400">Cancel anytime, no commitment</p>
            </div>

            <div className="space-y-4 mb-8">
              {proFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-navy/20 border border-navy/30 hover:border-gold/30 transition-colors"
                >
                  <div className="p-2 rounded-full bg-gold/10 text-gold shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold glass-button-gold"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Pro Now
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Secure payment powered by Dodo Payments
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
