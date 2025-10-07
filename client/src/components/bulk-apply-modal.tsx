import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Send, 
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";

interface BulkApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: any[];
  resumeText: string | null;
}

type ModalState = 'confirm' | 'checking-gmail' | 'generating' | 'sending' | 'complete';

interface JobResult {
  job: any;
  status: 'pending' | 'generating' | 'sending' | 'success' | 'failed';
  email?: string;
  error?: string;
}

export function BulkApplyModal({ isOpen, onClose, jobs, resumeText }: BulkApplyModalProps) {
  const { toast } = useToast();
  const [modalState, setModalState] = useState<ModalState>('confirm');
  const [jobResults, setJobResults] = useState<JobResult[]>([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [totalSent, setTotalSent] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);

  // Check Gmail authorization status
  const { data: gmailStatus, refetch: refetchGmailStatus } = useQuery({
    queryKey: ['/api/auth/gmail/status'],
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  }) as { data?: { authorized?: boolean; needsRefresh?: boolean }; refetch: () => Promise<any> };

  // Initialize job results when modal opens
  useEffect(() => {
    if (isOpen) {
      setJobResults(jobs.map(job => ({
        job,
        status: 'pending',
      })));
      setCurrentJobIndex(0);
      setTotalSent(0);
      setTotalFailed(0);
      setModalState('confirm');
    }
  }, [isOpen, jobs]);

  const handleStartBulkApply = async () => {
    // Check Gmail authorization first
    setModalState('checking-gmail');
    
    let status = gmailStatus;
    if (!status) {
      const result = await refetchGmailStatus();
      status = result?.data as any;
    }

    if (!status?.authorized) {
      // Need Gmail authorization
      toast({
        title: "Gmail Authorization Required",
        description: "Please authorize Gmail to send emails. You'll be redirected...",
      });
      
      // Store bulk apply state for continuation after auth
      sessionStorage.setItem('pendingBulkApply', JSON.stringify({
        jobs: jobs.map(j => ({
          title: j.title,
          companyName: j.companyName,
          jobPosterEmail: j.jobPosterEmail || j.contactEmail,
        })),
        returnUrl: window.location.pathname + window.location.search,
      }));
      
      // Redirect to Gmail auth
      const currentUrl = window.location.pathname + window.location.search;
      window.location.href = `/api/auth/gmail/authorize?returnUrl=${encodeURIComponent(currentUrl)}&bulkApply=true`;
      return;
    }

    // Start bulk generation and sending
    setModalState('generating');
    await processBulkApplications();
  };

  const processBulkApplications = async () => {
    const results = [...jobResults];
    
    // Generate and send emails one by one
    for (let i = 0; i < jobs.length; i++) {
      setCurrentJobIndex(i);
      const job = jobs[i];
      
      // Update status to generating
      results[i] = { ...results[i], status: 'generating' };
      setJobResults([...results]);
      
      try {
        // Generate email
        const emailData = await apiRequest('/api/generate-email', {
          method: 'POST',
          body: JSON.stringify({
            jobTitle: job.title || 'Position Not Specified',
            companyName: job.companyName || 'Company Not Specified',
            jobDescription: job.requirement || `${job.title || 'Position'} at ${job.companyName || 'Company'}`,
            resumeText: resumeText || '',
          }),
        });
        
        if (!emailData.email) {
          throw new Error('Failed to generate email');
        }
        
        results[i] = { ...results[i], email: emailData.email, status: 'sending' };
        setJobResults([...results]);
        setModalState('sending');
        
        // Send email
        const sendResult = await apiRequest('/api/send-email', {
          method: 'POST',
          body: JSON.stringify({
            to: job.jobPosterEmail || job.contactEmail,
            subject: `Application for ${job.title} position at ${job.companyName}`,
            body: emailData.email,
            jobTitle: job.title,
            companyName: job.companyName,
          }),
        });
        
        if (sendResult.success || sendResult.sentViaGmail) {
          results[i] = { ...results[i], status: 'success' };
          setTotalSent(prev => prev + 1);
        } else {
          throw new Error(sendResult.error || 'Failed to send email');
        }
      } catch (error: any) {
        console.error(`Failed to process job ${i}:`, error);
        results[i] = { 
          ...results[i], 
          status: 'failed', 
          error: error.message || 'Unknown error' 
        };
        setTotalFailed(prev => prev + 1);
      }
      
      setJobResults([...results]);
      
      // Add small delay between emails to avoid rate limiting
      if (i < jobs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setModalState('complete');
  };

  const getProgress = () => {
    if (jobs.length === 0) return 0;
    return Math.round(((currentJobIndex + 1) / jobs.length) * 100);
  };

  const getStatusIcon = (status: JobResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'generating':
        return <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'sending':
        return <Send className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Bulk Job Applications
          </DialogTitle>
          <DialogDescription>
            Apply to multiple jobs at once with personalized emails
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Confirmation State */}
          {modalState === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  You're about to apply to <strong>{jobs.length} jobs</strong> automatically.
                  Each application will include your resume and a personalized email.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <h4 className="font-medium text-sm">Jobs to apply to:</h4>
                {jobs.map((job, idx) => (
                  <div key={idx} className="text-sm p-2 bg-muted rounded flex items-center gap-2">
                    <span className="text-muted-foreground">{idx + 1}.</span>
                    <span className="font-medium">{job.title}</span>
                    <span className="text-muted-foreground">at</span>
                    <span>{job.companyName}</span>
                  </div>
                ))}
              </div>
              
              {!resumeText && (
                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    No resume detected. Emails will be less personalized.
                    Upload a resume in Settings for better results.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleStartBulkApply}>
                  <Send className="h-4 w-4 mr-2" />
                  Start Applying
                </Button>
              </div>
            </motion.div>
          )}

          {/* Checking Gmail State */}
          {modalState === 'checking-gmail' && (
            <motion.div
              key="checking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-4"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 rounded-full animate-pulse">
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold">Checking Gmail Authorization</h3>
              <p className="text-sm text-muted-foreground">
                Verifying your Gmail connection...
              </p>
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </motion.div>
          )}

          {/* Generating/Sending State */}
          {(modalState === 'generating' || modalState === 'sending') && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing job {currentJobIndex + 1} of {jobs.length}</span>
                  <span>{getProgress()}%</span>
                </div>
                <Progress value={getProgress()} />
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {jobResults.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-2 p-2 bg-muted rounded text-sm"
                  >
                    {getStatusIcon(result.status)}
                    <span className="flex-1">
                      {result.job.title} at {result.job.companyName}
                    </span>
                    {result.status === 'generating' && (
                      <span className="text-xs text-muted-foreground">Generating email...</span>
                    )}
                    {result.status === 'sending' && (
                      <span className="text-xs text-muted-foreground">Sending...</span>
                    )}
                    {result.status === 'failed' && (
                      <span className="text-xs text-red-500">{result.error}</span>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <div className="flex gap-4 justify-center text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{totalSent} Sent</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>{totalFailed} Failed</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Complete State */}
          {modalState === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 text-center py-6"
            >
              <div className="flex justify-center">
                <div className={`p-4 rounded-full ${totalFailed === 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {totalFailed === 0 ? (
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  ) : (
                    <AlertCircle className="h-12 w-12 text-yellow-600" />
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {totalFailed === 0 ? 'All Applications Sent!' : 'Bulk Apply Complete'}
                </h3>
                <p className="text-muted-foreground">
                  Successfully sent {totalSent} out of {jobs.length} applications
                </p>
              </div>
              
              {totalFailed > 0 && (
                <Alert className="text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {totalFailed} applications failed. You can try applying to these jobs individually.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}