# Inject Synthesizer 🔒

A secure web application that encrypts data from third-party cookies using industry-standard AES-256-GCM encryption.

## Features

- ✅ **AES-256-GCM Encryption**: Military-grade encryption for cookie data
- ✅ **Automatic Encryption/Decryption**: Transparent middleware handles all encryption
- ✅ **Third-Party Cookie Support**: Properly configured for cross-origin cookie scenarios
- ✅ **Secure by Default**: HttpOnly, Secure, and SameSite attributes configured
- ✅ **Object Support**: Encrypt and decrypt both strings and JavaScript objects
- ✅ **Authentication Tags**: Built-in tamper protection with GCM mode
- ✅ **Easy Integration**: Simple Express middleware for quick setup

## Security Features

### Encryption Algorithm
- **Algorithm**: AES-256-GCM (Advanced Encryption Standard with Galois/Counter Mode)
- **Key Size**: 256 bits
- **IV**: Random 16-byte initialization vector for each encryption
- **Authentication**: Built-in authentication tag prevents tampering

### Cookie Security
- **HttpOnly**: Prevents client-side JavaScript access
- **Secure**: HTTPS-only in production
- **SameSite=None**: Configured for third-party cookie scenarios
- **Tamper Protection**: Authentication tags verify data integrity

## Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env and set a strong ENCRYPTION_SECRET
nano .env
```

## Configuration

Set your encryption secret in `.env`:

```env
ENCRYPTION_SECRET=your-super-secret-encryption-key-here-change-this
NODE_ENV=development
PORT=3000
```

**Important**: Use a strong, random secret key in production!

## Usage

### Start the Server

**Important**: You must set the `ENCRYPTION_SECRET` environment variable before starting the server.

```bash
# Set environment variable and start
ENCRYPTION_SECRET=your-super-secret-key npm start

# Or use .env file (recommended)
npm start
```

Visit http://localhost:3000 to see the interactive demo.

### Run Tests

```bash
npm test
```

## API Endpoints

### POST /api/set-encrypted-cookie
Sets an encrypted third-party cookie.

**Request:**
```json
{
  "value": "Secret data from third party!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Encrypted cookie set successfully",
  "value": "Secret data from third party!"
}
```

### GET /api/get-encrypted-cookie
Retrieves and decrypts a cookie.

**Response:**
```json
{
  "success": true,
  "decryptedValue": "Secret data from third party!"
}
```

### POST /api/set-user-data
Sets encrypted user data (object) in a cookie.

**Request:**
```json
{
  "userId": "12345",
  "username": "john_doe",
  "preferences": {
    "theme": "dark",
    "language": "en"
  }
}
```

### GET /api/get-user-data
Retrieves and decrypts user data.

**Response:**
```json
{
  "success": true,
  "userData": {
    "userId": "12345",
    "username": "john_doe",
    "preferences": {
      "theme": "dark",
      "language": "en"
    }
  }
}
```

### GET /api/cookie-status
Check all cookies and their encryption status.

## Code Examples

### Basic Usage

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const EncryptedCookieMiddleware = require('./encryptedCookieMiddleware');

const app = express();
const encryptedCookies = new EncryptedCookieMiddleware('your-secret-key');

app.use(cookieParser());
app.use(encryptedCookies.parser());

// Set an encrypted cookie
app.post('/set', (req, res) => {
  res.setEncryptedCookie('myData', 'sensitive info', {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none'
  });
  res.json({ success: true });
});

// Get an encrypted cookie
app.get('/get', (req, res) => {
  const data = req.getEncryptedCookie('myData');
  res.json({ data });
});
```

### Direct Encryption API

```javascript
const CookieEncryption = require('./cookieEncryption');

const encryption = new CookieEncryption('your-secret-key');

// Encrypt a string
const encrypted = encryption.encrypt('Hello, World!');

// Decrypt a string
const decrypted = encryption.decrypt(encrypted);

// Encrypt an object
const encryptedObj = encryption.encryptObject({ 
  user: 'john', 
  id: 123 
});

// Decrypt an object
const decryptedObj = encryption.decryptObject(encryptedObj);
```

## Architecture

### Components

1. **cookieEncryption.js**: Core encryption/decryption logic using Node's crypto module
2. **encryptedCookieMiddleware.js**: Express middleware for automatic cookie handling
3. **server.js**: Demo Express application with API endpoints
4. **test.js**: Comprehensive test suite

### Encryption Flow

```
Plain Text → [Encrypt] → Base64 Encoded → Cookie Storage
Cookie Storage → Base64 Decode → [Decrypt] → Plain Text
```

Each encryption includes:
- Random IV (16 bytes)
- Authentication Tag (16 bytes)  
- Encrypted Data (variable length)

## Security Best Practices

1. **Use Strong Secret Keys**: Generate random, high-entropy secrets
2. **Rotate Keys Regularly**: Implement key rotation in production
3. **HTTPS Only**: Always use HTTPS in production
4. **Environment Variables**: Never commit secrets to version control
5. **Cookie Attributes**: Use HttpOnly, Secure, and appropriate SameSite settings
6. **Monitor & Log**: Track encryption failures and suspicious activity

## Testing

The test suite validates:
- ✓ Basic encryption and decryption
- ✓ Object encryption
- ✓ Unique IVs for each encryption
- ✓ Tamper detection
- ✓ Wrong key detection
- ✓ Large data handling
- ✓ Special characters
- ✓ Unicode support
- ✓ Edge cases

## License

ISC

## Contributing

Feel free to open issues or submit pull requests for improvements.

