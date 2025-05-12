// /src/services/walletService.ts
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getDB } from '@/db/mongoClient';
import { encrypt } from '@/utils/encryption';
import { fromBase64 } from '@mysten/sui/utils';

export async function createWallet(telegramId: number) {
  const keypair = new Ed25519Keypair();
  const privateKey = keypair.getPublicKey().toBase64(); // base64-encoded
  const encryptedKey = encrypt(privateKey);
  const address = keypair.toSuiAddress();

  const db = await getDB();
  await db.collection('wallets').updateOne(
    { telegramId },
    {
      $set: {
        telegramId,
        address,
        encryptedPrivateKey: encryptedKey,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  return { address };
}

export async function importWallet(telegramId: number, privateKeyB64: string) {
    const rawPrivateKey = fromBase64(privateKeyB64).slice(0, 32); // extract 32-byte raw key
    const keypair = Ed25519Keypair.fromSecretKey(rawPrivateKey);
    const address = keypair.toSuiAddress();
  
    const encryptedKey = encrypt(privateKeyB64);
  
    const db = await getDB();
    await db.collection('wallets').updateOne(
      { telegramId },
      {
        $set: {
          telegramId,
          address,
          encryptedPrivateKey: encryptedKey,
          importedAt: new Date(),
        },
      },
      { upsert: true }
    );
  
    return { address };
  }

export async function getWalletByTelegramId(telegramId: number) {
  const db = await getDB();
  const wallet = await db.collection('wallets').findOne({ telegramId });

  if (!wallet) return null;

  return {
    address: wallet.address,
    createdAt: wallet.createdAt || wallet.importedAt,
  };
}
