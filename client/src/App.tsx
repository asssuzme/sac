import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/ui/loading-animations";
import { ThemeProvider } from "@/providers/theme-provider";
import { ProtectedRouteRedirect } from "@/components/protected-route-redirect";
import { useEffect } from "react";

import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Results from "@/pages/results";
import Applications from "@/pages/applications";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Subscribe from "@/pages/subscribe";
import PrivacyPolicy from "@/pages/privacy-policy";
import { Terms } from "@/pages/terms";
import TermsOfService from "@/pages/terms-of-service";
import RefundPolicy from "@/pages/refund-policy";
import ShippingPolicy from "@/pages/shipping-and-delivery";
import Contact from "@/pages/contact";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import HowItWorks from "@/pages/how-it-works";
import Sitemap from "@/pages/sitemap";
import NotFound from "@/pages/not-found";
import AuthCallback from "@/pages/auth-callback";
import Admin from "@/pages/admin";
import PaymentSuccess from "@/pages/payment-success";
import PaymentFeedback from "@/pages/payment-feedback";
import Upgrade from "@/pages/upgrade";

// Homepage redirect component
const HomepageRedirect = () => {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation('/');
  }, [setLocation]);
  return <PageLoader />;
};

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Using Supabase auth handling

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Switch>
      {/* Main routes - show different components based on auth status */}
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      <Route path="/search" component={isAuthenticated ? Home : ProtectedRouteRedirect} />
      <Route path="/applications" component={isAuthenticated ? Applications : ProtectedRouteRedirect} />
      <Route path="/analytics" component={isAuthenticated ? Analytics : ProtectedRouteRedirect} />
      <Route path="/settings" component={isAuthenticated ? Settings : ProtectedRouteRedirect} />
      <Route path="/subscribe" component={isAuthenticated ? Subscribe : ProtectedRouteRedirect} />
      <Route path="/upgrade" component={isAuthenticated ? Upgrade : ProtectedRouteRedirect} />
      <Route path="/results/:requestId" component={isAuthenticated ? Results : ProtectedRouteRedirect} />
      <Route path="/admin" component={isAuthenticated ? Admin : ProtectedRouteRedirect} />
      
      {/* Auth callback route */}
      <Route path="/auth/callback" component={AuthCallback} />
      
      {/* Policy pages accessible to all */}
      <Route path="/homepage" component={HomepageRedirect} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/shipping-and-delivery" component={ShippingPolicy} />
      <Route path="/contact" component={Contact} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/payment-feedback" component={PaymentFeedback} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/sitemap" component={Sitemap} />
      
      {/* Catch-all for 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  // Monitor Supabase auth state changes
  // No need for auth state listener anymore - using direct session auth

  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
