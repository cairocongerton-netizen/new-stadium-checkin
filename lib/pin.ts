/**
 * PIN hashing and verification utilities
 * Uses SHA-256 with a salt for secure PIN storage
 */

import crypto from 'crypto';

/**
 * Hash a PIN with a salt for secure storage
 */
export function hashPin(pin: string): string {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');

  // Hash the PIN with the salt using SHA-256
  const hash = crypto
    .createHash('sha256')
    .update(pin + salt)
    .digest('hex');

  // Return salt:hash format
  return `${salt}:${hash}`;
}

/**
 * Verify a PIN against a stored hash
 */
export function verifyPin(pin: string, storedHash: string): boolean {
  try {
    // Split the stored hash into salt and hash
    const [salt, hash] = storedHash.split(':');

    if (!salt || !hash) {
      return false;
    }

    // Hash the provided PIN with the stored salt
    const testHash = crypto
      .createHash('sha256')
      .update(pin + salt)
      .digest('hex');

    // Compare the hashes
    return testHash === hash;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
}
