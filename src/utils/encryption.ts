// /src/utils/encryption.ts
import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.MASTER_KEY!, 'salt', 32);

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(encrypted: string): string {
  const [ivHex, encryptedText] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'hex')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}
