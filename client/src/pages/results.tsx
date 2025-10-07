import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FilteredJobCard } from "@/components/filtered-job-card";
import { BulkApplyModal } from "@/components/bulk-apply-modal";
// Removed Tabs - now showing only jobs with discoverable emails
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Activity, 
  CheckCircle, 
  XCircle,
  Loader2,
  ArrowLeft,
  Search,
  Users,
  Briefcase,
  Mail,
  Sparkles,
  Filter,
  X,
  Globe,
  CheckCircle2,
  Zap,
  Building2,
  Clock,
  Lock
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/useAuth";

interface EnrichedJob {
  canApply: boolean;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  [key: string]: any;
}

interface ScrapingResult {
  status: 'pending' | 'processing' | 'filtering' | 'enriching' | 'completed' | 'failed';
  enrichedResults?: {
    jobs: EnrichedJob[];
  };
  errorMessage?: string;
}

export default function Results() {
  const { requestId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showProPlanModal, setShowProPlanModal] = useState(false);
  const [showBulkApplyModal, setShowBulkApplyModal] = useState(false);
  const [activeTab, setActiveTab] = useState("with-contacts");
  
  // Loading animation state
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [dynamicMessage, setDynamicMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [isAborted, setIsAborted] = useState(false);
  const abortRef = useRef(false);
  const { toast } = useToast();
  
  // Use React Query for resume fetching to properly use cache invalidation
  const { data: resumeData, refetch: refetchResume } = useQuery({
    queryKey: ['/api/user/resume'],
    queryFn: async () => {
      const response = await fetch('/api/user/resume');
      if (response.ok) {
        return await response.json();
      }
      return { hasResume: false, resumeText: null };
    },
    staleTime: 0, // Always considered stale to ensure fresh data
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true // Refetch when window regains focus
  });
  
  const userResume = resumeData?.resumeText || null;
  
  const { data: scrapingResult, isLoading } = useQuery<ScrapingResult & { resumeText?: string }>({
    queryKey: ['/api/scrape-job', requestId],
    enabled: !!requestId && !isAborted && !abortRef.current,
    refetchInterval: ({ state }) => {
      if (abortRef.current || isAborted) return false;
      const status = state.data?.status;
      return status === 'pending' || status === 'processing' || status === 'filtering' || status === 'enriching' ? 2000 : false;
    },
    gcTime: 0,
    staleTime: 0,
  });

  // Rotating messages for loading animation
  const rotatingMessages = [
    "This might take a few minutes — we're pulling thousands of listings.",
    "Our AI is scanning for the best matches.",
    "Almost there — mapping contacts to companies.",
    "Hang tight — good things take time 🚀."
  ];

  // Tips for loading animation
  const tips = [
    "💡 Pro tip: Upload your resume to get personalized email suggestions!",
    "📧 We'll find direct contact information for each job posting.",
    "🎯 Our AI filters out irrelevant jobs to save you time.",
    "🚀 Jobs with verified contacts show up first in your results.",
    "✨ Each email is uniquely crafted based on the job description."
  ];

  // Handle abort
  const handleAbort = async () => {
    // Set ref immediately for instant abort
    abortRef.current = true;
    setIsAborted(true);
    
    // Cancel the query
    queryClient.cancelQueries({ 
      queryKey: ['/api/scrape-job', requestId]
    });
    
    // Remove the query from cache
    queryClient.removeQueries({ 
      queryKey: ['/api/scrape-job', requestId]
    });
    
    // Call backend to abort Apify actors
    if (requestId) {
      try {
        await apiRequest(`/api/scrape-job/${requestId}/abort`, {
          method: 'POST'
        });
      } catch (error) {
        console.error("Error aborting job:", error);
      }
    }
    
    // Show abort message
    toast({
      title: "Search Cancelled",
      description: "The job search has been cancelled."
    });
    
    // Navigate back to dashboard after a short delay
    setTimeout(() => {
      setLocation('/');
    }, 1500);
  };

  // Check if still processing
  const isProcessing = !isAborted && scrapingResult && ['pending', 'processing', 'filtering', 'enriching'].includes(scrapingResult.status);

  // State for controlling transition delay after success
  const [shouldShowResults, setShouldShowResults] = useState(false);

  // Update progress smoothly over 4 minutes
  useEffect(() => {
    if (!isProcessing) {
      // Don't immediately reset if we're showing success
      if (!showSuccess) {
        setAnimatedProgress(0);
        setStartTime(null);
      }
      return;
    }

    // Set start time when processing begins
    if (!startTime) {
      setStartTime(Date.now());
    }

    const totalDuration = 4 * 60 * 1000; // 4 minutes in milliseconds
    const interval = setInterval(() => {
      if (!startTime) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / totalDuration) * 100, 99); // Cap at 99% until actually complete
      
      // If actually completed, jump to 100%
      if (scrapingResult?.status === 'completed') {
        setAnimatedProgress(100);
        if (!showSuccess) {
          setShowSuccess(true);
        }
        clearInterval(interval);
      } else {
        setAnimatedProgress(progress);
      }
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [isProcessing, startTime, scrapingResult?.status, showSuccess]);

  // Control transition delay when success animation shows
  useEffect(() => {
    if (showSuccess && scrapingResult?.status === 'completed') {
      // Wait 1.5 seconds for success animation to complete
      const timer = setTimeout(() => {
        setShouldShowResults(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, scrapingResult?.status]);

  // Rotate dynamic messages
  useEffect(() => {
    if (!isProcessing) return;

    let messageIndex = 0;
    setDynamicMessage(rotatingMessages[0]);

    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % rotatingMessages.length;
      setDynamicMessage(rotatingMessages[messageIndex]);
    }, 25000); // Change message every 25 seconds

    return () => clearInterval(interval);
  }, [isProcessing]);

  // Rotate tips
  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000); // Change tip every 5 seconds

    return () => clearInterval(interval);
  }, [isProcessing]);

  // Helper functions for loading animation
  const getProgressPercentage = () => {
    return Math.floor(animatedProgress);
  };

  const getStatusMessage = () => {
    const progress = animatedProgress;
    
    if (progress < 20) return "Connecting to LinkedIn…";
    if (progress < 40) return "Scraping job listings…";
    if (progress < 60) return "Analyzing job descriptions…";
    if (progress < 80) return "Finding decision makers…";
    if (progress < 100) return "Preparing your results…";
    return "Search complete!";
  };

  const getEstimatedTime = () => {
    if (!startTime) return "~4 minutes";
    
    const elapsed = Date.now() - startTime;
    const totalDuration = 4 * 60 * 1000; // 4 minutes
    const remaining = Math.max(0, totalDuration - elapsed);
    const minutes = Math.ceil(remaining / 60000);
    
    if (minutes === 0) return "Almost done...";
    if (minutes === 1) return "~1 minute left";
    return `~${minutes} minutes left`;
  };

  const getStatusIcon = () => {
    const status = scrapingResult?.status || 'pending';
    
    switch (status) {
      case 'pending':
      case 'processing':
        return <Globe className="h-20 w-20" />;
      case 'filtering':
        return <Filter className="h-20 w-20" />;
      case 'enriching':
        return <Mail className="h-20 w-20" />;
      default:
        return <Search className="h-20 w-20" />;
    }
  };

  // Removed hardcoded sample job cards - using real data only

  if (!user) {
    return null;
  }

  // Determine the current state for AnimatePresence key
  const getStateKey = () => {
    if (isLoading) return 'loading';
    if (!scrapingResult || scrapingResult.status === 'failed') return 'error';
    if (isProcessing && !shouldShowResults) return 'processing';
    return 'results';
  };

  // Main render with AnimatePresence for smooth transitions
  return (
    <AnimatePresence mode="wait">
      {/* Loading state */}
      {isLoading && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <DashboardLayout user={user} onLogout={() => window.location.href = "/api/auth/logout"} title="Job Results">
            <div className="flex items-center justify-center min-h-[60vh]">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">Loading job results...</p>
              </motion.div>
            </div>
          </DashboardLayout>
        </motion.div>
      )}

      {/* Error state */}
      {!isLoading && (!scrapingResult || scrapingResult.status === 'failed') && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <DashboardLayout user={user} onLogout={() => window.location.href = "/api/auth/logout"} title="Job Results">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center glass-card p-8 max-w-md">
                <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-4">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Search Failed</h1>
                <p className="text-muted-foreground mb-6">
                  {scrapingResult?.errorMessage || 'An error occurred while searching for jobs'}
                </p>
                <Link href="/">
                  <Button className="btn-primary">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </DashboardLayout>
        </motion.div>
      )}

      {/* Processing state - Show beautiful loading animation */}
      {!isLoading && scrapingResult && isProcessing && !shouldShowResults && (
        <motion.div
          key="processing"
          className="fixed inset-0 min-h-screen flex items-center justify-center bg-background overflow-hidden z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ 
            duration: 0.4,
            exit: { duration: 0.3 }
          }}
        >
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: "400% 400%"
            }}
          />
          {/* Floating orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Close button in top right */}
        <motion.button
          onClick={handleAbort}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-secondary transition-colors"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-5 w-5" />
        </motion.button>

        <div className="relative z-10 w-full max-w-2xl px-4">
          <motion.div 
            className="space-y-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Success animation */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className="fixed inset-0 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-full p-8 shadow-2xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckCircle2 className="h-24 w-24 text-green-500" />
                  </motion.div>
                  {/* Confetti effect */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{
                        x: 0,
                        y: 0,
                        opacity: 1,
                      }}
                      animate={{
                        x: (Math.random() - 0.5) * 400,
                        y: (Math.random() - 0.5) * 400,
                        opacity: 0,
                        rotate: Math.random() * 360,
                      }}
                      transition={{
                        duration: 1,
                        delay: i * 0.02,
                        ease: "easeOut"
                      }}
                      style={{
                        left: "50%",
                        top: "50%",
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Loading Container */}
            <div className="text-center space-y-6">
              <motion.div className="relative inline-block">
                {/* Pulsing glow behind icon */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Animated magnifying glass with AI sparkles */}
                <motion.div
                  className="relative"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Search className="h-24 w-24 text-primary relative z-10" />
                  {/* AI sparkles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.6,
                      }}
                      style={{
                        left: `${50 + Math.cos(i * 120 * Math.PI / 180) * 60}%`,
                        top: `${50 + Math.sin(i * 120 * Math.PI / 180) * 60}%`,
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-accent" />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.h2
                className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: "200% 100%",
                }}
              >
                {getStatusMessage()}
              </motion.h2>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto space-y-2">
                <div className="glass-card p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Progress</span>
                    <span className="text-sm font-bold text-primary">{getProgressPercentage()}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary via-purple-500 to-accent"
                      initial={{ width: "0%" }}
                      animate={{ width: `${animatedProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {getEstimatedTime()}
                  </p>
                </div>
              </div>

              {/* Status Icon Animation */}
              <div className="flex justify-center space-x-8">
                <motion.div
                  className="text-primary/50"
                  animate={{
                    opacity: scrapingResult?.status === 'processing' ? [0.3, 1, 0.3] : 0.3,
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getStatusIcon()}
                </motion.div>
              </div>
            </div>

            {/* Tips Carousel */}
            <motion.div
              className="glass-card p-6 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-accent/10 shrink-0">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={tipIndex}
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {tips[tipIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Real-time Job Search Animation */}
            <div className="relative h-32 overflow-hidden">
              <motion.div
                className="flex items-center justify-center h-full"
                animate={{ 
                  opacity: [0.6, 1, 0.6],
                  scale: [0.95, 1, 0.95]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-primary/10">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Finding LinkedIn Decision Makers...</p>
                      <p className="text-xs text-muted-foreground">Extracting contact information</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Dynamic message */}
            <motion.div
              className="text-center"
              key={dynamicMessage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-muted-foreground italic">{dynamicMessage}</p>
            </motion.div>

            {/* Cancel and Back to Dashboard Buttons */}
            <motion.div
              className="flex justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={handleAbort}
                variant="destructive"
                size="lg"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel Search
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
      )}

      {/* Results state - Main content */}
      {!isLoading && scrapingResult && scrapingResult.status === 'completed' && (showSuccess ? shouldShowResults : true) && (
        <motion.div
          key="results"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ 
            duration: 0.5,
            delay: 0.2,
            ease: "easeOut"
          }}
        >
          <DashboardLayout user={user} onLogout={() => window.location.href = "/api/auth/logout"} title="Job Results">
            <ResultsContent 
              scrapingResult={scrapingResult}
              requestId={requestId}
              showBulkApplyModal={showBulkApplyModal}
              setShowBulkApplyModal={setShowBulkApplyModal}
              userResume={userResume}
            />
          </DashboardLayout>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Separate component for results content to keep the main component cleaner
function ResultsContent({ scrapingResult, requestId, showBulkApplyModal, setShowBulkApplyModal, userResume }: any) {
  // Handle both possible data structures from backend
  let enrichedJobs: any[] = [];
  if (Array.isArray(scrapingResult.enrichedResults)) {
    // If enrichedResults is directly an array
    enrichedJobs = scrapingResult.enrichedResults;
  } else if (scrapingResult.enrichedResults?.jobs && Array.isArray(scrapingResult.enrichedResults.jobs)) {
    // If enrichedResults is an object with jobs property
    enrichedJobs = scrapingResult.enrichedResults.jobs;
  }
  
  // Ensure enrichedJobs is always an array
  if (!Array.isArray(enrichedJobs)) {
    console.warn('enrichedJobs is not an array, defaulting to empty array', enrichedJobs);
    enrichedJobs = [];
  }
  
  // ONLY show jobs where we found hiring manager emails (canApply: true)
  const jobsWithEmails = Array.isArray(enrichedJobs) ? enrichedJobs.filter((job: any) => job.canApply) : [];
  
  // Hide jobs without discoverable emails - this is the core filtering logic
  console.log(`FILTERING: Found ${jobsWithEmails.length} jobs with discoverable emails out of ${enrichedJobs.length} total jobs`);
  
  // Use real data from enrichedResults
  const enrichedResults = scrapingResult.enrichedResults as any;
  const totalJobsFound = enrichedResults?.fakeTotalJobs || 100;
  
  const freeJobs = enrichedResults?.freeJobs || jobsWithEmails.length;
  const lockedJobs = enrichedResults?.lockedJobs || Math.max(0, totalJobsFound - freeJobs);
  
  // Use actual job counts for Pro Plan display
  const proPlanJobs = lockedJobs;

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header with stats */}
        <div className="glass-card p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Search Results</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Request ID: {requestId?.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="w-full md:w-auto h-10 md:h-9">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-3 md:p-4"
            >
              <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:text-left">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-primary">{totalJobsFound.toLocaleString()}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Total Jobs</p>
                </div>
                <Briefcase className="h-6 w-6 md:h-8 md:w-8 text-primary/20 hidden md:block" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-3 md:p-4"
            >
              <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:text-left">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-accent">{jobsWithEmails.length}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">With Contacts (Free Plan)</p>
                </div>
                <Users className="h-6 w-6 md:h-8 md:w-8 text-accent/20 hidden md:block" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Only show jobs with discoverable contact emails */}
        <div className="space-y-4 md:space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Jobs with Discoverable Contact Information</h3>
            <p className="text-muted-foreground">Found {jobsWithEmails.length} jobs where we successfully extracted hiring manager emails</p>
          </div>

          {/* Apply All Button */}
          {jobsWithEmails.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center md:justify-end mb-4"
            >
              <Button
                variant="default"
                size="lg"
                onClick={() => setShowBulkApplyModal(true)}
                className="relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-4 md:px-6 py-2 md:py-3 text-sm md:text-base w-full md:w-auto max-w-xs md:max-w-none"
              >
                <Mail className="h-4 w-4 md:h-5 md:w-5 mr-2 flex-shrink-0" />
                <span className="whitespace-nowrap">Apply to All ({jobsWithEmails.length})</span>
              </Button>
            </motion.div>
          )}
          
          {jobsWithEmails.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-12 text-center"
              >
                <Mail className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Contact Information Found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find hiring manager emails for any of the scraped jobs from this search.
                </p>
                <p className="text-sm text-muted-foreground">
                  💡 Try searching for different job titles or locations to find jobs with discoverable contact information.
                </p>
              </motion.div>
            ) : (
              jobsWithEmails.map((job: any, index: number) => (
                <motion.div
                  key={job.jobUrl || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FilteredJobCard job={job} resumeText={userResume || scrapingResult?.resumeText} />
                </motion.div>
              ))
            )}
          </div>

      {/* Bulk Apply Modal */}
      <BulkApplyModal 
        isOpen={showBulkApplyModal}
        onClose={() => setShowBulkApplyModal(false)}
        jobs={jobsWithEmails}
        resumeText={userResume}
      />
    </motion.div>
  );
}