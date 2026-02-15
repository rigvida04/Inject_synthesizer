const CookieEncryption = require('./cookieEncryption');

/**
 * Middleware for handling encrypted third-party cookies
 * Automatically encrypts and decrypts cookies
 */
class EncryptedCookieMiddleware {
  constructor(secretKey) {
    this.encryption = new CookieEncryption(secretKey);
  }

  /**
   * Express middleware to parse and decrypt cookies
   */
  parser() {
    return (req, res, next) => {
      // Store reference to original cookie-parser cookies
      req.encryptedCookies = {};
      
      // Helper method to get encrypted cookie
      req.getEncryptedCookie = (name) => {
        try {
          const encryptedValue = req.cookies[name];
          if (!encryptedValue) {
            return null;
          }
          return this.encryption.decrypt(encryptedValue);
        } catch (error) {
          console.error(`Failed to decrypt cookie ${name}:`, error.message);
          return null;
        }
      };

      // Helper method to get encrypted cookie as object
      req.getEncryptedCookieObject = (name) => {
        try {
          const encryptedValue = req.cookies[name];
          if (!encryptedValue) {
            return null;
          }
          return this.encryption.decryptObject(encryptedValue);
        } catch (error) {
          console.error(`Failed to decrypt cookie object ${name}:`, error.message);
          return null;
        }
      };

      // Helper method to set encrypted cookie
      res.setEncryptedCookie = (name, value, options = {}) => {
        try {
          const encrypted = this.encryption.encrypt(value);
          // Set secure defaults for third-party cookies
          const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none', // Required for third-party cookies
            ...options
          };
          res.cookie(name, encrypted, cookieOptions);
        } catch (error) {
          console.error(`Failed to encrypt cookie ${name}:`, error.message);
          throw error;
        }
      };

      // Helper method to set encrypted cookie from object
      res.setEncryptedCookieObject = (name, data, options = {}) => {
        try {
          const encrypted = this.encryption.encryptObject(data);
          // Set secure defaults for third-party cookies
          const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none', // Required for third-party cookies
            ...options
          };
          res.cookie(name, encrypted, cookieOptions);
        } catch (error) {
          console.error(`Failed to encrypt cookie object ${name}:`, error.message);
          throw error;
        }
      };

      next();
    };
  }
}

module.exports = EncryptedCookieMiddleware;
