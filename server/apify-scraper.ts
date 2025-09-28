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

    // Use bebity's LinkedIn Jobs Scraper - fastest and most reliable in 2024
    const run = await apifyClient.actor('bebity/linkedin-jobs-scraper').call({
      startUrls: [{ url: request.linkedinUrl }],
      maxResults: request.maxResults || 50,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL'],
      },
    });

    console.log('Apify run started:', run.id);

    // Wait for the run to complete
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log(`Scraped ${items.length} jobs from LinkedIn`);

    // Transform Apify results to our format
    const results: JobScrapingResult[] = items.map((item: any) => ({
      jobTitle: item.title || 'Unknown Position',
      companyName: item.company || 'Unknown Company',
      location: item.location || 'Not specified',
      salary: item.salary,
      description: item.description || '',
      applyUrl: item.url || request.linkedinUrl,
      postedDate: item.postedDate,
      experienceLevel: item.experienceLevel,
      workType: item.workType,
    }));

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