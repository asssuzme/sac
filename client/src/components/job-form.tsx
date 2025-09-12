import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { linkedinUrlSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, Search, ChevronRight } from "lucide-react";

interface JobFormProps {
  onSubmit: (url: string, jobCount: number) => void;
  isLoading: boolean;
}

export function JobForm({ onSubmit, isLoading }: JobFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [jobCount, setJobCount] = useState(100);
  
  const form = useForm({
    resolver: zodResolver(linkedinUrlSchema),
    defaultValues: {
      linkedinUrl: "",
    },
  });

  const handleSubmit = (data: { linkedinUrl: string }) => {
    onSubmit(data.linkedinUrl, jobCount);
  };

  return (
    <div className="glass rounded-2xl shadow-xl p-8 mb-8 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">Extract Job Data</h2>
        <p className="text-gray-600">Enter a LinkedIn job URL to scrape comprehensive job and company information</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    LinkedIn Job URL
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Link className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://www.linkedin.com/jobs/view/..."
                        className="pl-10 py-3"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    Paste the complete LinkedIn job posting URL
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="btn-gradient px-8 py-3 h-auto text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                <Search className="h-5 w-5 mr-2" />
                {isLoading ? "Scraping..." : `Scrape ${jobCount} Jobs`}
              </Button>
            </div>
          </div>
          
          {/* Job Count Selection */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
            <div className="flex-1">
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Jobs to Scrape
              </Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="jobs100"
                    name="jobCount"
                    value="100"
                    checked={jobCount === 100}
                    onChange={() => setJobCount(100)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="jobs100" className="cursor-pointer">
                    <div className="font-medium">100 Jobs</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Quick scan - Perfect for initial search</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="jobs1000"
                    name="jobCount"
                    value="1000"
                    checked={jobCount === 1000}
                    onChange={() => setJobCount(1000)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="jobs1000" className="cursor-pointer">
                    <div className="font-medium">1000 Jobs</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Deep search - Maximum opportunities</div>
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <details className="group" open={showAdvanced} onToggle={(e) => setShowAdvanced((e.target as HTMLDetailsElement).open)}>
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              <ChevronRight className={`inline-block mr-2 h-4 w-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
              Advanced Options
            </summary>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="includeCompany" defaultChecked />
                  <Label htmlFor="includeCompany" className="text-sm text-gray-700">
                    Include company data
                  </Label>
                </div>
              </div>
            </div>
          </details>
        </form>
      </Form>
    </div>
  );
}
