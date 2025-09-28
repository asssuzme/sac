import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { linkedinUrlSchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link,
  Search,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Activity,
  Sparkles,
  Globe,
  Zap,
  MapPin,
  Briefcase,
  Lock,
  Filter,
  Mail,
  Lightbulb,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { ModernAutocomplete } from "@/components/ui/modern-autocomplete";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { DotsLoader } from "@/components/ui/loading-animations";
import { JobSearchForm } from "@/components/job-search-form";

interface JobScrapingResponse {
  id: string;
  status: "pending" | "processing" | "filtering" | "enriching" | "completed" | "failed";
  errorMessage?: string;
  results?: any;
  filteredResults?: any;
  enrichedResults?: any;
  totalJobsFound?: number;
}

// Define new schema for job search form
const jobSearchSchema = z.object({
  keyword: z.string().min(1, "Job keyword is required"),
  location: z.string().min(1, "Location is required"),
  workType: z.string().min(1, "Please select a work type"),
  jobCount: z.number().optional().default(100),
});

type JobSearchFormData = z.infer<typeof jobSearchSchema>;

// Predefined job roles with categories
const jobRoles = [
  { value: "Software Engineer", label: "Software Engineer", category: "Engineering" },
  { value: "Full Stack Developer", label: "Full Stack Developer", category: "Engineering" },
  { value: "Frontend Developer", label: "Frontend Developer", category: "Engineering" },
  { value: "Backend Developer", label: "Backend Developer", category: "Engineering" },
  { value: "DevOps Engineer", label: "DevOps Engineer", category: "Engineering" },
  { value: "Machine Learning Engineer", label: "Machine Learning Engineer", category: "Engineering" },
  { value: "Quality Assurance Engineer", label: "Quality Assurance Engineer", category: "Engineering" },
  { value: "Solutions Architect", label: "Solutions Architect", category: "Engineering" },
  { value: "Cloud Engineer", label: "Cloud Engineer", category: "Engineering" },
  { value: "Data Scientist", label: "Data Scientist", category: "Data & Analytics" },
  { value: "Data Analyst", label: "Data Analyst", category: "Data & Analytics" },
  { value: "Business Analyst", label: "Business Analyst", category: "Data & Analytics" },
  { value: "Product Manager", label: "Product Manager", category: "Product & Design" },
  { value: "UI/UX Designer", label: "UI/UX Designer", category: "Product & Design" },
  { value: "Technical Writer", label: "Technical Writer", category: "Product & Design" },
  { value: "Project Manager", label: "Project Manager", category: "Management" },
  { value: "Marketing Manager", label: "Marketing Manager", category: "Management" },
  { value: "Sales Executive", label: "Sales Executive", category: "Management" },
  { value: "HR Manager", label: "HR Manager", category: "Management" },
  { value: "Account Manager", label: "Account Manager", category: "Management" },
];

// Predefined locations with categories
const locations = [
  // Major Indian Cities
  { value: "Bengaluru", label: "Bengaluru (Bangalore)", category: "India - Major Cities" },
  { value: "Mumbai", label: "Mumbai", category: "India - Major Cities" },
  { value: "Delhi", label: "Delhi", category: "India - Major Cities" },
  { value: "Chennai", label: "Chennai", category: "India - Major Cities" },
  { value: "Hyderabad", label: "Hyderabad", category: "India - Major Cities" },
  { value: "Kolkata", label: "Kolkata", category: "India - Major Cities" },
  { value: "Pune", label: "Pune", category: "India - Major Cities" },
  { value: "Ahmedabad", label: "Ahmedabad", category: "India - Major Cities" },
  { value: "Noida", label: "Noida", category: "India - NCR" },
  { value: "Gurugram", label: "Gurugram (Gurgaon)", category: "India - NCR" },
  { value: "Jaipur", label: "Jaipur", category: "India - Other Cities" },
  { value: "Lucknow", label: "Lucknow", category: "India - Other Cities" },
  { value: "Indore", label: "Indore", category: "India - Other Cities" },
  { value: "Kochi", label: "Kochi", category: "India - Other Cities" },
  { value: "Chandigarh", label: "Chandigarh", category: "India - Other Cities" },
  { value: "Bhopal", label: "Bhopal", category: "India - Other Cities" },
  { value: "Nagpur", label: "Nagpur", category: "India - Other Cities" },
  { value: "Visakhapatnam", label: "Visakhapatnam", category: "India - Other Cities" },
  { value: "Surat", label: "Surat", category: "India - Other Cities" },
  { value: "Vadodara", label: "Vadodara", category: "India - Other Cities" },
  // International Cities
  { value: "Singapore", label: "Singapore", category: "Asia Pacific" },
  { value: "Dubai", label: "Dubai, UAE", category: "Middle East" },
  { value: "London", label: "London, UK", category: "Europe" },
  { value: "Berlin", label: "Berlin, Germany", category: "Europe" },
  { value: "New York", label: "New York, USA", category: "North America" },
  { value: "San Francisco", label: "San Francisco, USA", category: "North America" },
  { value: "Seattle", label: "Seattle, USA", category: "North America" },
  { value: "Toronto", label: "Toronto, Canada", category: "North America" },
  { value: "Sydney", label: "Sydney, Australia", category: "Asia Pacific" },
  { value: "Tokyo", label: "Tokyo, Japan", category: "Asia Pacific" },
];

interface JobScraperProps {
  onComplete?: (requestId: string) => void;
}

export function JobScraper({ onComplete }: JobScraperProps = {}) {
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [hasExistingResume, setHasExistingResume] = useState(false);
  const [isAborted, setIsAborted] = useState(false);
  const abortRef = useRef(false); // Use ref for immediate abort tracking
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<JobSearchFormData>({
    resolver: zodResolver(jobSearchSchema),
    defaultValues: {
      keyword: "",
      location: "",
      workType: "1",
      jobCount: 100,
    },
    mode: "onChange", // Validate on change to clear errors immediately
  });

  // Check for existing resume on component mount
  useEffect(() => {
    const checkExistingResume = async () => {
      try {
        const response = await fetch('/api/user/resume', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (data.hasResume && data.resumeText) {
            setResumeText(data.resumeText);
            setResumeFileName(data.fileName || 'Saved Resume');
            setHasExistingResume(true);
            toast({
              title: "Resume Loaded",
              description: "Your saved resume has been loaded automatically."
            });
          } else {
            setHasExistingResume(false);
          }
        }
      } catch (error) {
        console.error("Error checking for existing resume:", error);
        setHasExistingResume(false);
      } finally {
        setIsLoadingResume(false);
      }
    };

    checkExistingResume();
  }, [toast]);

  // Scrape mutation
  const scrapeMutation = useMutation({
    mutationFn: async (data: { keyword: string; location: string; workType: string; jobCount?: number; resumeText?: string }) => {
      // First, generate the LinkedIn URL
      const urlResponse = await apiRequest('/api/generate-linkedin-url', {
        method: 'POST',
        body: JSON.stringify({
          keyword: data.keyword,
          location: data.location,
          workType: data.workType
        })
      });

      if (!urlResponse.linkedinUrl) {
        throw new Error(urlResponse.error || "Failed to generate LinkedIn URL");
      }

      // Show location normalization info if available
      if (urlResponse.message) {
        toast({
          title: "Location Normalized",
          description: urlResponse.message,
        });
      }

      // Then, start the scraping process with the generated URL
      const response = await apiRequest('/api/scrape-job', {
        method: 'POST',
        body: JSON.stringify({
          linkedinUrl: urlResponse.linkedinUrl,
          resumeText: data.resumeText,
          jobCount: data.jobCount || 100
        }),
      });
      return response;
    },
    onSuccess: (data) => {
      // Reset abort flags when starting new search
      abortRef.current = false;
      setIsAborted(false);
      setCurrentRequestId(data.requestId);
      toast({
        title: "Search Started",
        description: "Searching for job listings..."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start job search",
        variant: "destructive",
      });
    },
  });

  // Status polling
  const { data: scrapingResult, isLoading: isPolling } = useQuery<JobScrapingResponse>({
    queryKey: [`/api/scrape-job/${currentRequestId}`],
    enabled: !!currentRequestId && !isAborted && !abortRef.current,
    refetchInterval: ({ state }) => {
      // Check ref for immediate abort
      if (abortRef.current || isAborted || !currentRequestId) return false;
      const status = state.data?.status;
      return status === 'pending' || status === 'processing' || status === 'filtering' || status === 'enriching' ? 2000 : false;
    },
    gcTime: 0, // Don't cache aborted queries
    staleTime: 0, // Always fetch fresh data
  });

  // Handle completion
  useEffect(() => {
    if (isAborted) return; // Don't process completion if aborted
    
    if (scrapingResult?.status === 'completed' && scrapingResult.enrichedResults) {
      const enrichedJobs = scrapingResult.enrichedResults as any[];
      const totalJobs = scrapingResult.totalJobsFound || scrapingResult.results?.length || 0;
      const filteredCount = scrapingResult.filteredResults?.length || 0;
      const enrichedCount = enrichedJobs?.length || 0;
      const withContactsCount = enrichedJobs?.filter((job: any) => job.contactEmail || job.jobPosterEmail).length || 0;
      
      // Show completion message
      toast({
        title: "Search Complete",
        description: `Found ${totalJobs} jobs, filtered to ${filteredCount} quality leads, enriched ${withContactsCount} with contact emails`
      });

      // Invalidate dashboard stats to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(scrapingResult.id);
      }

    }
  }, [scrapingResult, onComplete, toast, isAborted]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      setResumeText(data.text);
      setResumeFileName(file.name);
      setHasExistingResume(true); // Mark that user now has a resume
      toast({
        title: "Resume Uploaded & Saved",
        description: `${file.name} has been saved to your account. You won't need to upload it again.`
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process file",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (data: JobSearchFormData) => {
    // Check if resume is required (for first-time users)
    if (!hasExistingResume && !resumeText) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume to start your first job search.",
        variant: "destructive",
      });
      return;
    }

    // The form data is already validated by react-hook-form + zod
    scrapeMutation.mutate({ 
      keyword: data.keyword,
      location: data.location,
      workType: data.workType,
      jobCount: data.jobCount || 100,
      resumeText: resumeText || undefined
    });
  };

  const isProcessing = !isAborted && (
    scrapeMutation.isPending || 
    (currentRequestId && !scrapingResult) || // Loading the scraping result
    (scrapingResult && ['pending', 'processing', 'filtering', 'enriching'].includes(scrapingResult.status))
  );

  // Use state for smooth progress animation
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [dynamicMessage, setDynamicMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Rotating messages
  const rotatingMessages = [
    "This might take a few minutes — we're pulling thousands of listings.",
    "Our AI is scanning for the best matches.",
    "Almost there — mapping contacts to companies.",
    "Hang tight — good things take time 🚀."
  ];

  // Update progress smoothly over 4 minutes
  useEffect(() => {
    if (!isProcessing || isAborted) {
      setAnimatedProgress(0);
      setStartTime(null);
      setShowSuccess(false);
      return;
    }

    // Set start time when processing begins
    if (!startTime) {
      setStartTime(Date.now());
    }

    const totalDuration = 4 * 60 * 1000; // 4 minutes in milliseconds
    const interval = setInterval(() => {
      if (!startTime || isAborted) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / totalDuration) * 100, 99); // Cap at 99% until actually complete
      
      // If actually completed, jump to 100%
      if (scrapingResult?.status === 'completed') {
        setAnimatedProgress(100);
        setShowSuccess(true);
        clearInterval(interval);
      } else {
        setAnimatedProgress(progress);
      }
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [isProcessing, startTime, scrapingResult?.status, isAborted]);

  // Rotate dynamic messages
  useEffect(() => {
    if (!isProcessing || isAborted) return;

    let messageIndex = 0;
    setDynamicMessage(rotatingMessages[0]);

    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % rotatingMessages.length;
      setDynamicMessage(rotatingMessages[messageIndex]);
    }, 25000); // Change message every 25 seconds

    return () => clearInterval(interval);
  }, [isProcessing, isAborted]);

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

  // Handle abort
  const handleAbort = async () => {
    // Set ref immediately for instant abort
    abortRef.current = true;
    setIsAborted(true);
    
    // Cancel ALL scrape-job queries
    queryClient.cancelQueries({ 
      predicate: (query) => {
        return query.queryKey[0]?.toString().includes('/api/scrape-job') || false;
      }
    });
    
    // Remove ALL scrape-job queries from cache
    queryClient.removeQueries({ 
      predicate: (query) => {
        return query.queryKey[0]?.toString().includes('/api/scrape-job') || false;
      }
    });
    
    // Call backend to abort Apify actors
    if (currentRequestId) {
      try {
        await apiRequest(`/api/scrape-job/${currentRequestId}/abort`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Failed to abort Apify actors:', error);
      }
    }
    
    // Clear the request ID to prevent any further polling
    setCurrentRequestId(null);
    setAnimatedProgress(0);
    
    toast({
      title: "Search Aborted",
      description: "Job search has been cancelled",
    });
  };

  // Show full-screen loading animation when processing
  if (isProcessing) {
    return (
      <motion.div
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ minHeight: "calc(90vh - 120px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
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
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-sm sm:max-w-lg lg:max-w-2xl px-4">
          <motion.div 
            className="space-y-6 sm:space-y-8"
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
            <div className="text-center space-y-4 sm:space-y-6">
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
                  <Search className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-primary relative z-10" />
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
                        ease: "easeOut"
                      }}
                      style={{
                        left: `${30 + i * 20}%`,
                        top: `${20 + i * 15}%`,
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <div className="space-y-3">
                <motion.h2 
                  className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  key={getStatusMessage()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {getStatusMessage()}
                </motion.h2>
                <motion.p 
                  className="text-sm sm:text-base lg:text-lg text-muted-foreground px-2"
                  key={getEstimatedTime()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {getEstimatedTime()}
                </motion.p>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="relative">
              {/* Glow effect */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-75"
                animate={{
                  opacity: [0.5, 0.75, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <div className="relative bg-background/80 backdrop-blur-xl rounded-full p-4 sm:p-6 border border-primary/20">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <motion.span 
                      className="text-sm font-medium flex items-center gap-2"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        className="w-2 h-2 bg-green-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      Processing
                    </motion.span>
                    <motion.span 
                      className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                      key={getProgressPercentage()}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {getProgressPercentage()}%
                    </motion.span>
                  </div>
                  
                  <div className="relative h-4 sm:h-6 bg-secondary/30 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                      style={{ width: `${animatedProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      {/* Animated shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </motion.div>
                    
                    {/* Progress bar glow at the end */}
                    <motion.div
                      className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 blur-md"
                      style={{ left: `${animatedProgress - 2}%` }}
                    />
                  </div>
                </div>
              </div>
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
              <p className="text-muted-foreground italic text-sm sm:text-base px-2">{dynamicMessage}</p>
            </motion.div>

            {/* Cancel Button */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={handleAbort}
                className="gap-2 text-sm sm:text-base px-4 sm:px-6 h-10 sm:h-12"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Cancel Search</span>
                <span className="sm:hidden">Cancel</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <JobSearchForm
      onSubmit={handleSubmit}
      isProcessing={isProcessing}
      hasExistingResume={hasExistingResume}
      resumeContent={
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          {isLoadingResume ? (
            <div className="glass-card p-3 sm:p-4 border border-primary/20 min-h-[80px] sm:min-h-[100px] flex items-center justify-center">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm sm:text-base">Loading your saved resume...</span>
              </div>
            </div>
          ) : hasExistingResume ? (
            <div className="glass-card p-3 sm:p-4 border border-green-500/20 bg-green-500/5 min-h-[80px] sm:min-h-[100px] flex items-center">
              <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-3 rounded-full bg-green-500/10 flex-shrink-0">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-green-800 dark:text-green-200 text-sm sm:text-base truncate">
                      {resumeFileName || 'Resume Loaded'}
                    </p>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
                      Your saved resume will be used automatically
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/settings', '_blank')}
                  className="text-xs border-green-500/30 text-green-700 dark:text-green-300 hover:bg-green-500/10 w-full sm:w-auto"
                >
                  Change in Settings
                </Button>
              </div>
            </div>
          ) : (
            <div className={`glass-card p-3 sm:p-4 border-dashed border-2 transition-all cursor-pointer group min-h-[80px] sm:min-h-[100px] flex items-center ${
              !resumeText ? 'border-red-500/30 hover:border-red-500/50' : 'border-primary/20 hover:border-primary/40'
            }`}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3"
                disabled={isProcessing}
              >
                <div className="p-2 sm:p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm sm:text-base">Drop your resume here</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    <span className="text-red-500">Required for first search</span> • Supports .txt, .pdf, and image files
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Will be saved to your account for future searches
                  </p>
                </div>
              </button>
            </div>
          )}
        </motion.div>
      }
    />
  );
}
