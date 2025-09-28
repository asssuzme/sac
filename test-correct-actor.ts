// Test with the CORRECT actor from user's screenshot
import { ApifyClient } from 'apify-client';

console.log('='.repeat(50));
console.log('🔍 TESTING WITH YOUR ACTUAL ACTORS');
console.log('='.repeat(50));

async function testActors() {
  const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_KEY,
  });

  // From your screenshot, I see you've been using "curl_craper" actor
  const actorsToTest = [
    'curl_craper/linkedin-jobs-scraper',  // From your screenshot
    'bebity/linkedin-jobs-scraper',        // Free alternative
    'misceres/linkedin-jobs-scraper',      // Your original (doesn't exist)
    'curious_coder/linkedin-jobs-search-scraper', // Requires payment
  ];

  console.log('\n🔍 Testing which actors work for you:\n');

  for (const actorId of actorsToTest) {
    try {
      const actor = await apifyClient.actor(actorId).get();
      console.log(`✅ ${actorId}: Available`);
      console.log(`   - Is public: ${actor.isPublic}`);
      console.log(`   - Username: ${actor.username}`);
      
      // Check if it's free or paid
      if (actor.isDeprecated) {
        console.log(`   ⚠️  This actor is deprecated`);
      }
    } catch (err: any) {
      if (err.statusCode === 404) {
        console.log(`❌ ${actorId}: Not found`);
      } else if (err.statusCode === 402) {
        console.log(`💰 ${actorId}: Requires payment`);
      } else {
        console.log(`⚠️  ${actorId}: ${err.message}`);
      }
    }
  }

  // Now test with bebity which should be free
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Testing with bebity/linkedin-jobs-scraper (free)');
  console.log('='.repeat(50));

  try {
    const linkedinUrl = 'https://www.linkedin.com/jobs/search?keywords=software+engineer&location=san+francisco&f_WT=2';
    
    const run = await apifyClient.actor('bebity/linkedin-jobs-scraper').call({
      startUrls: [{ url: linkedinUrl }],
      maxResults: 5, // Just 5 jobs to test
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ['RESIDENTIAL'],
      },
    });

    console.log('✅ Scraping started with run ID:', run.id);
    console.log('   Check your Apify dashboard for this new run!');
    
    // Wait for completion
    await apifyClient.run(run.id).waitForFinish();
    
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    console.log(`✅ Found ${items.length} jobs!`);
    
    if (items.length > 0) {
      console.log('\nFirst job:');
      console.log(`  Title: ${items[0].title || 'N/A'}`);
      console.log(`  Company: ${items[0].company || 'N/A'}`);
    }
    
  } catch (error: any) {
    console.log('❌ bebity actor failed:', error.message);
  }
}

testActors().catch(console.error);