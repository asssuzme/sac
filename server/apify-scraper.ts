import { ApifyClient } from 'apify-client';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

export interface JobScrapingResult {
  jobTitle: string;
  companyName: string;
  location: string;
  salary?: string;
  description: string;
  applyUrl: string;
  postedDate?: string;
  experienceLevel?: string;
  workType?: string;
  jobPosterUrl?: string;
  jobPosterName?: string;
}

export interface ApifyJobScrapingRequest {
  linkedinUrl: string;
  maxResults?: number;
}

/**
 * Scrape LinkedIn jobs using Apify
 */
export async function scrapeLinkedInJobs(
  request: ApifyJobScrapingRequest
): Promise<JobScrapingResult[]> {
  if (!process.env.APIFY_API_KEY) {
    throw new Error('APIFY_API_KEY is not configured');
  }

  try {
    console.log('Starting LinkedIn job scraping with Apify...', { linkedinUrl: request.linkedinUrl });

    // Use curious_coder LinkedIn Jobs Scraper actor (free alternative)
    const run = await apifyClient.actor('curious_coder/linkedin-jobs-scraper').call({
      count: 100,
      scrapeCompany: true,
      urls: [request.linkedinUrl]
    });

    console.log('Apify run started:', run.id);

    // Wait for the run to complete
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log(`Scraped ${items.length} jobs from LinkedIn`);
    
    // Debug: log the structure of the first item
    if (items.length > 0) {
      console.log('Sample Apify item structure:', JSON.stringify(items[0], null, 2));
    }

    // Transform Apify results to our format
    const results: JobScrapingResult[] = items.map((item: any, index: number) => {
      // More flexible field mapping - check multiple possible field names
      const jobTitle = item.title || item.jobTitle || item.position || '';
      const companyName = item.company || item.companyName || item.employer || '';
      
      // Extract job poster information from various possible fields
      const jobPosterUrl = item.jobPosterUrl || item.postedByUrl || item.recruiterUrl || 
                           item.hrUrl || item.contactUrl || item.postedBy?.url || 
                           item.poster?.url || item.recruiter?.profileUrl || null;
      
      const jobPosterName = item.jobPosterName || item.postedByName || item.recruiterName || 
                           item.hrName || item.contactName || item.postedBy?.name || 
                           item.poster?.name || item.recruiter?.name || null;
      
      const mapped = {
        jobTitle: jobTitle || 'Unknown Position',
        companyName: companyName || 'Unknown Company',
        location: item.location || 'Not specified',
        salary: item.salary,
        description: item.description || item.descriptionText || '',
        applyUrl: item.url || item.link || request.linkedinUrl,
        postedDate: item.postedDate || item.posted || item.postedAt,
        experienceLevel: item.experienceLevel || item.experience || item.seniorityLevel,
        workType: item.workType || item.type || item.employmentType,
        jobPosterUrl: jobPosterUrl,
        jobPosterName: jobPosterName,
      };
      
      // Debug log for first few items
      if (index < 3) {
        console.log('Mapped job:', mapped);
      }
      
      return mapped;
    });

    return results;
  } catch (error) {
    console.error('Apify scraping error:', error);
    throw new Error(`Failed to scrape LinkedIn jobs: ${error.message}`);
  }
}

/**
 * Generate LinkedIn search URL using OpenAI for better query formatting
 */
export async function generateLinkedInSearchUrl(
  jobTitle: string,
  location: string,
  workType: 'remote' | 'onsite' | 'hybrid' = 'remote'
): Promise<string> {
  // Simple LinkedIn URL generation
  const baseUrl = 'https://www.linkedin.com/jobs/search';
  const params = new URLSearchParams({
    keywords: jobTitle,
    location: location,
  });

  // Add work type filter
  if (workType === 'remote') {
    params.append('f_WT', '2');
  } else if (workType === 'hybrid') {
    params.append('f_WT', '3');
  } else {
    params.append('f_WT', '1');
  }

  return `${baseUrl}?${params.toString()}`;
}