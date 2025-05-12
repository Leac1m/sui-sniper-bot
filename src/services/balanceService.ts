// /src/services/balanceService.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { getWalletByTelegramId } from './walletService';

const client = new SuiClient({ url: process.env.SUI_NETWORK || getFullnodeUrl('mainnet') });

export async function getSuiBalance(telegramId: number) {
  const wallet = await getWalletByTelegramId(telegramId);
  if (!wallet) return null;

  const balances = await client.getBalance({ owner: wallet.address });

  return {
    address: wallet.address,
    totalBalance: balances.totalBalance,
    coinType: balances.coinType,
  };
}
