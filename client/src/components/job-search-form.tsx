import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, MapPin, Building, Home, Globe, X, Loader2, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion } from "framer-motion";

const jobRoles = [
  { value: "frontend developer", label: "Frontend Developer" },
  { value: "backend developer", label: "Backend Developer" },
  { value: "full stack developer", label: "Full Stack Developer" },
  { value: "data scientist", label: "Data Scientist" },
  { value: "product manager", label: "Product Manager" },
  { value: "ui/ux designer", label: "UI/UX Designer" },
  { value: "software engineer", label: "Software Engineer" },
  { value: "devops engineer", label: "DevOps Engineer" },
  { value: "mobile developer", label: "Mobile Developer" },
  { value: "machine learning engineer", label: "ML Engineer" }
];

const popularLocations = [
  { value: "mumbai", label: "Mumbai" },
  { value: "bangalore", label: "Bangalore" },
  { value: "delhi", label: "Delhi" },
  { value: "pune", label: "Pune" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "remote", label: "Remote" }
];

const workTypes = [
  { value: "1", label: "On-site", icon: Building, desc: "Work from office" },
  { value: "2", label: "Remote", icon: Home, desc: "Work from home" },
  { value: "3", label: "Hybrid", icon: Globe, desc: "Mix of both" }
];

const formSchema = z.object({
  keyword: z.string().min(1, "Job role is required"),
  location: z.string().min(1, "Location is required"),
  workType: z.string().min(1, "Work type is required"),
  jobCount: z.number().min(100).max(1000).default(100),
});

type FormData = z.infer<typeof formSchema>;

interface JobSearchFormProps {
  onSubmit: (data: FormData) => void;
  isProcessing?: boolean;
  hasExistingResume?: boolean;
  resumeContent?: React.ReactNode;
}

export function JobSearchForm({ 
  onSubmit, 
  isProcessing = false, 
  hasExistingResume = false,
  resumeContent 
}: JobSearchFormProps) {
  const [jobCount, setJobCount] = useState(100);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: "",
      location: "",
      workType: "",
      jobCount: 100,
    },
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Find Your Next Job</h3>
            <p className="text-sm text-muted-foreground">Fill in the details below to start your search</p>
          </div>

          {/* Job Keyword */}
          <FormField
            control={form.control}
            name="keyword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium mb-3 block">
                  What job are you looking for?
                </FormLabel>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="e.g. Frontend Developer, Data Scientist, Product Manager..."
                      className="glass-input h-12 text-base pl-11 pr-11 font-normal"
                      disabled={isProcessing}
                    />
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => field.onChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
                        aria-label="Clear job keyword"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                  
                  {/* Popular job suggestions */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Popular searches:</p>
                    <div className="flex flex-wrap gap-2">
                      {jobRoles.slice(0, 6).map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => field.onChange(role.value)}
                          className={cn(
                            "px-3 py-1.5 text-xs rounded-full border transition-all duration-200 hover:border-primary/50",
                            field.value === role.value 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-muted/50 text-muted-foreground border-muted hover:bg-muted"
                          )}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium mb-3 block">
                  Where do you want to work?
                </FormLabel>
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="e.g. Mumbai, Bangalore, Remote..."
                      className="glass-input h-12 text-base pl-11 pr-11 font-normal"
                      disabled={isProcessing}
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => field.onChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
                        aria-label="Clear location"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                  
                  {/* Popular locations */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Popular locations:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularLocations.map((location) => (
                        <button
                          key={location.value}
                          type="button"
                          onClick={() => field.onChange(location.value)}
                          className={cn(
                            "px-3 py-1.5 text-xs rounded-full border transition-all duration-200 hover:border-primary/50",
                            field.value === location.value 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-muted/50 text-muted-foreground border-muted hover:bg-muted"
                          )}
                        >
                          {location.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Work Type - Visual Cards */}
          <FormField
            control={form.control}
            name="workType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium mb-3 block">
                  How do you prefer to work?
                </FormLabel>
                <div className="grid grid-cols-3 gap-3">
                  {workTypes.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all duration-200 text-center space-y-2",
                        field.value === option.value
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-muted hover:border-primary/50 hover:bg-muted/30"
                      )}
                    >
                      <option.icon className={cn(
                        "h-6 w-6 mx-auto transition-colors",
                        field.value === option.value ? "text-primary" : "text-muted-foreground"
                      )} />
                      <div>
                        <p className={cn(
                          "font-medium text-sm",
                          field.value === option.value ? "text-primary" : "text-foreground"
                        )}>{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Job Count Selection */}
          <FormField
            control={form.control}
            name="jobCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium mb-3 block">
                  How many jobs do you want to search?
                </FormLabel>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setJobCount(100);
                      field.onChange(100);
                    }}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 space-y-2",
                      jobCount === 100
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-muted hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    <div className="text-2xl font-bold text-primary">100</div>
                    <div className="space-y-1">
                      <p className={cn(
                        "font-medium text-sm",
                        jobCount === 100 ? "text-primary" : "text-foreground"
                      )}>Quick Search</p>
                      <p className="text-xs text-muted-foreground">Perfect for targeted search</p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">Faster results</p>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setJobCount(1000);
                      field.onChange(1000);
                    }}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 space-y-2",
                      jobCount === 1000
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-muted hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    <div className="text-2xl font-bold text-primary">1000</div>
                    <div className="space-y-1">
                      <p className={cn(
                        "font-medium text-sm",
                        jobCount === 1000 ? "text-primary" : "text-foreground"
                      )}>Deep Search</p>
                      <p className="text-xs text-muted-foreground">Maximum opportunities</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">More comprehensive</p>
                    </div>
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Resume Section */}
          {resumeContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <label className="text-base font-medium flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-primary" />
                Resume {hasExistingResume ? '' : '(Required)'}
                {!hasExistingResume && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </label>
              {resumeContent}
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base font-medium"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-5 w-5" />
                Search {jobCount} Jobs
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}