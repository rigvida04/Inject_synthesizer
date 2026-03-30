const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});

app.use(limiter);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Inject Synthesizer server running at http://localhost:${PORT}`);
});

module.exports = app;
