import { useState } from "react";
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
  BarChart3,
  Calendar,
  Send,
  CheckCircle,
  Target,
  Users,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobForm } from "@/components/job-form";
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
  const [selectedSearch, setSelectedSearch] = useState<string | null>(null);

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/logout", { method: "GET" }),
    onSuccess: () => {
      window.location.href = "/";
    }
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="bg-card/50 backdrop-blur-lg border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">autoapply.ai</h1>
                <p className="text-xs text-muted-foreground">Professional Job Search Tool</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">System Active</span>
              </div>
              
              <div className="flex items-center space-x-4">
                {user.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt={user.firstName || "User"} 
                    className="h-8 w-8 rounded-full border-2 border-border"
                  />
                )}
                <div className="text-right">
                  <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <Button
                onClick={() => logoutMutation.mutate()}
                variant="outline"
                className="text-sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="tech-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-3xl font-bold mb-1">
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                stats?.totalJobsScraped || 0
              )}
            </h3>
            <p className="text-sm text-muted-foreground">Total Jobs Analyzed</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
              <div className="h-full bg-primary processing-bar"></div>
            </div>
          </div>

          <div className="tech-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <Send className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-3xl font-bold mb-1">
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                stats?.totalApplicationsSent || 0
              )}
            </h3>
            <p className="text-sm text-muted-foreground">Applications Sent</p>
          </div>

          <div className="tech-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-3xl font-bold mb-1">
              {statsLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                `${((stats?.totalApplicationsSent || 0) / Math.max(stats?.totalJobsScraped || 1, 1) * 100).toFixed(1)}%`
              )}
            </h3>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Search className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Job Search Dashboard</h2>
          </div>
          
          <Dialog open={showNewSearch} onOpenChange={setShowNewSearch}>
            <DialogTrigger asChild>
              <Button className="tech-btn">
                <Plus className="h-4 w-4 mr-2" />
                New Job Search
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
                  <Search className="h-6 w-6 text-primary" />
                  <span>Start New Job Search</span>
                </DialogTitle>
              </DialogHeader>
              <JobScraper onComplete={(requestId) => {
                setShowNewSearch(false);
                // Navigate to results page after completion
                setTimeout(() => {
                  setLocation(`/results/${requestId}`);
                }, 500);
              }} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search History */}
        <div className="tech-card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">Recent Searches</h3>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
          ) : stats?.recentSearches && stats.recentSearches.length > 0 ? (
            <div className="space-y-4">
              {stats.recentSearches.map((search) => (
                <div 
                  key={search.id} 
                  className="bg-card/50 p-4 rounded-lg flex items-center justify-between group cursor-pointer hover:bg-card transition-all border border-border/50"
                  onClick={() => setLocation(`/results/${search.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <Search className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Search {search.id.slice(0, 8)}
                      </span>
                      <Badge 
                        variant={search.status === 'completed' ? 'default' : search.status === 'failed' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {search.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {search.linkedinUrl}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(search.createdAt), 'MMM dd, HH:mm')}</span>
                      </span>
                      {search.status === 'completed' && search.filteredResults && (
                        <>
                          <span className="flex items-center space-x-1">
                            <BarChart3 className="h-3 w-3" />
                            <span>{(search.filteredResults as any).totalCount || 0} jobs</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>{(search.filteredResults as any).canApplyCount || 0} with contacts</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No searches yet</p>
              <p className="text-sm text-muted-foreground mt-2">Start your first job search to see history</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}