const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust the first proxy so req.ip is correct behind localtunnel / reverse proxies
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});

app.use(limiter);

// Allowed origin patterns for third-party cookie / credentialed-request support.
// Covers localhost dev, localtunnel public URLs, and GitHub Pages.
const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.loca\.lt$/,
  /^https:\/\/[a-z0-9-]+\.github\.io$/,
];

// Enable third-party cookie support: allow credentialed cross-origin requests
// from trusted origins so cookies work when the app is accessed via tunnel URL.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = origin && ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(origin));
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Inject Synthesizer server running at http://localhost:${PORT}`);
    // Notify the parent process (start-tunnel.js) that the server is ready
    if (process.send) {
      process.send('ready');
    }
  });
}

module.exports = app;
