// /src/services/snipeService.ts
import { getDB } from '@/db/mongoClient';
import { decrypt } from '@/utils/encryption';
import { fromBase64 } from '@mysten/sui/utils';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

const client = new SuiClient({ url: process.env.SUI_NETWORK || getFullnodeUrl('mainnet') });

export async function snipe(telegramId: number, recipient: string, amountSui: number) {
    const db = await getDB();
    const wallet = await db.collection('wallets').findOne({ telegramId });

    if (!wallet) throw new Error('Wallet not found');

    const decryptedKey = decrypt(wallet.encryptedPrivateKey);
    const secret = fromBase64(decryptedKey).slice(0, 32);
    const keypair = Ed25519Keypair.fromSecretKey(secret);
    //   const address = keypair.toSuiAddress();

    const coins = await client.getCoins({ owner: wallet.address });
    const inputCoin = coins.data.find((c) => BigInt(c.balance) >= BigInt(amountSui * 1e9));

    if (!inputCoin) throw new Error('Insufficient SUI balance');

    const tx = new Transaction();

    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountSui * 1e9)]);

    // Fix: Send to recipient instead of back to sender
    tx.transferObjects([coin], tx.pure.address(recipient));
    tx.setGasBudgetIfNotSet(1 * 1e7);

    try {
        const res = await client.signAndExecuteTransaction({
            transaction: tx,
            signer: keypair,
            options: { showEffects: true },
        });

        if (!res.effects?.status?.status === 'success') {
            throw new Error(`Transaction failed: ${res.effects?.status?.error}`);
        }

        return res.digest;
    } catch (error) {
        console.error('Snipe transaction failed:', error);
        throw error;
    }
}
