const crypto = require('crypto');

/**
 * Cookie encryption utility using AES-256-GCM
 * Provides secure encryption and decryption of cookie data
 */
class CookieEncryption {
  constructor(secretKey) {
    // Ensure the secret key is 32 bytes for AES-256
    if (!secretKey) {
      throw new Error('Secret key is required for encryption');
    }
    this.secretKey = crypto.createHash('sha256').update(secretKey).digest();
  }

  /**
   * Encrypts a cookie value
   * @param {string} value - The value to encrypt
   * @returns {string} - The encrypted value as base64 string
   */
  encrypt(value) {
    try {
      // Generate a random initialization vector
      const iv = crypto.randomBytes(16);
      
      // Create cipher with AES-256-GCM
      const cipher = crypto.createCipheriv('aes-256-gcm', this.secretKey, iv);
      
      // Encrypt the data
      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get the authentication tag
      const authTag = cipher.getAuthTag();
      
      // Combine iv, authTag, and encrypted data
      const combined = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'hex')
      ]);
      
      // Return as base64 for cookie storage
      return combined.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts an encrypted cookie value
   * @param {string} encryptedValue - The encrypted value as base64 string
   * @returns {string} - The decrypted value
   */
  decrypt(encryptedValue) {
    try {
      // Convert from base64
      const combined = Buffer.from(encryptedValue, 'base64');
      
      // Extract components
      const iv = combined.slice(0, 16);
      const authTag = combined.slice(16, 32);
      const encrypted = combined.slice(32);
      
      // Create decipher
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.secretKey, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypts a cookie object (converts to JSON first)
   * @param {object} data - The data object to encrypt
   * @returns {string} - The encrypted value
   */
  encryptObject(data) {
    const jsonString = JSON.stringify(data);
    return this.encrypt(jsonString);
  }

  /**
   * Decrypts a cookie value and parses it as JSON
   * @param {string} encryptedValue - The encrypted value
   * @returns {object} - The decrypted data object
   */
  decryptObject(encryptedValue) {
    const decrypted = this.decrypt(encryptedValue);
    return JSON.parse(decrypted);
  }
}

module.exports = CookieEncryption;
