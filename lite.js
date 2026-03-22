const http = require('http');
const https = require('https');
const axios = require('axios');
const cheerio = require('cheerio');

const crawl = async (url) => {
  try {
    const agent = new https.Agent({ rejectUnauthorized: false });
    const { data } = await axios.get(url, { timeout: 10000, httpsAgent: agent, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    const text = $('body').text().substring(0, 500);
    return { success: true, url, htmlSize: data.length, text };
  } catch (e) {
    return { success: false, url, error: e.message };
  }
};

http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'POST' && req.url === '/crawl') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { url } = JSON.parse(body);
        crawl(url).then(r => {
          res.writeHead(200);
          res.end(JSON.stringify(r));
        });
      } catch { res.writeHead(400); res.end(JSON.stringify({ error: 'Bad' })); }
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'POST /crawl' }));
  }
}).listen(3000, () => console.log('[LITE] Port 3000 ONLINE'));
