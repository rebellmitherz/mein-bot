const puppeteer = require('puppeteer');

(async () => {
  const url = process.argv[2] || 'https://example.com';
  console.log(`[START] Crawling: ${url}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0');
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const content = await page.content();
    const text = await page.evaluate(() => document.body.innerText);
    
    console.log('\n=== SUCCESS ===');
    console.log(JSON.stringify({
      url,
      success: true,
      htmlLength: content.length,
      textLength: text.length,
      firstText: text.substring(0, 300)
    }, null, 2));
  } catch (error) {
    console.error('[ERROR]', error.message);
    console.log(JSON.stringify({
      url,
      success: false,
      error: error.message
    }, null, 2));
  } finally {
    await browser.close();
  }
})();
