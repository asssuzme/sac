import { useState, useRef, useEffect } from "react";
import { FilteredJobData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ExternalLink, User, Briefcase, DollarSign, Mail, CheckCircle, XCircle, Send, Loader2, Sparkles, Globe, Building, Clock, Shield, Users, GraduationCap } from "lucide-react";
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

      // Ensure we have all required fields
      if (!resumeText) {
        console.error('No resume text available');
        setApplyStep('idle');
        setShowLoadingModal(false);
        alert('Please upload your resume first before applying to jobs.');
        setIsGeneratingEmail(false);
        return;
      }

      const requestBody = {
        companyName: job.companyName, // Backend expects companyName as string
        jobDescription: job.requirement || `${job.title} position at ${job.companyName}`,
        jobTitle: job.title, // Make sure jobTitle is included
        resumeText: resumeText
      };
      
      console.log('Sending email generation request:', requestBody);

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
        // User needs Gmail authorization first - redirect to Gmail auth
        setApplyStep('idle');
        
        // Store job info for auto-apply after Gmail auth
        sessionStorage.setItem('pendingApplyJob', JSON.stringify({
          job: {
            companyName: job.companyName,
            title: job.title
          }
        }));
        
        // Redirect to Gmail authorization with return URL
        const currentUrl = window.location.pathname + window.location.search;
        window.location.href = `/api/auth/gmail/authorize?returnUrl=${encodeURIComponent(currentUrl)}&autoApply=true`;
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
      whileHover={{ y: -2, scale: 1.01 }}
      className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Header Section */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {job.companyLogo ? (
              <div className="relative">
                <img 
                  src={job.companyLogo} 
                  alt={`${job.companyName} logo`} 
                  className="w-16 h-16 rounded-xl object-cover shadow-lg border-2 border-white ring-2 ring-gray-100" 
                  onError={(e) => {
                    // Fallback to gradient background if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Building className="h-8 w-8 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-gray-100">
                <Building className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          
          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 
                  className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer mb-2 leading-tight"
                  onClick={handleViewJob}
                >
                  {job.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span 
                    className="font-medium hover:text-blue-600 cursor-pointer transition-colors flex items-center gap-1"
                    onClick={handleViewCompany}
                  >
                    <Building className="h-4 w-4" />
                    {job.companyName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                  {job.postedDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {getRelativeTime(job.postedDate)}
                    </span>
                  )}
                </div>
                
                {/* Job Details Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {job.workType && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-sm font-medium">
                      <Briefcase className="h-3 w-3" />
                      {job.workType}
                    </span>
                  )}
                  {job.experienceLevel && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                      <GraduationCap className="h-3 w-3" />
                      {job.experienceLevel}
                    </span>
                  )}
                  {(job.salary || job.salaryInfo) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 text-sm font-medium">
                      <DollarSign className="h-3 w-3" />
                      {job.salary || job.salaryInfo}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {job.canApply ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Can Apply
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200 text-sm">
                    <XCircle className="h-4 w-4" />
                    Cannot Apply
                  </span>
                )}
                
                {job.canApply && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 font-medium"
                    onClick={handleApplyClick}
                    disabled={applyStep !== 'idle'}
                  >
                    {applyStep === 'idle' && (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Apply
                      </>
                    )}
                    {applyStep === 'checking-gmail' && (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    )}
                    {applyStep === 'scraping-company' && (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    )}
                    {applyStep === 'generating-email' && (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                        Generating...
                      </>
                    )}
                    {applyStep === 'ready' && (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Ready
                      </>
                    )}
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-all duration-200"
                  onClick={handleViewJob}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Job Description */}
      {job.description && (
        <div className="px-6 pb-4">
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Job Description</h4>
            <p className="text-gray-600 leading-relaxed text-sm">
              {job.description.length > 300 ? `${job.description.substring(0, 300)}...` : job.description}
            </p>
            {job.description.length > 300 && (
              <button 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 transition-colors"
                onClick={() => {/* TODO: Expand description */}}
              >
                Read more →
              </button>
            )}
          </div>
        </div>
      )}
      
      {job.requirement && (
        <div className="px-6 pb-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Requirements</h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              {job.requirement}
            </p>
          </div>
        </div>
      )}
      
      {job.jobPosterName && (
        <div className="px-6 pb-4">
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Job Poster Profile Picture */}
                <div className="relative">
                  {job.jobPosterImageUrl ? (
                    <div className="relative">
                      <img 
                        src={job.jobPosterImageUrl}
                        alt={`${job.jobPosterName} profile picture`}
                        className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-white ring-2 ring-blue-100"
                        onError={(e) => {
                          // Fallback to gradient background if profile image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md border-2 border-white ring-2 ring-blue-100">
                        {isRecruiter ? (
                          <Users className="h-6 w-6 text-white" />
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                      </div>
                    </div>
                  ) : job.jobPosterLinkedinUrl ? (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md border-2 border-white ring-2 ring-blue-100">
                      {isRecruiter ? (
                        <Users className="h-6 w-6 text-white" />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white ring-2 ring-gray-200">
                      {isRecruiter ? (
                        <Users className="h-6 w-6 text-gray-600" />
                      ) : (
                        <User className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                  )}
                  {/* Online indicator for LinkedIn profiles */}
                  {job.jobPosterLinkedinUrl && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Job Poster
                  </p>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-sm font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                      onClick={handleViewPoster}
                    >
                      {job.jobPosterName}
                    </span>
                    {job.jobPosterLinkedinUrl && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        LinkedIn
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {job.jobPosterLinkedinUrl && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleViewPoster}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Job Poster Title */}
            {job.jobPosterTitle && (
              <div className="mb-3">
                <p className="text-sm text-gray-600">
                  <Briefcase className="h-4 w-4 inline mr-2" />
                  {job.jobPosterTitle}
                </p>
              </div>
            )}
            
            {job.jobPosterEmail && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Direct Contact Available</p>
                    <p className="text-sm text-blue-700">Apply directly to the hiring manager</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Email:</span>
                      <a 
                        href={`mailto:${job.jobPosterEmail}`}
                        className="ml-2 text-sm text-blue-600 hover:text-blue-700 transition-colors font-mono"
                      >
                        {job.jobPosterEmail}
                      </a>
                    </div>
                    {job.emailVerificationStatus && (
                      <span 
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          job.emailVerificationStatus === 'valid' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : job.emailVerificationStatus === 'catch-all' 
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : job.emailVerificationStatus === 'error'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {job.emailVerificationStatus}
                      </span>
                    )}
                  </div>
                </div>
                {job.emailVerificationStatus && job.emailVerificationStatus === 'valid' && (
                  <div className="mt-3">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-all duration-200"
                      onClick={handleApplyClick}
                      disabled={applyStep !== 'idle'}
                    >
                      {applyStep === 'idle' && (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Apply Now
                        </>
                      )}
                      {applyStep === 'checking-gmail' && (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Checking Gmail...
                        </>
                      )}
                      {applyStep === 'scraping-company' && (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Researching company...
                        </>
                      )}
                      {applyStep === 'generating-email' && (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                          Generating email...
                        </>
                      )}
                      {applyStep === 'ready' && (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ready to send
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Bottom Section */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <Building className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Company</span>
            {job.companyLinkedinUrl && (
              <button 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                onClick={handleViewCompanyLinkedIn}
              >
                LinkedIn
              </button>
            )}
          </div>
          <Button 
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
            onClick={handleViewJob}
          >
            View Job
          </Button>
        </div>
      </div>

      {/* Modals */}
      <CompanyProfileModal 
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        company={companyProfile}
        isLoading={companyMutation.isPending}
        onProceed={handleProceedToApply}
      />

      <EmailComposerModal 
        isOpen={showEmailComposer}
        onClose={() => setShowEmailComposer(false)}
        job={job}
        generatedEmail={generatedEmail}
        isGenerating={isGeneratingEmail}
        onRegenerate={handleRegenerateEmail}
        applyStep={applyStep}
        resumeText={resumeText}
      />
    </motion.div>
  );
}