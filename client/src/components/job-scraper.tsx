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
  Building2,
  Users,
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
      // Handle both possible data structures from backend
      let enrichedJobs: any[] = [];
      if (Array.isArray(scrapingResult.enrichedResults)) {
        enrichedJobs = scrapingResult.enrichedResults;
      } else if (scrapingResult.enrichedResults?.jobs && Array.isArray(scrapingResult.enrichedResults.jobs)) {
        enrichedJobs = scrapingResult.enrichedResults.jobs;
      }
      
      const totalJobs = scrapingResult.totalJobsFound || scrapingResult.results?.length || 0;
      const filteredCount = scrapingResult.filteredResults?.length || 0;
      const enrichedCount = enrichedJobs?.length || 0;
      const withContactsCount = Array.isArray(enrichedJobs) ? enrichedJobs.filter((job: any) => job.contactEmail || job.jobPosterEmail).length : 0;
      
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
    formData.append('resume', file);

    try {
      const response = await fetch('/api/resume/upload', {
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

  // Add typewriter effect for status messages
  const [typewriterText, setTypewriterText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    const text = getStatusMessage();
    if (text !== typewriterText && isProcessing) {
      setIsTyping(true);
      setTypewriterText("");
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setTypewriterText(prev => text.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [getStatusMessage(), isProcessing]);

  // Animated dots for processing text
  const [dotCount, setDotCount] = useState(0);
  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const getProcessingText = () => {
    return "Processing" + ".".repeat(dotCount);
  };

  // Show full-screen loading animation when processing
  if (isProcessing) {
    // LinkedIn logo SVG path
    const linkedInPath = "M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z";

    return (
      <motion.div
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ minHeight: "calc(90vh - 120px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, scale: [0.95, 1] }}
        transition={{ duration: 0.5 }}
      >
        {/* Breathing/Pulsing effect for entire modal */}
        <motion.div
          className="absolute inset-0"
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Animated gradient waves background */}
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            {/* Multiple gradient layers for depth */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: "400% 400%"
              }}
            />
            
            {/* Wave effect layer */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <defs>
                <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              {[0, 1, 2].map((index) => (
                <motion.path
                  key={index}
                  d={`M0,${200 + index * 50} Q${250},${150 + index * 50} ${500},${200 + index * 50} T${1000},${200 + index * 50}`}
                  fill="none"
                  stroke="url(#wave-gradient)"
                  strokeWidth="2"
                  animate={{
                    d: [
                      `M0,${200 + index * 50} Q${250},${150 + index * 50} ${500},${200 + index * 50} T${1000},${200 + index * 50}`,
                      `M0,${200 + index * 50} Q${250},${250 + index * 50} ${500},${200 + index * 50} T${1000},${200 + index * 50}`,
                      `M0,${200 + index * 50} Q${250},${150 + index * 50} ${500},${200 + index * 50} T${1000},${200 + index * 50}`,
                    ]
                  }}
                  transition={{
                    duration: 3 + index,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                />
              ))}
            </svg>

            {/* Enhanced floating orbs with glowing effect */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)",
                filter: "blur(40px)"
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0) 70%)",
                filter: "blur(40px)"
              }}
              animate={{
                x: [0, -100, 0],
                y: [0, 100, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, rgba(236,72,153,0) 70%)",
                filter: "blur(30px)"
              }}
              animate={{
                x: [-100, 100, -100],
                y: [-50, 50, -50],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>

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
                  {/* Enhanced confetti effect */}
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${
                          ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][i % 5]
                        }, ${
                          ['#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#34d399'][i % 5]
                        })`,
                        left: "50%",
                        top: "50%",
                      }}
                      initial={{
                        x: 0,
                        y: 0,
                        opacity: 1,
                        scale: 0,
                      }}
                      animate={{
                        x: (Math.random() - 0.5) * 500,
                        y: (Math.random() - 0.5) * 500,
                        opacity: [1, 1, 0],
                        scale: [0, 1.5, 0],
                        rotate: Math.random() * 720,
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.02,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Loading Container with 3D effect */}
            <div className="text-center space-y-4 sm:space-y-6 perspective-1000">
              <div className="relative inline-block">
                {/* Complex glow layers */}
                <motion.div
                  className="absolute -inset-8 rounded-full opacity-60"
                  style={{
                    background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
                    filter: "blur(20px)"
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Orbiting LinkedIn logos and job icons */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* LinkedIn logos */}
                  {[0, 120, 240].map((rotation, index) => (
                    <motion.div
                      key={`linkedin-${index}`}
                      className="absolute"
                      style={{
                        width: "150px",
                        height: "150px",
                      }}
                      animate={{
                        rotate: rotation + 360,
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <motion.div
                        className="absolute"
                        style={{
                          top: "-20px",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                        animate={{
                          rotate: -(rotation + 360),
                          scale: [0.8, 1, 0.8],
                        }}
                        transition={{
                          rotate: {
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                          },
                          scale: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.3,
                          }
                        }}
                      >
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">in</span>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                  
                  {/* Job-related icons orbiting */}
                  {[
                    { Icon: Briefcase, rotation: 60, color: "from-purple-500 to-purple-600" },
                    { Icon: Building2, rotation: 180, color: "from-pink-500 to-pink-600" },
                    { Icon: Users, rotation: 300, color: "from-amber-500 to-amber-600" },
                  ].map(({ Icon, rotation, color }, index) => (
                    <motion.div
                      key={`icon-${index}`}
                      className="absolute"
                      style={{
                        width: "120px",
                        height: "120px",
                      }}
                      animate={{
                        rotate: rotation - 360,
                      }}
                      transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <motion.div
                        className={`absolute p-2 rounded-full bg-gradient-to-br ${color} shadow-lg`}
                        style={{
                          top: "-15px",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                        animate={{
                          rotate: -(rotation - 360),
                          y: [0, -5, 0],
                        }}
                        transition={{
                          rotate: {
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear",
                          },
                          y: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.4,
                          }
                        }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
                
                {/* 3D magnifying glass with perspective */}
                <motion.div
                  className="relative preserve-3d"
                  animate={{ 
                    rotateY: [0, 360],
                    rotateX: [-10, 10, -10],
                  }}
                  transition={{
                    rotateY: {
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    },
                    rotateX: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Search className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-primary relative z-10 drop-shadow-2xl" />
                  </motion.div>
                  
                  {/* Sparkles around magnifying glass */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeOut"
                      }}
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${10 + i * 15}%`,
                      }}
                    >
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 drop-shadow-lg" />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div className="space-y-3">
                {/* Typewriter effect for status message */}
                <motion.h2 
                  className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                >
                  <span className="inline-block">
                    {typewriterText}
                    {isTyping && (
                      <motion.span
                        className="inline-block w-0.5 h-6 sm:h-7 lg:h-8 bg-current ml-1 align-middle"
                        animate={{ opacity: [1, 1, 0, 0] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          times: [0, 0.5, 0.5, 1],
                          ease: "linear"
                        }}
                      />
                    )}
                  </span>
                </motion.h2>
                <motion.p 
                  className="text-sm sm:text-base lg:text-lg text-muted-foreground px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {getEstimatedTime()}
                </motion.p>
              </div>
            </div>

            {/* Enhanced Progress Bar with liquid wave effect */}
            <div className="relative">
              {/* Particle effects floating upward from progress bar */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
                    initial={{
                      x: `${(animatedProgress - 5 + i * 2)}%`,
                      y: "50%",
                      opacity: 0,
                    }}
                    animate={{
                      y: [20, -40],
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>

              {/* Enhanced glow effect */}
              <motion.div 
                className="absolute -inset-2 rounded-full opacity-60"
                style={{
                  background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
                  filter: "blur(15px)",
                }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [0.98, 1.02, 0.98],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <div className="relative bg-background/80 backdrop-blur-xl rounded-full p-4 sm:p-6 border border-primary/20 shadow-2xl">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <motion.span 
                      className="text-sm font-medium flex items-center gap-2"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                        style={{
                          background: "radial-gradient(circle, #10b981, #34d399)",
                          boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)"
                        }}
                        animate={{ 
                          scale: [1, 1.5, 1],
                          boxShadow: [
                            "0 0 10px rgba(16, 185, 129, 0.5)",
                            "0 0 20px rgba(16, 185, 129, 0.8)",
                            "0 0 10px rgba(16, 185, 129, 0.5)",
                          ]
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      {getProcessingText()}
                    </motion.span>
                    <motion.span 
                      className="text-lg sm:text-xl lg:text-2xl font-bold"
                      key={getProgressPercentage()}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: 1,
                      }}
                      transition={{ 
                        scale: {
                          duration: 0.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        },
                        opacity: {
                          duration: 0.3
                        }
                      }}
                      style={{
                        background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
                      }}
                    >
                      {getProgressPercentage()}%
                    </motion.span>
                  </div>
                  
                  {/* Liquid wave progress bar */}
                  <div className="relative h-4 sm:h-6 bg-secondary/30 rounded-full overflow-hidden shadow-inner">
                    {/* Wave background pattern */}
                    <svg className="absolute inset-0 w-full h-full">
                      <defs>
                        <pattern id="wave-pattern" x="0" y="0" width="40" height="100%" patternUnits="userSpaceOnUse">
                          <motion.path
                            d="M0,12 Q10,6 20,12 T40,12"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                            animate={{
                              d: ["M0,12 Q10,6 20,12 T40,12", "M0,12 Q10,18 20,12 T40,12", "M0,12 Q10,6 20,12 T40,12"]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#wave-pattern)" />
                    </svg>
                    
                    <motion.div
                      className="absolute inset-0"
                      style={{ 
                        width: `${animatedProgress}%`,
                        background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      {/* Liquid wave effect on top */}
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                        }}
                        animate={{ 
                          x: ["-200%", "200%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                      
                      {/* Wave animation at the edge */}
                      <motion.div
                        className="absolute right-0 top-0 bottom-0 w-8"
                        animate={{
                          scaleY: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4))",
                          filter: "blur(4px)"
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic message with enhanced animation */}
            <motion.div
              className="text-center"
              key={dynamicMessage}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <p className="text-muted-foreground italic text-sm sm:text-base px-2 leading-relaxed">
                {dynamicMessage}
              </p>
            </motion.div>

            {/* Cancel Button with enhanced styling */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, type: "spring" }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAbort}
                  className="gap-2 text-sm sm:text-base px-4 sm:px-6 h-10 sm:h-12 border-2 hover:shadow-lg transition-all"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Cancel Search</span>
                  <span className="sm:hidden">Cancel</span>
                </Button>
              </motion.div>
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
