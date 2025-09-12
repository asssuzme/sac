import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Activity, 
  Database, 
  Search, 
  Mail, 
  TrendingUp,
  Loader2,
  Plus,
  Eye,
  Calendar,
  Send,
  CheckCircle,
  Users,
  Clock,
  ArrowUpRight,
  Sparkles,
  Briefcase,
  Lock,
  XCircle,
  Link2,
  MapPin,
  Unlock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCardSkeleton, Spinner } from "@/components/ui/loading-animations";
import { Badge } from "@/components/ui/badge";
import { JobScraper } from "@/components/job-scraper";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { format } from "date-fns";
import type { JobScrapingRequest } from "@shared/schema";

interface DashboardStats {
  totalJobsScraped: number;
  totalApplicationsSent: number;
  recentSearches: JobScrapingRequest[];
}





export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showNewSearch, setShowNewSearch] = useState(false);
  
  // Handle Gmail OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gmailAuth = urlParams.get('gmail_auth');
    const error = urlParams.get('error');
    
    if (gmailAuth === 'success') {
      toast({
        title: "Gmail connected successfully!",
        description: "You can now send emails directly from your Gmail account.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Invalidate Gmail status query
      queryClient.invalidateQueries({ queryKey: ['/api/auth/gmail/status'] });
    } else if (error === 'gmail_auth_failed') {
      toast({
        title: "Gmail authorization failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000,
  });

  // Logout function
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      // Logout error handled silently
    }
  };

  if (!user) {
    return null;
  }

  // Use statistics from backend - no need to recalculate
  


  return (
    <DashboardLayout user={user} onLogout={handleLogout} title="Dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Welcome section */}
        <div className="glass-card p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl font-bold mb-2">
                Welcome back, {(user as any)?.firstName || "User"}! 👋
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Ready to find your next opportunity? Let's get started.
              </p>
            </div>
            <Button
              onClick={() => setShowNewSearch(true)}
              className="btn-primary w-full md:w-auto h-12 text-base"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Job Search
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Total Jobs Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="glass-card p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="inline-flex p-3 rounded-xl bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Total
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">
                {statsLoading ? (
                  <Spinner className="mx-0" />
                ) : (
                  (stats?.totalJobsScraped || 0).toLocaleString()
                )}
              </p>
              <p className="text-sm text-muted-foreground">Jobs Analyzed</p>
            </div>
            {(stats?.totalJobsScraped || 0) > 0 && (
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>From {stats?.recentSearches?.filter(s => s.status === 'completed').length || 0} searches</span>
              </div>
            )}
          </motion.div>

          {/* Applications Sent Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="glass-card p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="inline-flex p-3 rounded-xl bg-accent/10">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              <Badge variant="secondary" className="text-xs">
                <Send className="h-3 w-3 mr-1" />
                Sent
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">
                {statsLoading ? (
                  <Spinner className="mx-0" />
                ) : (
                  stats?.totalApplicationsSent || 0
                )}
              </p>
              <p className="text-sm text-muted-foreground">Applications Sent</p>
            </div>
            {(stats?.totalApplicationsSent || 0) > 0 && (
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>Total applications sent</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Searches Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Recent Searches</h2>
                <p className="text-sm text-muted-foreground">Your job search history</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1 font-medium">
              {stats?.recentSearches?.length || 0} searches
            </Badge>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
          ) : stats?.recentSearches && stats.recentSearches.length > 0 ? (
            <div className="space-y-4">
              {stats.recentSearches.map((search, index) => {
                const isCompleted = search.status === 'completed';
                const isFailed = search.status === 'failed';
                const isCancelled = search.status === 'cancelled';
                
                return (
                  <motion.div
                    key={search.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className={`
                      relative overflow-hidden rounded-xl border cursor-pointer group transition-all duration-300
                      ${isCompleted ? 'border-green-500/20 bg-gradient-to-r from-green-500/5 to-emerald-500/5 hover:from-green-500/10 hover:to-emerald-500/10' :
                        isFailed ? 'border-red-500/20 bg-gradient-to-r from-red-500/5 to-pink-500/5 hover:from-red-500/10 hover:to-pink-500/10' :
                        isCancelled ? 'border-gray-500/20 bg-gradient-to-r from-gray-500/5 to-slate-500/5 hover:from-gray-500/10 hover:to-slate-500/10' :
                        'border-border bg-gradient-to-r from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10'}
                    `}
                    onClick={() => setLocation(`/results/${search.id}`)}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {/* Status Icon */}
                          <div className={`
                            p-2 rounded-full
                            ${isCompleted ? 'bg-green-500/10' :
                              isFailed ? 'bg-red-500/10' :
                              isCancelled ? 'bg-gray-500/10' :
                              'bg-blue-500/10'}
                          `}>
                            {isCompleted ? <CheckCircle className="h-5 w-5 text-green-500" /> :
                             isFailed ? <XCircle className="h-5 w-5 text-red-500" /> :
                             isCancelled ? <AlertCircle className="h-5 w-5 text-gray-500" /> :
                             <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                Search #{search.id.slice(0, 8)}
                              </span>
                              <Badge
                                variant={
                                  isCompleted ? 'default' :
                                  isFailed ? 'destructive' :
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                {search.status}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(search.createdAt), 'MMM dd, yyyy at HH:mm')}
                            </span>
                          </div>
                        </div>
                        
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      
                      {/* LinkedIn URL with icon */}
                      <div className="flex items-center gap-2 mb-3">
                        <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm text-muted-foreground truncate">
                          {search.linkedinUrl.replace('https://www.linkedin.com/jobs/search?', '')}
                        </p>
                      </div>
                      {search.status === 'completed' && search.enrichedResults ? (
                        (() => {
                          const enrichedResults = search.enrichedResults as any;
                          // Use stored fake total or generate consistent one for old searches
                          let fakeTotalJobs = enrichedResults.fakeTotalJobs;
                          if (!fakeTotalJobs) {
                            // For old searches, generate consistent number based on search ID
                            let hash = 0;
                            for (let i = 0; i < search.id.length; i++) {
                              hash = ((hash << 5) - hash) + search.id.charCodeAt(i);
                              hash = hash & hash;
                            }
                            fakeTotalJobs = 500 + Math.abs(hash % 1501); // 500-2000
                          }
                          const freeJobs = enrichedResults.freeJobs || enrichedResults.canApplyCount || 0;
                          const lockedJobs = enrichedResults.lockedJobs || (fakeTotalJobs - freeJobs);
                          const unlockedPercentage = (freeJobs / fakeTotalJobs) * 100;
                          
                          return (
                            <div className="space-y-3">
                              {/* Progress Bar */}
                              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div 
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${unlockedPercentage}%` }}
                                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                                />
                              </div>
                              
                              {/* Job Stats */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5">
                                    <div className="p-1 rounded bg-blue-500/10">
                                      <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                                    </div>
                                    <span className="text-xs font-medium">{fakeTotalJobs.toLocaleString()} total</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="p-1 rounded bg-green-500/10">
                                      <Unlock className="h-3.5 w-3.5 text-green-500" />
                                    </div>
                                    <span className="text-xs font-medium text-green-600 dark:text-green-400">{freeJobs} unlocked</span>
                                  </div>
                                  {lockedJobs > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <div className="p-1 rounded bg-orange-500/10">
                                        <Lock className="h-3.5 w-3.5 text-orange-500" />
                                      </div>
                                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400">{lockedJobs} locked</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ) : search.status === 'processing' ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Processing your search...</span>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No searches yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start your first job search to see your history here
              </p>
              <Button onClick={() => setShowNewSearch(true)} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Start First Search
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* New Search Dialog */}
      <Dialog open={showNewSearch} onOpenChange={setShowNewSearch}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[85vh] sm:h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3 border-b flex-shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Start New Job Search
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
            <JobScraper onComplete={(requestId) => {
              setShowNewSearch(false);
              setTimeout(() => {
                setLocation(`/results/${requestId}`);
              }, 500);
            }} />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}