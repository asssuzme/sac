import { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Users, 
  ChevronRight,
  Mail, 
  FileText,
  Link,
  Briefcase,
  Calendar,
  Download,
  Eye,
  EyeOff,
  Search,
  Activity,
  Database,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface UserActivity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
  totalJobsScraped: number;
  totalApplicationsSent: number;
  subscriptionStatus: string;
  subscriptionExpiresAt: string;
  resumeText: string;
  resumeFileName: string;
  resumeFileMimeType: string;
  resumeUploadedAt: string;
  jobRequests?: any[];
  emailApplications?: any[];
  gmailCredentials?: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showResumeContent, setShowResumeContent] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    const adminEmails = ['ashutoshlath@gmail.com', 'ashutoshlathvalo@gmail.com'];
    if (user && !adminEmails.includes(user.email)) {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  // Debug logging
  useEffect(() => {
    if (user) {
      console.log('Current user:', user?.email);
      console.log('Is admin?', ['ashutoshlath@gmail.com', 'ashutoshlathvalo@gmail.com'].includes(user?.email || ''));
    }
  }, [user]);

  // Fetch all data with admin key fallback
  const { data: allUsers = [], refetch: refetchUsers, isLoading: loadingUsers, error: usersError } = useQuery({
    queryKey: ['/api/admin/users-detailed'],
    enabled: !!user && ['ashutoshlath@gmail.com', 'ashutoshlathvalo@gmail.com'].includes(user?.email || ''),
    retry: 3,
    queryFn: async () => {
      const response = await fetch('/api/admin/users-detailed', {
        headers: {
          'X-Admin-Key': 'ai-jobhunter-admin-2025'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      return response.json();
    }
  });
  
  // Log errors
  useEffect(() => {
    if (usersError) {
      console.error('Failed to fetch users:', usersError);
      console.log('Response:', (usersError as any)?.response);
    }
  }, [usersError]);

  const { data: allJobRequests = [], refetch: refetchJobs } = useQuery({
    queryKey: ['/api/admin/job-requests-detailed'],
    enabled: !!user && ['ashutoshlath@gmail.com', 'ashutoshlathvalo@gmail.com'].includes(user?.email || ''),
    queryFn: async () => {
      const response = await fetch('/api/admin/job-requests-detailed', {
        headers: {
          'X-Admin-Key': 'ai-jobhunter-admin-2025'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch job requests: ${response.status}`);
      }
      return response.json();
    }
  });

  const { data: allEmailApplications = [], refetch: refetchEmails } = useQuery({
    queryKey: ['/api/admin/email-applications-detailed'],
    enabled: !!user && ['ashutoshlath@gmail.com', 'ashutoshlathvalo@gmail.com'].includes(user?.email || ''),
    queryFn: async () => {
      const response = await fetch('/api/admin/email-applications-detailed', {
        headers: {
          'X-Admin-Key': 'ai-jobhunter-admin-2025'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch email applications: ${response.status}`);
      }
      return response.json();
    }
  });

  const { data: allGmailCredentials = [], refetch: refetchGmail } = useQuery({
    queryKey: ['/api/admin/gmail-credentials-detailed'],
    enabled: !!user && ['ashutoshlath@gmail.com', 'ashutoshlathvalo@gmail.com'].includes(user?.email || ''),
    queryFn: async () => {
      const response = await fetch('/api/admin/gmail-credentials-detailed', {
        headers: {
          'X-Admin-Key': 'ai-jobhunter-admin-2025'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch gmail credentials: ${response.status}`);
      }
      return response.json();
    }
  });

  // Combine user data with their activities
  const usersWithActivities = (allUsers as any[]).map((userData: any) => ({
    ...userData,
    jobRequests: (allJobRequests as any[]).filter((req: any) => req.userId === userData.id),
    emailApplications: (allEmailApplications as any[]).filter((app: any) => app.userId === userData.id),
    gmailCredentials: (allGmailCredentials as any[]).filter((cred: any) => cred.userId === userData.id),
  }));

  const selectedUser = selectedUserId 
    ? usersWithActivities.find((u: UserActivity) => u.id === selectedUserId)
    : null;

  const handleRefreshAll = () => {
    refetchUsers();
    refetchJobs();
    refetchEmails();
    refetchGmail();
  };

  const downloadUserData = (userData: any) => {
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-${userData.email}-complete-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadResume = (user: any) => {
    // Check if we have the original file data
    if (user.resumeFileData && user.resumeFileMimeType) {
      // Convert base64 to blob
      const base64Data = user.resumeFileData.replace(/^data:[^;]+;base64,/, '');
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: user.resumeFileMimeType });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = user.resumeFileName || 'resume';
      a.click();
      URL.revokeObjectURL(url);
    } else if (user.resumeText) {
      // Fall back to text download if no file data
      const blob = new Blob([user.resumeText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = user.resumeFileName || 'resume.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const adminEmails = ['ashutoshlath@gmail.com', 'ashutoshlathvalo@gmail.com'];
  if (!user || !adminEmails.includes(user?.email || '')) {
    return null;
  }

  return (
    <DashboardLayout user={user} onLogout={() => window.location.href = "/api/auth/logout"} title="Database Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8 text-primary" />
              Production Database Access
            </h1>
            <p className="text-muted-foreground mt-1">Complete user activity and data access</p>
          </div>
          <Button onClick={handleRefreshAll} data-testid="button-refresh-data">
            Refresh All Data
          </Button>
        </div>

        {/* Database Status Notice */}
        {usersError && (
          <Card className="border-red-500/50 bg-red-500/10 mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                API Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-400">
                Failed to fetch users: {(usersError as any)?.message || 'Unknown error'}
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card className="border-blue-500/50 bg-blue-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              Database Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Environment: <strong>{window.location.hostname.includes('replit.dev') ? 'Development' : 'Production'}</strong>
              <br />
              Database URL: <strong>{window.location.hostname.includes('replit.dev') ? 'Development DB' : 'Production DB'}</strong>
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List Panel */}
          <div className="lg:col-span-1">
            <Card className="h-[800px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Total Users: {usersWithActivities.length}</span>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
                <CardDescription>Click on a user to view complete activity</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full px-6">
                  {loadingUsers ? (
                    <div className="text-center py-8 text-muted-foreground">Loading users...</div>
                  ) : usersWithActivities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No users found</div>
                  ) : (
                    <div className="space-y-2 pb-6">
                      {usersWithActivities.map((userData: UserActivity) => (
                        <motion.div
                          key={userData.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant={selectedUserId === userData.id ? "default" : "ghost"}
                            className="w-full justify-between text-left p-3 h-auto"
                            onClick={() => setSelectedUserId(userData.id)}
                            data-testid={`button-select-user-${userData.id}`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate text-sm font-mono">{userData.email}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 flex-shrink-0 ml-2" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* User Details Panel */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <Card className="h-[800px] flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </CardTitle>
                      <CardDescription className="font-mono">{selectedUser.email}</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadUserData(selectedUser)}
                      data-testid={`button-download-user-${selectedUser.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-6">
                      {/* User Profile Section */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          User Profile
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">User ID:</span>
                            <div className="font-mono text-xs mt-1">{selectedUser.id}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Joined:</span>
                            <div className="mt-1">{formatDate(selectedUser.createdAt)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Subscription:</span>
                            <div className="mt-1">
                              <Badge variant={selectedUser.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                                {selectedUser.subscriptionStatus || 'Free'}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expires:</span>
                            <div className="mt-1">{formatDate(selectedUser.subscriptionExpiresAt)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Activity Summary */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Activity Summary
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-4 bg-muted/50">
                            <div className="flex items-center gap-3">
                              <Search className="h-8 w-8 text-primary" />
                              <div>
                                <div className="text-2xl font-bold">{selectedUser.jobRequests?.length || 0}</div>
                                <div className="text-xs text-muted-foreground">Job Searches</div>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4 bg-muted/50">
                            <div className="flex items-center gap-3">
                              <Mail className="h-8 w-8 text-primary" />
                              <div>
                                <div className="text-2xl font-bold">{selectedUser.emailApplications?.length || 0}</div>
                                <div className="text-xs text-muted-foreground">Applications Sent</div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>

                      {/* Resume Section */}
                      {selectedUser.resumeText && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Resume
                          </h3>
                          <Card className="p-4 bg-muted/50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm">
                                <div className="font-medium">{selectedUser.resumeFileName || 'resume.txt'}</div>
                                <div className="text-xs text-muted-foreground">
                                  Uploaded: {formatDate(selectedUser.resumeUploadedAt)}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowResumeContent(
                                    showResumeContent === selectedUser.id ? null : selectedUser.id
                                  )}
                                  data-testid={`button-toggle-resume-${selectedUser.id}`}
                                >
                                  {showResumeContent === selectedUser.id ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-1" />
                                      Hide
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadResume(selectedUser)}
                                  data-testid={`button-download-resume-${selectedUser.id}`}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                            <AnimatePresence>
                              {showResumeContent === selectedUser.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <ScrollArea className="h-48 w-full bg-background rounded border p-3">
                                    <pre className="text-xs whitespace-pre-wrap font-mono">
                                      {selectedUser.resumeText}
                                    </pre>
                                  </ScrollArea>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Card>
                        </div>
                      )}

                      {/* Job Searches Section */}
                      {selectedUser.jobRequests && selectedUser.jobRequests.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Job Searches ({selectedUser.jobRequests.length})
                          </h3>
                          <div className="space-y-2">
                            {selectedUser.jobRequests.map((request: any) => (
                              <Card key={request.id} className="p-3 bg-muted/30">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                                    {request.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(request.createdAt)}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Link className="h-3 w-3" />
                                    <a 
                                      href={request.linkedinUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline truncate flex-1"
                                    >
                                      {request.linkedinUrl}
                                    </a>
                                  </div>
                                  {(request.totalJobsFound || request.results) && (
                                    <div className="space-y-1 mt-2">
                                      <div className="text-xs text-muted-foreground">
                                        Total jobs found: {
                                          request.totalJobsFound || 
                                          (request.enrichedResults && (request.enrichedResults as any).fakeTotalJobs) ||
                                          (typeof request.results === 'object' && request.results.jobs 
                                            ? request.results.jobs.length 
                                            : 0)
                                        }
                                      </div>
                                      {(request.freeJobsShown !== undefined || request.enrichedResults) && (
                                        <div className="flex gap-3 text-xs">
                                          <span className="text-green-600 dark:text-green-400">
                                            Free jobs shown: {
                                              request.freeJobsShown !== undefined ? request.freeJobsShown :
                                              (request.enrichedResults && (request.enrichedResults as any).freeJobs) || 0
                                            }
                                          </span>
                                          <span className="text-amber-600 dark:text-amber-400">
                                            Pro jobs (locked): {
                                              request.proJobsShown !== undefined ? request.proJobsShown :
                                              (request.enrichedResults && (request.enrichedResults as any).lockedJobs) || 0
                                            }
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Email Applications Section */}
                      {selectedUser.emailApplications && selectedUser.emailApplications.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Applications Sent ({selectedUser.emailApplications.length})
                          </h3>
                          <div className="space-y-2">
                            {selectedUser.emailApplications.map((email: any) => (
                              <Card key={email.id} className="p-3 bg-muted/30">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium text-sm">
                                      {email.jobTitle} at {email.companyName}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(email.sentAt)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    To: {email.companyEmail}
                                  </div>
                                  <div className="text-xs">
                                    Subject: {email.emailSubject}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Gmail Integration Status */}
                      {selectedUser.gmailCredentials && selectedUser.gmailCredentials.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Gmail Integration
                          </h3>
                          <Card className="p-4 bg-muted/50">
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <div className="font-medium">Gmail API Connected</div>
                                <div className="text-xs text-muted-foreground">
                                  Last updated: {formatDate(selectedUser.gmailCredentials[0].updatedAt)}
                                </div>
                              </div>
                              <Badge variant={selectedUser.gmailCredentials[0].isActive ? 'default' : 'secondary'}>
                                {selectedUser.gmailCredentials[0].isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </Card>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[800px] flex items-center justify-center">
                <CardContent className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Select a User</h3>
                  <p className="text-muted-foreground">
                    Click on a user from the list to view their complete activity history
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}