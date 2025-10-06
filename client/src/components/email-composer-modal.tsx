import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, Mail, Copy, CheckCircle, Sparkles, ShieldCheck, Unlink, PartyPopper, XCircle } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Spinner, DotsLoader } from "@/components/ui/loading-animations";
import { motion, AnimatePresence } from "framer-motion";

// Modal states for smooth transitions
type ModalState = 'draft' | 'needs_gmail_auth' | 'sending' | 'success' | 'error';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  jobTitle: string;
  companyName: string;
  jobUrl?: string;
  companyWebsite?: string;
  generatedEmail: string;
  isGeneratingEmail: boolean;
  onRegenerateEmail: () => void;
  showRegenerateButton?: boolean;
}

export function EmailComposerModal({
  isOpen,
  onClose,
  recipientEmail,
  jobTitle,
  companyName,
  jobUrl,
  companyWebsite,
  generatedEmail,
  isGeneratingEmail,
  onRegenerateEmail,
  showRegenerateButton = true
}: EmailComposerModalProps) {
  const [emailContent, setEmailContent] = useState(generatedEmail);
  const [subject, setSubject] = useState(`Application for ${jobTitle} position at ${companyName}`);
  const [copied, setCopied] = useState(false);
  const [localGenerating, setLocalGenerating] = useState(false);
  const [showGmailAuth, setShowGmailAuth] = useState(false);
  const [modalState, setModalState] = useState<ModalState>('draft');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();
  
  // Check Gmail authorization status
  const { data: gmailStatus } = useQuery({
    queryKey: ['/api/auth/gmail/status'],
    enabled: isOpen
  }) as { data?: { authorized?: boolean; needsRefresh?: boolean; email?: string } };
  
  // Handle Gmail authorization - separate from login
  const authorizeGmailMutation = useMutation({
    mutationFn: async () => {
      // Redirect to separate Gmail authorization endpoint
      window.location.href = '/api/auth/gmail/authorize';
    },
    onError: (error: any) => {
      toast({
        title: "Authorization failed",
        description: error.message || "Failed to start Gmail authorization",
        variant: "destructive"
      });
    }
  });
  
  // Handle Gmail unlink
  const unlinkGmailMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/auth/gmail/unlink', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/gmail/status'] });
      toast({
        title: "Gmail unlinked",
        description: "Your Gmail account has been unlinked. You can relink it anytime.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to unlink Gmail",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  });

  // Reset modal state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setModalState('draft');
      setErrorMessage('');
      setShowGmailAuth(false);
    }
  }, [isOpen]);

  // Update email content when generated email changes
  useEffect(() => {
    if (generatedEmail) {
      setEmailContent(generatedEmail);
      setLocalGenerating(false);
    }
  }, [generatedEmail]);
  
  // Sync local generating state with parent state
  useEffect(() => {
    if (!isGeneratingEmail) {
      setLocalGenerating(false);
    }
  }, [isGeneratingEmail]);

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      // Start sending state
      setModalState('sending');
      
      return await apiRequest('/api/send-email', {
        method: 'POST',
        body: JSON.stringify({
          to: recipientEmail,
          subject: subject,
          body: emailContent.replace(/\n/g, '<br/>'),
          jobTitle: jobTitle,
          companyName: companyName,
          jobUrl: jobUrl,
          companyWebsite: companyWebsite
        })
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        if (data.sentViaGmail) {
          // Email was sent successfully via Gmail
          setModalState('success');
          
          // Auto-close after 3 seconds
          setTimeout(() => {
            onClose();
            setModalState('draft'); // Reset for next time
          }, 3000);
        } else if (data.needsGmailAuth) {
          // User needs to authorize Gmail sending
          setModalState('needs_gmail_auth');
          setShowGmailAuth(true);
        } else {
          // Fall back to opening in email client
          if (data.gmailComposeUrl) {
            window.open(data.gmailComposeUrl, '_blank');
          } else if (data.mailtoLink) {
            window.location.href = data.mailtoLink;
          }
          
          toast({
            title: "Email draft created!",
            description: "Opening in your email client. Please send the email from there.",
          });
          onClose();
          setModalState('draft'); // Reset
        }
      } else if (data.needsGmailAuth) {
        // Show Gmail authorization prompt
        setModalState('needs_gmail_auth');
        setShowGmailAuth(true);
      } else if (data.requiresSignIn) {
        setModalState('error');
        setErrorMessage('Please sign in with Google to send emails');
      } else {
        setModalState('error');
        setErrorMessage(data.error || 'Failed to send email. Please try again or use the copy option.');
      }
    },
    onError: (error: any) => {
      setModalState('error');
      if (error.requiresSignIn) {
        setErrorMessage('To send emails directly from Gmail, please sign in with your Google account first.');
      } else {
        setErrorMessage(error.message || 'Failed to send email. Please try again or use the copy option.');
      }
    }
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Email copied!",
      description: "You can now paste it into your email client",
    });
  };

  const handleOpenMailClient = () => {
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`;
    window.open(mailtoUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-2xl flex items-center gap-2">
            <Mail className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            Compose Application Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4 py-3 md:py-4">
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              value={recipientEmail}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-content">Email Content</Label>
              {(isGeneratingEmail || localGenerating) ? (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DotsLoader />
                    Generating personalized email...
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This may take 10-15 seconds
                  </div>
                </div>
              ) : showRegenerateButton ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocalGenerating(true);
                    toast({
                      title: "Generating email...",
                      description: "Creating a personalized email based on your resume",
                    });
                    onRegenerateEmail();
                  }}
                  className="opacity-100 hover:opacity-80 transition-opacity"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Regenerate Email
                </Button>
              ) : null}
            </div>
            <Textarea
              id="email-content"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Your email content..."
              className="min-h-[200px] md:min-h-[400px] font-mono text-xs md:text-sm"
              disabled={isGeneratingEmail}
            />
          </div>

          {!generatedEmail && !isGeneratingEmail && (
            <Alert>
              <AlertDescription>
                Click "Regenerate Email" to generate a personalized email based on your resume and the job details.
                {!emailContent && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Note: Make sure you are signed in with Google to generate emails.
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2 flex-col sm:flex-row">
          <div className="flex gap-2 flex-1">
            {gmailStatus?.authorized && !gmailStatus?.needsRefresh && (
              <div className="text-xs text-green-600 flex items-center gap-1 px-2 py-1 bg-green-50 rounded">
                <CheckCircle className="h-3 w-3" />
                Gmail connected
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleCopyEmail}
              disabled={!emailContent || isGeneratingEmail}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Email
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenMailClient}
              disabled={!emailContent || isGeneratingEmail}
            >
              <Mail className="h-4 w-4 mr-2" />
              Open in Mail App
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!gmailStatus?.authorized || gmailStatus?.needsRefresh) {
                  setShowGmailAuth(true);
                } else {
                  sendEmailMutation.mutate();
                }
              }}
              disabled={!emailContent || !subject || isGeneratingEmail || sendEmailMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Spinner className="mr-2" />
                  Sending...
                </>
              ) : !gmailStatus?.authorized || gmailStatus?.needsRefresh ? (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Setup Gmail
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send via Gmail
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
        
        {/* SENDING State Overlay */}
        <AnimatePresence>
          {modalState === 'sending' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full border text-center"
              >
                <div className="flex justify-center mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full"
                  >
                    <Send className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-semibold mb-2">Sending Your Email</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Attaching your resume and delivering to {recipientEmail}...
                </p>
                <div className="flex justify-center">
                  <DotsLoader />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SUCCESS State Overlay */}
        <AnimatePresence>
          {modalState === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full border text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="flex justify-center mb-6"
                >
                  <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-semibold mb-2 text-green-600 dark:text-green-400">
                  Email Sent Successfully!
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Your application has been sent to <strong>{recipientEmail}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Check your Gmail Sent folder to see your email with resume attached!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ERROR State Overlay */}
        <AnimatePresence>
          {modalState === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full border text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full">
                    <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-red-600 dark:text-red-400">
                  Email Not Sent
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {errorMessage}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setModalState('draft');
                      setErrorMessage('');
                    }}
                    className="flex-1"
                  >
                    Back to Draft
                  </Button>
                  <Button
                    onClick={() => {
                      setModalState('draft');
                      setErrorMessage('');
                      sendEmailMutation.mutate();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Try Again
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gmail Authorization Prompt */}
        {showGmailAuth && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg p-4">
            <div className="bg-card p-4 md:p-6 rounded-lg shadow-lg max-w-md w-full border">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold">Enable Gmail Sending</h3>
              </div>
              
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                To send emails directly from Gmail, we need permission to send emails on your behalf. 
                You can use any Gmail account - it doesn't have to be the same one you signed in with.
              </p>
              
              <div className="bg-muted/50 p-2 md:p-3 rounded-md mb-3 md:mb-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> We only request permission to send emails. 
                  We cannot read your existing emails or access your personal data.
                </p>
                <p className="text-xs text-muted-foreground mt-1 md:mt-2">
                  <strong>Different account:</strong> You can authorize any Gmail account, not just your login account.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowGmailAuth(false);
                    setModalState('draft');
                    // Show mailto fallback
                    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailContent)}`;
                    window.location.href = mailtoLink;
                    toast({
                      title: "Opening in email client",
                      description: "Sending email through your default email app",
                    });
                  }}
                  className="flex-1 h-10"
                >
                  Use Email App
                </Button>
                <Button
                  onClick={() => authorizeGmailMutation.mutate()}
                  disabled={authorizeGmailMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-10"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Authorize Gmail
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}