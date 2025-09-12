import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Sparkles, DollarSign, Smile, Frown } from "lucide-react";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";

export default function PaymentFeedback() {
  const [response, setResponse] = useState<"yes" | "no" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();

  const handleResponse = async (answer: "yes" | "no") => {
    setResponse(answer);
    
    // Send feedback to backend
    try {
      await fetch("/api/feedback/payment-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wouldPay: answer === "yes" }),
      });
    } catch (error) {
      console.error("Failed to send feedback:", error);
    }

    if (answer === "yes") {
      // Celebrate their enthusiasm
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#8b5cf6"],
      });
      
      setTimeout(() => {
        setShowResult(true);
      }, 500);
    } else {
      // Show understanding response
      setTimeout(() => {
        setShowResult(true);
      }, 300);
    }
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="glass-card p-12 text-center">
            {response === "yes" ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="inline-flex p-6 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 mb-6"
                >
                  <Sparkles className="h-16 w-16 text-primary" />
                </motion.div>
                <h1 className="text-4xl font-bold mb-4">Wow, You're Amazing! 🎉</h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Thanks for believing in us! We're working hard to make this worth every penny.
                </p>
                <p className="text-lg mb-8">
                  <span className="font-semibold">Fun fact:</span> You're part of the 
                  <span className="text-primary font-bold"> 12% </span>
                  who said yes! You have excellent taste. 😎
                </p>
                <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl mb-8">
                  <p className="text-lg font-semibold mb-2">Here's the deal:</p>
                  <p className="text-muted-foreground">
                    We're still building the payment system (it's harder than finding a job on LinkedIn).
                    But we've noted your interest! You'll be the first to know when we launch for real.
                  </p>
                </div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="inline-flex p-6 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 mb-6"
                >
                  <DollarSign className="h-16 w-16 text-orange-500" />
                </motion.div>
                <h1 className="text-4xl font-bold mb-4">We Totally Get It! 💸</h1>
                <p className="text-xl text-muted-foreground mb-6">
                  ₹129 is like... 2 fancy coffees or 1/3 of a Netflix subscription. 
                  We feel you!
                </p>
                <p className="text-lg mb-8">
                  <span className="font-semibold">You're with the majority:</span> 
                  <span className="text-orange-500 font-bold"> 88% </span>
                  of people clicked "No" too. At least you're honest! 
                </p>
                <div className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl mb-8">
                  <p className="text-lg font-semibold mb-2">No hard feelings!</p>
                  <p className="text-muted-foreground">
                    Keep using the free version - it's pretty awesome too! 
                    And hey, if you ever win the lottery, we'll be here. 🤑
                  </p>
                </div>
              </>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="btn-primary">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Link href="/pricing">
          <Button variant="ghost" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </Button>
        </Link>

        <div className="glass-card p-12">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="text-center"
          >
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6">
              <DollarSign className="h-12 w-12 text-primary" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              Wait, Hold Up... 🤔
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Before we take your money (or pretend to)...
            </p>

            <div className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Would you <span className="text-primary">actually</span> pay ₹129/month for this?
              </h2>
              <p className="text-lg text-muted-foreground mb-2">
                Be honest. We won't judge. 
              </p>
              <p className="text-sm text-muted-foreground">
                (Okay, maybe a little if you say no 😅)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleResponse("yes")}
                className="p-6 rounded-xl border-2 border-green-500 bg-green-500/10 hover:bg-green-500/20 transition-all group"
              >
                <Smile className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  YES! 💚
                </h3>
                <p className="text-sm text-muted-foreground">
                  Shut up and take my money!
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleResponse("no")}
                className="p-6 rounded-xl border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all group"
              >
                <Frown className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                  NO WAY! 💔
                </h3>
                <p className="text-sm text-muted-foreground">
                  I'd rather buy 2 cups of coffee
                </p>
              </motion.button>
            </div>

            <p className="text-xs text-muted-foreground mt-8">
              * This is just for feedback. We're not actually charging you... yet 😉
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}