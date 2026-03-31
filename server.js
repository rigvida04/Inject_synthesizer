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

const configuredOrigins = [
  process.env.PUBLIC_ORIGIN,
  process.env.GITHUB_PAGES_ORIGIN,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`
].filter(Boolean);

const ALLOWED_ORIGINS = new Set(configuredOrigins);

// Keep CORS strict: only explicit origins are allowed and credentials are not enabled.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = origin && ALLOWED_ORIGINS.has(origin);
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
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
