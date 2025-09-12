import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FilteredJobCard } from "@/components/filtered-job-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  CheckCircle, 
  XCircle,
  Loader2,
  Binary,
  ArrowLeft,
  Network,
  Terminal
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface EnrichedJob {
  canApply: boolean;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  [key: string]: any;
}

interface ScrapingResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  enrichedResults?: {
    jobs: EnrichedJob[];
  };
  errorMessage?: string;
}

export default function Results() {
  const { requestId } = useParams();
  
  const { data: scrapingResult, isLoading } = useQuery<ScrapingResult>({
    queryKey: ['/api/scrape-job', requestId],
    enabled: !!requestId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-32 w-32 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-lg text-muted-foreground">Loading job data...</p>
        </div>
      </div>
    );
  }

  if (!scrapingResult || scrapingResult.status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <XCircle className="h-32 w-32 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-destructive mb-2">Scan Failed</h1>
          <p className="text-muted-foreground">{scrapingResult?.errorMessage || 'Unknown error occurred'}</p>
          <Link href="/">
            <Button className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (scrapingResult.status !== 'completed' || !scrapingResult.enrichedResults) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Activity className="h-32 w-32 text-primary animate-pulse mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">Scan in Progress</h1>
          <p className="text-muted-foreground">Status: {scrapingResult.status}</p>
          <Link href="/">
            <Button className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const enrichedJobs = scrapingResult.enrichedResults?.jobs || [];
  const canApplyJobs = enrichedJobs.filter((job: any) => job.canApply);
  const cannotApplyJobs = enrichedJobs.filter((job: any) => !job.canApply);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-lg border-b mb-8">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center space-x-2">
                  <Network className="h-8 w-8 text-primary" />
                  <span>Job Scraping Results</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Request ID: {requestId?.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center px-4 py-2 rounded-lg bg-primary/10">
                <div className="text-3xl font-bold text-primary">{enrichedJobs.length}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Jobs</div>
              </div>
              <div className="text-center px-4 py-2 rounded-lg bg-primary/10">
                <div className="text-3xl font-bold text-primary">{canApplyJobs.length}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">With Contacts</div>
              </div>
              <div className="text-center px-4 py-2 rounded-lg bg-primary/10">
                <div className="text-3xl font-bold text-primary">{cannotApplyJobs.length}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">No Contacts</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="container mx-auto px-4 pb-12">
        <Tabs defaultValue="can-apply" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="can-apply" className="data-[state=active]:bg-primary/20">
              <CheckCircle className="h-4 w-4 mr-2" />
              Can Apply ({canApplyJobs.length})
            </TabsTrigger>
            <TabsTrigger value="cannot-apply" className="data-[state=active]:bg-primary/20">
              <XCircle className="h-4 w-4 mr-2" />
              No Contact Info ({cannotApplyJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="can-apply" className="mt-6">
            {canApplyJobs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {canApplyJobs.map((job: any, index: number) => (
                  <FilteredJobCard key={index} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg border">
                <Binary className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No jobs with contact information found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cannot-apply" className="mt-6">
            {cannotApplyJobs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cannotApplyJobs.map((job: any, index: number) => (
                  <FilteredJobCard key={index} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg border">
                <Terminal className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">All jobs have contact information</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}