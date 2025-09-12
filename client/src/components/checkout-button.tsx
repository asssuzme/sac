import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface CheckoutButtonProps {
  plan: string;
  price: number;
  currency: string;
  className?: string;
  children?: React.ReactNode;
}

export function CheckoutButton({ plan, price, currency, className, children }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Check if user is authenticated
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"]
  });
  
  const handleCheckout = async () => {
    try {
      // Check if user is logged in
      if (!user) {
        // Redirect to login
        window.location.href = "/api/auth/google";
        return;
      }
      
      setIsLoading(true);
      
      // Save plan details to localStorage for the feedback page
      localStorage.setItem('selectedPlan', JSON.stringify({
        plan,
        price,
        currency
      }));
      
      // Redirect to feedback page instead of payment
      setTimeout(() => {
        setLocation("/payment-feedback");
      }, 500);
      
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children || (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Start Free Trial
          </>
        )
      )}
    </Button>
  );
}