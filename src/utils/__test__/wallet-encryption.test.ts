import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt } from '../encryption';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

describe('Wallet Encryption', () => {
    beforeAll(() => {
        process.env.MASTER_KEY = 'test-key-32-chars-exactly-12345678';
    });

    it('should preserve wallet address after encryption/decryption', () => {
        // Create original keypair
        const originalKeypair = new Ed25519Keypair();
        const originalAddress = originalKeypair.getPublicKey().toSuiAddress();
        const privateKey = originalKeypair.getSecretKey();


        // Encrypt and decrypt
        const encrypted = encrypt(privateKey);
        const decrypted = decrypt(encrypted);

        // Create new keypair from decrypted key
        const recoveredKeypair = Ed25519Keypair.fromSecretKey(decrypted);
        const recoveredAddress = recoveredKeypair.getPublicKey().toSuiAddress();

        expect(recoveredAddress).toBe(originalAddress);
    });
});