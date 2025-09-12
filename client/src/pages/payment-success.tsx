import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  
  // Get order ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order_id');
  const paymentStatus = urlParams.get('status');
  
  // Fetch subscription status
  const { data: subscription } = useQuery<{
    hasActiveSubscription: boolean;
    plan: string;
    expiresAt?: string;
    status?: string;
  }>({
    queryKey: ['/api/subscription-status'],
    refetchInterval: status === 'pending' ? 2000 : false
  })
  
  useEffect(() => {
    // Check payment status from URL or subscription data
    if (paymentStatus === 'success' || subscription?.hasActiveSubscription) {
      setStatus('success');
      
      // Trigger confetti animation
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      }
      
      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
      
    } else if (paymentStatus === 'failed') {
      setStatus('failed');
    }
  }, [paymentStatus, subscription]);
  
  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900">
        <Card className="max-w-md w-full mx-4 p-8 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <h2 className="text-xl font-semibold">Processing Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment</p>
          </div>
        </Card>
      </div>
    );
  }
  
  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50/30 to-pink-50/20 dark:from-slate-950 dark:via-red-950/20 dark:to-slate-900">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md w-full mx-4 p-8 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-red-200 dark:border-red-800">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <X className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Payment Failed</h1>
                <p className="text-muted-foreground">
                  We couldn't process your payment. Please try again.
                </p>
              </div>
              
              <div className="space-y-3">
                <Link href="/pricing">
                  <Button className="w-full" variant="default">
                    Try Again
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="w-full" variant="outline">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-green-600/20 rounded-full blur-3xl"
        />
      </div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Card className="max-w-lg w-full mx-4 p-8 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-green-200 dark:border-green-800">
          <div className="text-center space-y-6">
            {/* Success animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            
            {/* Success message */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground text-lg">
                Welcome to AI-JobHunter Pro
              </p>
            </div>
            
            {/* Features unlocked */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg p-6 space-y-3"
            >
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">Pro Features Unlocked</span>
              </div>
              <ul className="text-sm text-left space-y-2 max-w-xs mx-auto">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Unlimited job searches</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>AI-powered email generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Contact discovery & verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
            </motion.div>
            
            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <Link href="/dashboard">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" size="lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full" variant="outline">
                  Start Job Search
                </Button>
              </Link>
            </motion.div>
            
            {/* Subscription details */}
            {subscription?.expiresAt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-muted-foreground"
              >
                Your subscription expires on {new Date(subscription.expiresAt).toLocaleDateString()}
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}