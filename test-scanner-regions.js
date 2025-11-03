const axios = require('axios');

// Test scanner with different regions
async function testScanner(barcode, region, description) {
  console.log(`\n========================================`);
  console.log(`Testing: ${description}`);
  console.log(`Barcode: ${barcode}`);
  console.log(`Region: ${region}`);
  console.log(`========================================`);

  try {
    const response = await axios.post('http://localhost:5002/api/scanner/scan', {
      barcode: barcode,
      // We'll manually pass the region for testing
      testRegion: region
    });

    if (response.data.found) {
      console.log('✅ Product FOUND!');
      console.log('Name:', response.data.product.name);
      console.log('Brand:', response.data.product.brand);
      console.log('Source:', response.data.source);
      console.log('Safety:', response.data.safetyAnalysis?.overallSafety || 'N/A');
    } else {
      console.log('❌ Product NOT FOUND');
      console.log('Message:', response.data.message);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.response?.data?.error || error.message);
  }
}

(async () => {
  console.log('🔍 Testing Multi-Region Scanner\n');

  // Test USA product
  await testScanner('049000000443', 'US', '🇺🇸 USA - Coca-Cola');

  // Test Israeli product
  await testScanner('7290000068', 'IL', '🇮🇱 Israel - Osem Bisli');

  // Test Mexican product
  await testScanner('750103042109', 'MX', '🇲🇽 Mexico - Bimbo Bread');

  // Test another Mexican product
  await testScanner('7501055335015', 'MX', '🇲🇽 Mexico - Coca-Cola Mexico');

  console.log('\n✅ Testing complete!\n');
})();
