// REAL test with curl_craper actor from your dashboard
import { ApifyClient } from 'apify-client';

console.log('='.repeat(50));
console.log('🚀 RUNNING ACTUAL SCRAPING WITH curl_craper');
console.log('='.repeat(50));

async function runActualScraping() {
  const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_KEY,
  });

  const linkedinUrl = 'https://www.linkedin.com/jobs/search?keywords=software+engineer&location=san+francisco&f_WT=2';
  
  console.log('\n📍 URL to scrape:', linkedinUrl);
  console.log('\n🔄 Starting scraping with curl_craper actor...\n');

  try {
    // Use the exact actor from your dashboard
    const run = await apifyClient.actor('curl_craper/linkedin-jobs-scraper').call({
      startUrls: [{ url: linkedinUrl }],
      maxResults: 10,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL'],
      },
    });

    console.log('✅ APIFY RUN STARTED!');
    console.log('   Run ID:', run.id);
    console.log('   Status:', run.status);
    console.log('   Actor:', run.actId);
    console.log('\n⏳ Waiting for completion...');
    
    // Wait for the run to finish
    await apifyClient.run(run.id).waitForFinish();
    
    // Get results
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    console.log(`\n✅ SCRAPING COMPLETE! Found ${items.length} jobs`);
    
    if (items.length > 0) {
      console.log('\n📋 First 3 jobs:');
      items.slice(0, 3).forEach((job: any, i: number) => {
        console.log(`\nJob ${i + 1}:`);
        console.log(`  Title: ${job.title || job.jobTitle || 'N/A'}`);
        console.log(`  Company: ${job.company || job.companyName || 'N/A'}`);
        console.log(`  Location: ${job.location || 'N/A'}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ CHECK YOUR APIFY DASHBOARD NOW!');
    console.log('   You should see a new run for curl_craper');
    console.log('='.repeat(50));
    
    return true;
  } catch (error: any) {
    console.error('\n❌ Failed:', error.message);
    
    if (error.statusCode === 402) {
      console.log('\n💰 This actor requires payment or more credits');
      console.log('   You may need to:');
      console.log('   1. Add Apify credits to your account');
      console.log('   2. Rent the actor');
      console.log('   3. Or use your own custom actor');
    }
    
    return false;
  }
}

runActualScraping().catch(console.error);