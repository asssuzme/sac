import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/useAuth";
import { Settings as SettingsIcon, User as UserIcon, Bell, Shield, Globe, Save, FileText, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  if (!user) return null;

  // Type assertion for proper typing
  const typedUser = user as User;

  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      
      const endpoint = '/api/resume/upload';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload resume');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Resume updated",
        description: "Your resume has been successfully updated",
      });
      // Invalidate both user and resume queries to clear cache
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/resume'] });
      setIsUploadingResume(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
      setIsUploadingResume(false);
    }
  });

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['text/plain', 'application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt, .pdf, .jpg, .jpeg, .png, or .webp file",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingResume(true);
    
    // All file types go through the same endpoint
    uploadResumeMutation.mutate(file);
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully",
    });
  };

  return (
    <DashboardLayout 
      user={user} 
      onLogout={() => window.location.href = "/api/auth/logout"} 
      title="Settings"
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
              <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">Settings</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage your account and application preferences
              </p>
            </div>
            <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
          </div>
        </div>

        {/* Profile Settings */}
        <Card className="glass-card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <UserIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Profile Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={typedUser.firstName || ""}
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={typedUser.lastName || ""}
                  className="glass-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={typedUser.email || ""}
                className="glass-input"
                disabled
              />
            </div>
          </div>
        </Card>

        {/* Resume Management */}
        <Card className="glass-card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Resume Management
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm mb-3">
                {typedUser.resumeText ? "Your resume is uploaded and ready." : "No resume uploaded yet."}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingResume}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {typedUser.resumeText ? "Update Resume" : "Upload Resume"}
                </Button>
                {typedUser.resumeText && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const text = typedUser.resumeText || "";
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'my-resume.txt';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Download Current Resume
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleResumeUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-3">
                Accepts .txt, .pdf, .jpg, .jpeg, .png, and .webp files. 
                We use AI to extract text from image resumes.
              </p>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="glass-card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-start md:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium">Email Notifications</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Receive updates about your job applications
                </p>
              </div>
              <Switch defaultChecked className="flex-shrink-0" />
            </div>
            <div className="flex items-start md:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium">Weekly Summary</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Get a weekly summary of your job search activity
                </p>
              </div>
              <Switch defaultChecked className="flex-shrink-0" />
            </div>
            <div className="flex items-start md:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium">New Features</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Be notified about new features and updates
                </p>
              </div>
              <Switch className="flex-shrink-0" />
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="glass-card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Privacy & Security
          </h3>
          <div className="space-y-4">
            <div className="flex items-start md:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium">Profile Visibility</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Make your profile visible to recruiters
                </p>
              </div>
              <Switch className="flex-shrink-0" />
            </div>
            <div className="flex items-start md:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium">Data Sharing</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Share anonymous data to improve our service
                </p>
              </div>
              <Switch defaultChecked className="flex-shrink-0" />
            </div>
          </div>
        </Card>

        {/* Regional Settings */}
        <Card className="glass-card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Regional Settings
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                className="w-full glass-input"
                defaultValue="en"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                className="w-full glass-input"
                defaultValue="America/New_York"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="btn-primary"
            size="lg"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Changes
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}