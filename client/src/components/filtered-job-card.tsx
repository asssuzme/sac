import { useState, useRef, useEffect } from "react";
import { FilteredJobData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ExternalLink, User, Briefcase, DollarSign, Mail, CheckCircle, XCircle, Send, Loader2, Sparkles, Globe, Building, Clock, Shield, Users } from "lucide-react";
import { CompanyProfileModal } from "./company-profile-modal";
import { EmailComposerModal } from "./email-composer-modal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { getRelativeTime } from "@/lib/time-utils";
import { useToast } from "@/hooks/use-toast";

interface FilteredJobCardProps {
  job: FilteredJobData;
  resumeText?: string | null;
}

export function FilteredJobCard({ job, resumeText }: FilteredJobCardProps) {
  const { toast } = useToast();
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showGmailAuth, setShowGmailAuth] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [applyStep, setApplyStep] = useState<'idle' | 'checking-gmail' | 'scraping-company' | 'generating-email' | 'ready'>('idle');
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [hasCheckedAutoApply, setHasCheckedAutoApply] = useState(false);

  // Check Gmail authorization status - fetch once on mount and cache
  const { data: gmailStatus, refetch: refetchGmailStatus } = useQuery({
    queryKey: ['/api/auth/gmail/status'],
    enabled: true, // Always fetch to keep status updated
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  }) as { data?: { authorized?: boolean; needsRefresh?: boolean; isConnected?: boolean; email?: string }; refetch: () => Promise<any> };

  const companyMutation = useMutation({
    mutationFn: async (companyLinkedinUrl: string) => {
      return await apiRequest('/api/scrape-company', {
        method: 'POST',
        body: JSON.stringify({ companyLinkedinUrl })
      });
    },
    onSuccess: async (data) => {
      if (data.success) {
        setCompanyProfile(data.company);
        // After company data is loaded, generate the email
        // The email composer will be shown automatically after generation
        await generateApplicationEmail(data.company);
      } else {
        // Company scraping failed, generate email without company data
        console.warn('Company scraping failed, generating email without company data');
        setShowLoadingModal(false);
        await generateApplicationEmail(null);
      }
    },
    onError: async (error) => {
      console.error('Company scraping error:', error);
      // Fallback: generate email without company data
      setShowLoadingModal(false);
      await generateApplicationEmail(null);
    },
  });

  const generateApplicationEmail = async (companyData: any) => {
    setIsGeneratingEmail(true);
    setApplyStep('generating-email');
    
    try {
      const jobPosterData = {
        name: job.jobPosterName || "Hiring Manager",
        headline: job.jobPosterName ? `Professional at ${job.companyName}` : "",
        about: ""
      };

      const requestBody = {
        companyData: companyData || { name: job.companyName },
        jobPosterData,
        jobDescription: job.requirement || `${job.title} position at ${job.companyName}`,
        jobTitle: job.title,
        recipientEmail: job.jobPosterEmail || "",
        resumeText: resumeText
      };

      const data = await apiRequest('/api/generate-email', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      if (data.success) {
        setGeneratedEmail(data.email);
        setApplyStep('ready');
        // Close any loading modals
        setShowCompanyModal(false);
        setShowLoadingModal(false);
        // Show the email composer with generated email
        setShowEmailComposer(true);
      } else {
        console.error("Email generation failed:", data.error);
        setApplyStep('idle');
        setShowLoadingModal(false);
        alert(`Email generation failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error("Error generating email:", error);
      setApplyStep('idle');
      setShowLoadingModal(false);
      alert(`Error generating email: ${error.message || 'Please check if you are logged in'}`);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleApplyClick = async () => {
    try {
      // Step 1: Check Gmail authorization using cached status first
      setApplyStep('checking-gmail');
      
      // Use cached status if available, otherwise refetch
      let status = gmailStatus;
      if (!status) {
        const result = await refetchGmailStatus();
        status = result?.data as any;
      }
      
      // Only show auth prompt if user truly hasn't authorized Gmail yet
      if (!status?.authorized && !status?.isConnected) {
        // User needs Gmail authorization first
        setApplyStep('idle');
        setShowGmailAuth(true);
        return;
      }
      
      // If credentials exist but need refresh, try to proceed anyway
      // The backend will handle token refresh automatically

      // Step 2: Scrape company data if available
      if (job.companyLinkedinUrl) {
        setApplyStep('scraping-company');
        setShowLoadingModal(true);
        companyMutation.mutate(job.companyLinkedinUrl);
      } else {
        // Step 3: Generate email directly
        setApplyStep('generating-email');
        setShowLoadingModal(true);
        await generateApplicationEmail(null);
      }
    } catch (error) {
      console.error('Error in apply flow:', error);
      setApplyStep('idle');
      // Fallback: show email composer with empty email
      setShowEmailComposer(true);
    }
  };

  const handleProceedToApply = () => {
    setShowCompanyModal(false);
    setShowEmailComposer(true);
  };

  const handleRegenerateEmail = () => {
    // Prevent multiple concurrent requests
    if (isGeneratingEmail || applyStep !== 'idle') {
      console.log("Email generation already in progress");
      return;
    }
    
    // Reset generated email and regenerate
    setGeneratedEmail("");
    setApplyStep('generating-email');
    
    // Generate email immediately without delay
    if (job.companyLinkedinUrl && !companyProfile) {
      setApplyStep('scraping-company');
      companyMutation.mutate(job.companyLinkedinUrl);
    } else {
      generateApplicationEmail(companyProfile);
    }
  };
  const handleViewJob = () => {
    window.open(job.link, "_blank", "noopener,noreferrer");
  };

  const handleViewCompany = () => {
    window.open(job.companyWebsite, "_blank", "noopener,noreferrer");
  };

  const handleViewCompanyLinkedIn = () => {
    window.open(job.companyLinkedinUrl, "_blank", "noopener,noreferrer");
  };
  
  // Handle auto-apply after Gmail authorization
  useEffect(() => {
    if (hasCheckedAutoApply) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const autoApply = urlParams.get('auto_apply') === 'true';
    const gmailSuccess = urlParams.get('gmail') === 'success';
    
    if (autoApply && gmailSuccess) {
      setHasCheckedAutoApply(true);
      
      // Check if this is the correct job from session storage
      const pendingJobData = sessionStorage.getItem('pendingApplyJob');
      if (pendingJobData) {
        const { job: storedJob } = JSON.parse(pendingJobData);
        
        // Check if this is the same job
        if (storedJob.companyName === job.companyName && storedJob.title === job.title) {
          // Clear the stored data
          sessionStorage.removeItem('pendingApplyJob');
          
          // Clean up URL parameters
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('gmail');
          newUrl.searchParams.delete('auto_apply');
          window.history.replaceState({}, document.title, newUrl.toString());
          
          // Automatically trigger the apply flow
          setTimeout(() => {
            if (job.companyLinkedinUrl) {
              setApplyStep('scraping-company');
              setShowLoadingModal(true);
              companyMutation.mutate(job.companyLinkedinUrl);
            } else {
              setApplyStep('generating-email');
              setShowLoadingModal(true);
              generateApplicationEmail(null);
            }
          }, 500);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCheckedAutoApply, job.companyName, job.title, job.companyLinkedinUrl]);

  const handleViewPoster = () => {
    if (job.jobPosterLinkedinUrl) {
      window.open(job.jobPosterLinkedinUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Extract company from recruiter title if available (define function first)
  const getRecruiterCompany = () => {
    if (!job.jobPosterTitle) return null;
    // Handle both "@ Company" and "at Company" patterns
    const atMatch = job.jobPosterTitle.match(/\s+at\s+([^|]+)/i);
    const symbolMatch = job.jobPosterTitle.match(/@\s*([^|]+)/);
    const match = atMatch || symbolMatch;
    return match ? match[1].trim() : null;
  };

  // Detect EXTERNAL recruiters (not internal HR) based on title patterns and company context
  const isExternalRecruiter = job.jobPosterTitle && (
    job.jobPosterTitle.toLowerCase().includes('talent acquisition') ||
    job.jobPosterTitle.toLowerCase().includes('recruiter') ||
    job.jobPosterTitle.toLowerCase().includes('ta consultant') ||
    job.jobPosterTitle.toLowerCase().includes('ta professional') ||
    job.jobPosterTitle.toLowerCase().includes('talent scout') ||
    job.jobPosterTitle.toLowerCase().includes('talent specialist') ||
    job.jobPosterTitle.toLowerCase().includes('tech-recruitment') ||
    job.jobPosterTitle.toLowerCase().includes('technical recruitment') ||
    // Match TA Group/Team patterns
    (job.jobPosterTitle.toLowerCase().includes('ta') && (
      job.jobPosterTitle.toLowerCase().includes('group') ||
      job.jobPosterTitle.toLowerCase().includes('team')
    ))
  );
  
  // Check if this is likely an external recruitment agency
  const recruiterCompany = getRecruiterCompany();
  const isRecruiter = isExternalRecruiter && (
    // Has company context different from job company (external agency)
    (recruiterCompany && recruiterCompany.toLowerCase() !== job.companyName.toLowerCase()) ||
    // Or is clearly an external recruiter based on title alone
    (job.jobPosterTitle && job.jobPosterTitle.toLowerCase().includes('recruitment'))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass-card p-4 md:p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 md:gap-4 min-w-0">
          {job.companyLogo ? (
            <img 
              src={job.companyLogo} 
              alt={`${job.companyName} logo`} 
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover ring-2 ring-primary/10 flex-shrink-0" 
            />
          ) : (
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              <Building className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 
              className="text-base md:text-lg font-semibold hover:text-primary transition-colors cursor-pointer mb-2 flex items-start gap-2"
              onClick={handleViewJob}
            >
              <span className="line-clamp-2">{job.title}</span>
              <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hidden md:block" />
            </h3>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mb-3">
              <span 
                className="font-medium hover:text-primary cursor-pointer transition-colors flex items-center gap-1"
                onClick={handleViewCompany}
              >
                <Building className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{job.companyName}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </span>
              {job.postedDate && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{getRelativeTime(job.postedDate)}</span>
                </span>
              )}
              {job.salaryInfo && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{job.salaryInfo}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end md:justify-start md:flex-shrink-0">
          {job.canApply ? (
            <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold text-xs md:text-sm whitespace-nowrap">
              <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="hidden sm:inline">Can Apply</span>
              <span className="sm:hidden">Apply</span>
            </Badge>
          ) : (
            <Badge className="bg-muted text-muted-foreground border-muted font-semibold text-xs md:text-sm whitespace-nowrap">
              <XCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="hidden sm:inline">Cannot Apply</span>
              <span className="sm:hidden">No</span>
            </Badge>
          )}
          {job.canApply && (
            <Button 
              size="sm" 
              className="tech-btn text-xs md:text-sm"
              onClick={handleApplyClick}
              disabled={applyStep !== 'idle'}
            >
              {applyStep === 'idle' && (
                <>
                  <Send className="h-3 w-3 mr-1" />
                  Apply
                </>
              )}
              {applyStep === 'checking-gmail' && (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Checking Gmail...
                </>
              )}
              {applyStep === 'scraping-company' && (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Loading Company...
                </>
              )}
              {applyStep === 'generating-email' && (
                <>
                  <Sparkles className="h-3 w-3 mr-1 animate-pulse" />
                  Generating Email...
                </>
              )}
              {applyStep === 'ready' && (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {job.requirement && (
        <div className="mb-4">
          <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
            {job.requirement}
          </p>
        </div>
      )}
      
      {job.jobPosterName && (
        <div className="mb-4 p-3 md:p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div className="flex items-center space-x-2 min-w-0">
              {isRecruiter ? (
                <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                {isRecruiter ? 'External Recruiter:' : 'Job Poster:'}
              </span>
              <div className="flex items-center gap-2">
                <span 
                  className="text-xs md:text-sm text-primary hover:underline cursor-pointer transition-colors truncate"
                  onClick={handleViewPoster}
                >
                  {job.jobPosterName}
                </span>
                {isRecruiter && (
                  <Badge 
                    variant="secondary" 
                    className="bg-blue-50 text-blue-700 border-blue-200 text-xs flex-shrink-0"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    Recruiter
                  </Badge>
                )}
              </div>
            </div>
            {job.jobPosterLinkedinUrl && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleViewPoster}
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {/* Recruiter Context */}
          {isRecruiter && recruiterCompany && (
            <div className="mb-2 p-2 bg-blue-50 rounded-md border border-blue-100">
              <p className="text-xs text-blue-700">
                <Building className="h-3 w-3 inline mr-1" />
                <strong>Recruiting for:</strong> {recruiterCompany}
                <span className="ml-2 text-blue-600">• External recruitment agency</span>
              </p>
            </div>
          )}
          
          {/* Job Poster Title */}
          {job.jobPosterTitle && (
            <div className="mb-2">
              <p className="text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3 inline mr-1" />
                {job.jobPosterTitle}
              </p>
            </div>
          )}
          {job.jobPosterEmail && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm font-medium">Email:</span>
                </div>
                <a 
                  href={`mailto:${job.jobPosterEmail}`}
                  className="text-xs md:text-sm text-primary hover:underline transition-colors break-all"
                >
                  {job.jobPosterEmail}
                </a>
                {job.emailVerificationStatus && (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs self-start sm:self-auto ${
                      job.emailVerificationStatus === 'valid' 
                        ? 'bg-primary/10 text-primary' 
                        : job.emailVerificationStatus === 'catch-all' 
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : job.emailVerificationStatus === 'error'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {job.emailVerificationStatus}
                  </Badge>
                )}
              </div>
              {job.emailVerificationStatus && (
                <div className="flex items-center space-x-2">
                  {job.emailVerificationStatus === 'valid' && (
                    <Button 
                      size="sm" 
                      className="tech-btn"
                      onClick={handleApplyClick}
                      disabled={applyStep !== 'idle'}
                    >
                      {applyStep === 'idle' && (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Apply
                        </>
                      )}
                      {applyStep === 'checking-gmail' && (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Checking...
                        </>
                      )}
                      {applyStep === 'scraping-company' && (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Loading...
                        </>
                      )}
                      {applyStep === 'generating-email' && (
                        <>
                          <Sparkles className="h-3 w-3 mr-1 animate-pulse" />
                          Generating...
                        </>
                      )}
                      {applyStep === 'ready' && (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ready
                        </>
                      )}
                    </Button>
                  )}
                  {job.emailVerificationStatus === 'catch-all' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-yellow-600 text-yellow-600 hover:bg-yellow-500/10"
                      onClick={handleApplyClick}
                      disabled={applyStep !== 'idle'}
                    >
                      {applyStep === 'idle' && (
                        <>
                          <Mail className="h-3 w-3 mr-1" />
                          Risky Apply
                        </>
                      )}
                      {applyStep !== 'idle' && (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Processing...
                        </>
                      )}
                    </Button>
                  )}
                  {job.emailVerificationStatus === 'error' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-muted-foreground text-muted-foreground hover:bg-muted"
                      onClick={handleApplyClick}
                      disabled={applyStep !== 'idle'}
                    >
                      {applyStep === 'idle' && (
                        <>
                          <Mail className="h-3 w-3 mr-1" />
                          Generate Email
                        </>
                      )}
                      {applyStep !== 'idle' && (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Processing...
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-3 text-sm">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewCompany}
            className="hover:bg-secondary transition-all duration-300"
          >
            <Briefcase className="h-3 w-3 mr-1" />
            Company
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewCompanyLinkedIn}
            className="text-primary hover:bg-primary/10 transition-all duration-300"
          >
            LinkedIn
          </Button>
        </div>
        <Button 
          onClick={handleViewJob}
          size="sm"
          className="tech-btn"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          View Job
        </Button>
      </div>
      
      {/* Company Profile Modal */}
      <CompanyProfileModal 
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        companyProfile={companyProfile}
        isLoading={companyMutation.isPending}
        jobEmail={job.jobPosterEmail}
        onProceedToApply={handleProceedToApply}
        generatedEmail={generatedEmail}
        isGeneratingEmail={isGeneratingEmail}
      />
      
      {/* Gmail Authorization Prompt */}
      {showGmailAuth && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold">Enable Gmail Sending</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              To send job applications directly, we need permission to send emails on your behalf. 
              You can use any Gmail account for sending.
            </p>
            
            <div className="bg-muted/50 p-3 rounded-md mb-4">
              <p className="text-xs text-muted-foreground">
                <strong>Privacy:</strong> We only request email sending permission. 
                We cannot read your emails or access personal data.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowGmailAuth(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  // Store job details in session storage for after auth
                  sessionStorage.setItem('pendingApplyJob', JSON.stringify({
                    job,
                    resumeText,
                    returnPath: window.location.pathname,
                    returnSearch: window.location.search
                  }));
                  
                  // Get the authorization URL from the backend
                  try {
                    const response = await fetch('/api/auth/gmail/authorize', {
                      credentials: 'include'
                    });
                    const data = await response.json();
                    if (data.authUrl) {
                      // Open Gmail authorization in same window
                      window.location.href = data.authUrl;
                    }
                  } catch (error) {
                    console.error('Failed to get Gmail auth URL:', error);
                    toast({
                      title: "Authorization Error",
                      description: "Failed to start Gmail authorization. Please try again.",
                      variant: "destructive"
                    });
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Authorize Gmail
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal for Email Generation */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {applyStep === 'scraping-company' && <Building className="w-6 h-6 text-primary" />}
                    {applyStep === 'generating-email' && <Sparkles className="w-6 h-6 text-primary" />}
                    {applyStep === 'checking-gmail' && <Mail className="w-6 h-6 text-primary" />}
                  </motion.div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {applyStep === 'checking-gmail' && 'Verifying Gmail Access'}
                  {applyStep === 'scraping-company' && 'Analyzing Company Profile'}
                  {applyStep === 'generating-email' && 'Generating Personalized Email'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {applyStep === 'checking-gmail' && 'Checking your Gmail authorization status...'}
                  {applyStep === 'scraping-company' && 'Gathering company insights to personalize your application...'}
                  {applyStep === 'generating-email' && 'Creating a compelling email tailored to this opportunity...'}
                </p>
              </div>
              
              <div className="flex justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Email Composer Modal */}
      <EmailComposerModal 
        isOpen={showEmailComposer}
        onClose={() => setShowEmailComposer(false)}
        recipientEmail={job.jobPosterEmail || ""}
        jobTitle={job.title}
        companyName={job.companyName}
        jobUrl={job.link}
        companyWebsite={job.companyWebsite}
        generatedEmail={generatedEmail}
        isGeneratingEmail={isGeneratingEmail}
        onRegenerateEmail={handleRegenerateEmail}
        showRegenerateButton={!!generatedEmail}
      />
    </motion.div>
  );
}