const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

puppeteer.use(StealthPlugin());

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

class OpenCrawlStealth {
  constructor(options = {}) {
    this.headless = options.headless !== false;
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 3;
    this.delayMs = options.delayMs || 1000;
    this.browser = null;
  }

  getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  async launchBrowser() {
    if (this.browser) return this.browser;
    
    this.browser = await puppeteer.launch({
      headless: this.headless ? 'new' : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    
    return this.browser;
  }

  async crawl(url, options = {}) {
    const { waitSelector = null, scrollDelay = 500 } = options;
    let attempts = 0;
    
    while (attempts < this.retries) {
      try {
        const browser = await this.launchBrowser();
        const page = await browser.newPage();
        
        await page.setUserAgent(this.getRandomUserAgent());
        await page.setDefaultNavigationTimeout(this.timeout);
        await page.setDefaultTimeout(this.timeout);
        
        // Anti-Detection Headers
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'de-DE,de;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Referer': 'https://www.google.com/',
          'DNT': '1'
        });
        
        console.log(`[CRAWL] Attempting: ${url} (Try ${attempts + 1}/${this.retries})`);
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: this.timeout });
        
        // Scroll for lazy-loaded content
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        });
        
        if (scrollDelay > 0) await page.waitForNavigation(scrollDelay);
        
        if (waitSelector) {
          try {
            await page.waitForSelector(waitSelector, { timeout: 5000 });
          } catch (e) {
            console.warn(`[WARN] Selector "${waitSelector}" not found, continuing...`);
          }
        }
        
        const content = await page.content();
        const text = await page.evaluate(() => document.body.innerText);
        
        await page.close();
        
        console.log(`[SUCCESS] Crawled: ${url} (${content.length} bytes)`);
        
        return {
          success: true,
          url,
          html: content,
          text,
          length: content.length,
          timestamp: new Date().toISOString()
        };
        
      } catch (error) {
        attempts++;
        console.error(`[ERROR] Attempt ${attempts} failed: ${error.message}`);
        
        if (attempts < this.retries) {
          const backoffDelay = this.delayMs * Math.pow(2, attempts - 1);
          console.log(`[RETRY] Waiting ${backoffDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }
    
    return {
      success: false,
      url,
      error: `Failed after ${this.retries} attempts`,
      timestamp: new Date().toISOString()
    };
  }

  async crawlMultiple(urls, options = {}) {
    const results = [];
    
    for (const url of urls) {
      const result = await this.crawl(url, options);
      results.push(result);
      
      if (this.delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delayMs));
      }
    }
    
    return results;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = OpenCrawlStealth;

// CLI Usage
if (require.main === module) {
  (async () => {
    const url = process.argv[2];
    if (!url) {
      console.error('Usage: node index.js <url>');
      process.exit(1);
    }
    
    const crawler = new OpenCrawlStealth({ headless: true });
    const result = await crawler.crawl(url);
    
    console.log('\n=== RESULT ===');
    console.log(JSON.stringify(result, null, 2));
    
    await crawler.close();
  })();
}
