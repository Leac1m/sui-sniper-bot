import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt } from '../encryption';

describe('Encryption Utils', () => {
    beforeAll(() => {
        process.env.MASTER_KEY = 'test-key-32-chars-exactly-12345678';
    });

    it('should encrypt and decrypt text correctly', () => {
        const originalText = 'test message';
        const encrypted = encrypt(originalText);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(originalText);
    });

    it('should handle empty input', () => {
        expect(() => encrypt('')).toThrow('Text to encrypt cannot be empty');
    });

    it('should handle invalid encrypted format', () => {
        expect(() => decrypt('invalid-format')).toThrow('Invalid encrypted string format');
    });
});