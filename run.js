const puppeteer = require('puppeteer');
const http = require('http');

let browserInstance = null;

const crawl = async (urlToCrawl) => {
  try {
    if (!browserInstance) {
      browserInstance = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    }
    const page = await browserInstance.newPage();
    await page.goto(urlToCrawl, { waitUntil: 'networkidle2', timeout: 30000 });
    const html = await page.content();
    const text = await page.evaluate(() => document.body.innerText);
    await page.close();
    return { success: true, url: urlToCrawl, html: html.length, text: text.substring(0, 300) };
  } catch (e) {
    return { success: false, url: urlToCrawl, error: e.toString() };
  }
};

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'POST' && req.url === '/crawl') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        crawl(data.url).then(result => {
          res.writeHead(200);
          res.end(JSON.stringify(result));
        });
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Bad request' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'POST /crawl only' }));
  }
});

server.listen(3000, '0.0.0.0', () => console.log('[OK] Server on port 3000'));
