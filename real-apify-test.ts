// REAL Apify scraping test - this will actually call Apify and cost credits
import { ApifyClient } from 'apify-client';

console.log('='.repeat(50));
console.log('🚀 REAL APIFY SCRAPING TEST - THIS WILL USE CREDITS');
console.log('='.repeat(50));

async function runRealScrapingTest() {
  const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_KEY,
  });

  try {
    // Step 1: Generate a LinkedIn URL
    const linkedinUrl = 'https://www.linkedin.com/jobs/search?keywords=software+engineer&location=san+francisco&f_WT=2';
    console.log('\n📍 LinkedIn URL to scrape:', linkedinUrl);
    
    // Step 2: Actually call the LinkedIn Jobs Scraper
    console.log('\n🔄 Starting REAL Apify scraping (this will use credits)...');
    
    const run = await apifyClient.actor('curious_coder/linkedin-jobs-search-scraper').call({
      startUrls: [{ url: linkedinUrl }],
      maxResults: 10, // Only scrape 10 jobs to save credits
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL'],
      },
    });

    console.log('✅ Apify run started:', run.id);
    console.log('   Status:', run.status);
    console.log('   Actor:', run.actId);
    
    // Step 3: Wait for completion and get results
    console.log('\n⏳ Waiting for scraping to complete...');
    
    // Wait for the run to finish
    await apifyClient.run(run.id).waitForFinish();
    
    // Get the dataset
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    console.log(`\n✅ Scraping completed! Found ${items.length} jobs`);
    
    // Step 4: Show first few jobs
    if (items.length > 0) {
      console.log('\n📋 Sample jobs found:');
      items.slice(0, 3).forEach((job: any, i: number) => {
        console.log(`\n   Job ${i + 1}:`);
        console.log(`   - Title: ${job.title || 'N/A'}`);
        console.log(`   - Company: ${job.company || 'N/A'}`);
        console.log(`   - Location: ${job.location || 'N/A'}`);
        console.log(`   - URL: ${job.url || 'N/A'}`);
      });
    }
    
    // Step 5: Test profile scraping (for email extraction)
    if (items.length > 0 && items[0].url) {
      console.log('\n🔍 Testing profile scraper for email extraction...');
      
      try {
        const profileRun = await apifyClient.actor('dev_fusion/linkedin-profile-scraper').call({
          profileUrls: [items[0].url],
          scrapeEmails: true,
          proxy: {
            useApifyProxy: true,
            apifyProxyGroups: ['RESIDENTIAL'],
          },
        }, { waitSecs: 60 });
        
        console.log('✅ Profile scraper run started:', profileRun.id);
        
        // Wait and get results
        await apifyClient.run(profileRun.id).waitForFinish();
        const profileData = await apifyClient.dataset(profileRun.defaultDatasetId).listItems();
        
        if (profileData.items && profileData.items.length > 0) {
          const profile = profileData.items[0];
          console.log('   Profile data extracted:');
          console.log(`   - Name: ${profile.fullName || 'N/A'}`);
          console.log(`   - Email: ${profile.email || 'Not found'}`);
          console.log(`   - Headline: ${profile.headline || 'N/A'}`);
        }
      } catch (err: any) {
        console.log('   Profile scraping error:', err.message);
        console.log('   (This is expected - job URLs may not be profile URLs)');
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ REAL TEST COMPLETE - CHECK YOUR APIFY DASHBOARD');
    console.log('   You should see new runs in your Apify console!');
    console.log('='.repeat(50));
    
    return true;
  } catch (error: any) {
    console.error('\n❌ Scraping failed:', error.message);
    
    if (error.statusCode === 402) {
      console.log('   → Insufficient credits in Apify account');
    } else if (error.statusCode === 404) {
      console.log('   → Actor not found - check actor name');
    } else if (error.message.includes('timeout')) {
      console.log('   → Scraping timed out - LinkedIn may be blocking');
    }
    
    return false;
  }
}

// Run the test
runRealScrapingTest()
  .then(success => {
    if (!success) {
      console.log('\n⚠️  The test failed. Check your Apify credits or actor names.');
    }
  })
  .catch(console.error);