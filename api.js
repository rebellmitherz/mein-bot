const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());

let browser;

(async () => {
  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
})();

app.post('/crawl', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const html = await page.content();
    const text = await page.evaluate(() => document.body.innerText);
    await page.close();
    
    res.json({
      success: true,
      url,
      htmlLength: html.length,
      textLength: text.length,
      text: text.substring(0, 1000)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      url,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('[API] Listening on http://localhost:3000');
  console.log('POST /crawl with { "url": "https://..."}');
});
