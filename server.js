const express = require('express');
const cookieParser = require('cookie-parser');
const EncryptedCookieMiddleware = require('./encryptedCookieMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Secret key for encryption - MUST be set via environment variable
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;

if (!ENCRYPTION_SECRET) {
  console.error('❌ ERROR: ENCRYPTION_SECRET environment variable is not set!');
  console.error('Please set ENCRYPTION_SECRET in your environment or .env file.');
  console.error('Example: ENCRYPTION_SECRET=your-secret-key-here node server.js');
  process.exit(1);
}

// Initialize encrypted cookie middleware
const encryptedCookies = new EncryptedCookieMiddleware(ENCRYPTION_SECRET);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(encryptedCookies.parser());

// Serve static HTML for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inject Synthesizer - Encrypted Cookie Handler</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
        }
        .endpoint {
          background: #f9f9f9;
          padding: 15px;
          margin: 10px 0;
          border-left: 4px solid #007bff;
        }
        button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          margin: 5px;
          cursor: pointer;
          border-radius: 4px;
        }
        button:hover {
          background: #0056b3;
        }
        #result {
          margin-top: 20px;
          padding: 15px;
          background: #e9ecef;
          border-radius: 4px;
          white-space: pre-wrap;
          font-family: monospace;
        }
        .status {
          padding: 5px 10px;
          border-radius: 3px;
          font-weight: bold;
        }
        .status.encrypted {
          background: #d4edda;
          color: #155724;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔒 Inject Synthesizer</h1>
        <h2>Third-Party Cookie Encryption System</h2>
        <p>This application demonstrates secure encryption and decryption of third-party cookies using AES-256-GCM.</p>
        
        <h3>Available Endpoints:</h3>
        
        <div class="endpoint">
          <strong>POST /api/set-encrypted-cookie</strong>
          <p>Sets an encrypted third-party cookie</p>
          <button onclick="setEncryptedCookie()">Test Set Cookie</button>
        </div>
        
        <div class="endpoint">
          <strong>GET /api/get-encrypted-cookie</strong>
          <p>Retrieves and decrypts a cookie</p>
          <button onclick="getEncryptedCookie()">Test Get Cookie</button>
        </div>
        
        <div class="endpoint">
          <strong>POST /api/set-user-data</strong>
          <p>Sets encrypted user data in a cookie</p>
          <button onclick="setUserData()">Test Set User Data</button>
        </div>
        
        <div class="endpoint">
          <strong>GET /api/get-user-data</strong>
          <p>Retrieves and decrypts user data</p>
          <button onclick="getUserData()">Test Get User Data</button>
        </div>

        <div class="endpoint">
          <strong>GET /api/cookie-status</strong>
          <p>Check all cookies and their encryption status</p>
          <button onclick="checkStatus()">Check Status</button>
        </div>
        
        <div id="result"></div>
      </div>

      <script>
        function displayResult(data) {
          document.getElementById('result').textContent = JSON.stringify(data, null, 2);
        }

        async function setEncryptedCookie() {
          const response = await fetch('/api/set-encrypted-cookie', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: 'Secret data from third party!' })
          });
          const data = await response.json();
          displayResult(data);
        }

        async function getEncryptedCookie() {
          const response = await fetch('/api/get-encrypted-cookie');
          const data = await response.json();
          displayResult(data);
        }

        async function setUserData() {
          const response = await fetch('/api/set-user-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: '12345',
              username: 'john_doe',
              preferences: { theme: 'dark', language: 'en' }
            })
          });
          const data = await response.json();
          displayResult(data);
        }

        async function getUserData() {
          const response = await fetch('/api/get-user-data');
          const data = await response.json();
          displayResult(data);
        }

        async function checkStatus() {
          const response = await fetch('/api/cookie-status');
          const data = await response.json();
          displayResult(data);
        }
      </script>
    </body>
    </html>
  `);
});

// API endpoint to set an encrypted cookie
app.post('/api/set-encrypted-cookie', (req, res) => {
  const { value } = req.body;
  
  if (!value) {
    return res.status(400).json({ error: 'Value is required' });
  }

  try {
    // Set encrypted cookie with secure options
    res.setEncryptedCookie('thirdPartyData', value, {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production'
    });

    res.json({
      success: true,
      message: 'Encrypted cookie set successfully',
      value: value
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get and decrypt a cookie
app.get('/api/get-encrypted-cookie', (req, res) => {
  try {
    const decryptedValue = req.getEncryptedCookie('thirdPartyData');
    
    if (decryptedValue === null) {
      return res.json({
        success: false,
        message: 'No encrypted cookie found or decryption failed'
      });
    }

    res.json({
      success: true,
      decryptedValue: decryptedValue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to set encrypted user data (object)
app.post('/api/set-user-data', (req, res) => {
  const userData = req.body;

  try {
    res.setEncryptedCookieObject('userData', userData, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production'
    });

    res.json({
      success: true,
      message: 'Encrypted user data cookie set successfully',
      data: userData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get encrypted user data
app.get('/api/get-user-data', (req, res) => {
  try {
    const userData = req.getEncryptedCookieObject('userData');
    
    if (userData === null) {
      return res.json({
        success: false,
        message: 'No user data cookie found or decryption failed'
      });
    }

    res.json({
      success: true,
      userData: userData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to check cookie status
app.get('/api/cookie-status', (req, res) => {
  const cookies = req.cookies;
  const cookieNames = Object.keys(cookies);
  
  res.json({
    totalCookies: cookieNames.length,
    cookies: cookieNames,
    encrypted: cookieNames.filter(name => 
      name === 'thirdPartyData' || name === 'userData'
    ),
    message: 'All listed cookies are encrypted using AES-256-GCM'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔒 Inject Synthesizer - Encrypted Cookie Handler`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`\nFeatures:`);
  console.log(`  ✓ AES-256-GCM encryption for third-party cookies`);
  console.log(`  ✓ Secure cookie attributes (httpOnly, sameSite)`);
  console.log(`  ✓ Automatic encryption/decryption`);
  console.log(`  ✓ Support for string and object cookies`);
  console.log(`\nVisit http://localhost:${PORT} to test the application`);
});
