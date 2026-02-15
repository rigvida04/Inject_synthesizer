const CookieEncryption = require('./cookieEncryption');

/**
 * Simple test suite for cookie encryption
 */
function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    return true;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  Error: ${error.message}`);
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('\n🔒 Testing Cookie Encryption\n');

let passedTests = 0;
let totalTests = 0;

// Test 1: Basic encryption and decryption
totalTests++;
if (test('should encrypt and decrypt a simple string', () => {
  const encryption = new CookieEncryption('test-secret-key');
  const original = 'Hello, World!';
  const encrypted = encryption.encrypt(original);
  const decrypted = encryption.decrypt(encrypted);
  
  assert(encrypted !== original, 'Encrypted value should differ from original');
  assert(decrypted === original, 'Decrypted value should match original');
})) passedTests++;

// Test 2: Object encryption
totalTests++;
if (test('should encrypt and decrypt an object', () => {
  const encryption = new CookieEncryption('test-secret-key');
  const original = { userId: '123', name: 'John', data: { foo: 'bar' } };
  const encrypted = encryption.encryptObject(original);
  const decrypted = encryption.decryptObject(encrypted);
  
  assert(JSON.stringify(decrypted) === JSON.stringify(original), 'Decrypted object should match original');
})) passedTests++;

// Test 3: Different values produce different encrypted results
totalTests++;
if (test('should produce different encrypted values for same input', () => {
  const encryption = new CookieEncryption('test-secret-key');
  const original = 'test data';
  const encrypted1 = encryption.encrypt(original);
  const encrypted2 = encryption.encrypt(original);
  
  assert(encrypted1 !== encrypted2, 'Each encryption should be unique due to random IV');
  assert(encryption.decrypt(encrypted1) === original, 'First encryption should decrypt correctly');
  assert(encryption.decrypt(encrypted2) === original, 'Second encryption should decrypt correctly');
})) passedTests++;

// Test 4: Tampered data should fail decryption
totalTests++;
if (test('should fail to decrypt tampered data', () => {
  const encryption = new CookieEncryption('test-secret-key');
  const original = 'secret data';
  const encrypted = encryption.encrypt(original);
  
  // Tamper with the encrypted data
  const buffer = Buffer.from(encrypted, 'base64');
  buffer[buffer.length - 1] ^= 0xFF; // Flip bits in last byte
  const tampered = buffer.toString('base64');
  
  try {
    encryption.decrypt(tampered);
    throw new Error('Should have thrown an error for tampered data');
  } catch (error) {
    assert(error.message.includes('Decryption failed'), 'Should fail with decryption error');
  }
})) passedTests++;

// Test 5: Wrong key should fail decryption
totalTests++;
if (test('should fail to decrypt with wrong key', () => {
  const encryption1 = new CookieEncryption('key1');
  const encryption2 = new CookieEncryption('key2');
  
  const original = 'secret data';
  const encrypted = encryption1.encrypt(original);
  
  try {
    encryption2.decrypt(encrypted);
    throw new Error('Should have thrown an error for wrong key');
  } catch (error) {
    assert(error.message.includes('Decryption failed'), 'Should fail with decryption error');
  }
})) passedTests++;

// Test 6: Large data encryption
totalTests++;
if (test('should handle large data', () => {
  const encryption = new CookieEncryption('test-secret-key');
  const original = 'x'.repeat(10000);
  const encrypted = encryption.encrypt(original);
  const decrypted = encryption.decrypt(encrypted);
  
  assert(decrypted === original, 'Large data should decrypt correctly');
})) passedTests++;

// Test 7: Special characters
totalTests++;
if (test('should handle special characters', () => {
  const encryption = new CookieEncryption('test-secret-key');
  const original = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./~`\n\t';
  const encrypted = encryption.encrypt(original);
  const decrypted = encryption.decrypt(encrypted);
  
  assert(decrypted === original, 'Special characters should be preserved');
})) passedTests++;

// Test 8: Unicode characters
totalTests++;
if (test('should handle Unicode characters', () => {
  const encryption = new CookieEncryption('test-secret-key');
  const original = '🔒 Hello 世界 مرحبا';
  const encrypted = encryption.encrypt(original);
  const decrypted = encryption.decrypt(encrypted);
  
  assert(decrypted === original, 'Unicode characters should be preserved');
})) passedTests++;

// Test 9: Empty string
totalTests++;
if (test('should handle empty string', () => {
  const encryption = new CookieEncryption('test-secret-key');
  const original = '';
  const encrypted = encryption.encrypt(original);
  const decrypted = encryption.decrypt(encrypted);
  
  assert(decrypted === original, 'Empty string should be handled correctly');
})) passedTests++;

// Test 10: Null object properties
totalTests++;
if (test('should handle object with null values', () => {
  const encryption = new CookieEncryption('test-secret-key');
  const original = { a: null, b: undefined, c: 0, d: false };
  const encrypted = encryption.encryptObject(original);
  const decrypted = encryption.decryptObject(encrypted);
  
  // Note: JSON.stringify removes undefined values
  assert(decrypted.a === null, 'Null should be preserved');
  assert(decrypted.c === 0, 'Zero should be preserved');
  assert(decrypted.d === false, 'False should be preserved');
})) passedTests++;

console.log(`\n${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('\n✓ All tests passed!\n');
  process.exit(0);
} else {
  console.log(`\n✗ ${totalTests - passedTests} test(s) failed\n`);
  process.exit(1);
}
