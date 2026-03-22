const puppeteer = require('puppeteer');
const http = require('http');
const url = require('url');

let browser = null;

(async () => {
  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log('[BROWSER] Chromium started');
})();

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'POST' && req.url === '/crawl') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        const crawlUrl = parsed.url;
        
        if (!crawlUrl) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'URL required' }));
          return;
        }
        
        console.log(`[CRAWL] Starting: ${crawlUrl}`);
        
        const page = await browser.newPage();
        await page.goto(crawlUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const html = await page.content();
        const text = await page.evaluate(() => document.body.innerText);
        await page.close();
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          url: crawlUrl,
          htmlLength: html.length,
          textLength: text.length,
          text: text.substring(0, 500)
        }));
        
        console.log(`[SUCCESS] ${crawlUrl} (${html.length} bytes)`);
      } catch (err) {
        console.error(`[ERROR] ${err.message}`);
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          error: err.message
        }));
      }
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Use POST /crawl' }));
  }
});

server.listen(3000, () => {
  console.log('[API] Listening on http://localhost:3000/crawl');
});
