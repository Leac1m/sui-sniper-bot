import crypto from 'crypto';

// Validate master key presence
if (!process.env.MASTER_KEY) {
  throw new Error('MASTER_KEY environment variable is not set');
}

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.MASTER_KEY, 'salt', 32);

export function encrypt(text: string): string {
  try {
    if (!text) {
      throw new Error('Text to encrypt cannot be empty');
    }
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    // Preserve the original error message
    throw error instanceof Error ? error : new Error('Failed to encrypt data');
  }
}

export function decrypt(encrypted: string): string {
  try {
    if (!encrypted || !encrypted.includes(':')) {
      throw new Error('Invalid encrypted string format');
    }

    const [ivHex, encryptedText] = encrypted.split(':');
    if (!ivHex || !encryptedText) {
      throw new Error('Invalid encrypted string format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedText, 'hex')),
      decipher.final()
    ]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption failed:', error);
    // Preserve the original error message
    throw error instanceof Error ? error : new Error('Failed to decrypt data');
  }
}
