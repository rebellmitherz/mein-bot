# OpenCrawl-Stealth - Your Web Crawler

## Installation
```bash
cd /home/ubuntu/opencrawl-stealth
npm install
```

## Usage

### CLI Mode (Single URL)
```bash
node crawler.js https://example.com
```

### API Mode (Server)
```bash
node api.js
# POST http://localhost:3000/crawl
# {"url": "https://example.com"}
```

## Features
✅ Stealth Mode (Puppeteer-Extra + Anti-Detection)
✅ Automatic Retry (3 attempts with backoff)
✅ Random User Agents
✅ Headless Chrome
✅ NetworkIdle Wait (30s timeout)
✅ Lazy-Loading Support (auto-scroll)

## Output
```json
{
  "success": true,
  "url": "https://example.com",
  "htmlLength": 528,
  "textLength": 129,
  "text": "Example Domain..."
}
```

## Ports & Config
- API Server: Port 3000
- Timeout: 30 seconds
- Retries: 3 attempts

