import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageLoader } from "@/components/ui/loading-animations";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, TrendingUp, Calendar, Target, Mail, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsStats {
  totalApplications: number;
  responseRate: number;
  averageResponseTime: number;
  interviewsScheduled: number;
  weeklyApplications: { week: string; count: number }[];
  totalJobsScraped: number;
}

export default function Analytics() {
  const { user } = useAuth();

  // Fetch real analytics data from API
  const { data: stats, isLoading } = useQuery<AnalyticsStats>({
    queryKey: ["/api/analytics/stats"],
    enabled: !!user,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (!user) return null;

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout 
        user={user} 
        onLogout={() => window.location.href = "/api/auth/logout"} 
        title="Analytics"
      >
        <PageLoader />
      </DashboardLayout>
    );
  }

  // Default values if no data
  const analyticsData = stats || {
    totalApplications: 0,
    responseRate: 0,
    averageResponseTime: 0,
    interviewsScheduled: 0,
    weeklyApplications: [],
    totalJobsScraped: 0
  };

  return (
    <DashboardLayout 
      user={user} 
      onLogout={() => window.location.href = "/api/auth/logout"} 
      title="Analytics"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="glass-card p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Analytics Dashboard</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Track your job search performance and insights
              </p>
            </div>
            <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <Mail className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span className="text-xl md:text-2xl font-bold">{analyticsData.totalApplications}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Total Applications</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              <span className="text-xl md:text-2xl font-bold">{analyticsData.responseRate}%</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Response Rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              <span className="text-xl md:text-2xl font-bold">{analyticsData.averageResponseTime}d</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Avg Response Time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-accent" />
              <span className="text-xl md:text-2xl font-bold">{analyticsData.interviewsScheduled}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Interviews</p>
          </motion.div>
        </div>

        {/* Weekly Applications Chart */}
        <Card className="glass-card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Weekly Application Trend</h3>
          <div className="space-y-4">
            {analyticsData.weeklyApplications.map((week, index) => (
              <motion.div
                key={week.week}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{week.week}</span>
                  <span className="font-medium">{week.count} applications</span>
                </div>
                <Progress 
                  value={(week.count / 10) * 100} 
                  className="h-2"
                />
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Insights */}
        <Card className="glass-card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Key Insights
          </h3>
          <div className="space-y-3">
            {analyticsData.responseRate > 0 && (
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm">
                  <span className="font-medium text-green-600">Great job!</span> Your response rate is above average at {analyticsData.responseRate}%
                </p>
              </div>
            )}
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm">
                <span className="font-medium text-blue-600">Tip:</span> Apply to 5-10 jobs per week for best results
              </p>
            </div>
            {analyticsData.totalApplications > 0 && (
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm">
                  <span className="font-medium text-accent">Stats:</span> You have sent {analyticsData.totalApplications} applications and scraped {analyticsData.totalJobsScraped} jobs
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}