import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { getWalletByTelegramId } from './walletService';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

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


export async function faucet(telegramId: number): Promise<{ success: boolean; message: string }> {
  try {
    const wallet = await getWalletByTelegramId(telegramId);
    if (!wallet) throw Error("Using wallet details not found");

    const response = await fetch('https://faucet.testnet.sui.io/v2/gas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FixedAmountRequest: {
          recipient: wallet.address
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Faucet request failed');
    }

    const data = await response.json();
    return {
      success: true,
      message: `Successfully requested SUI tokens. Transaction ID: ${data.transferredGasObjects?.[0]?.id || 'unknown'}`
    };

  } catch (error) {
    console.error('Faucet error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to request SUI tokens'
    };
  }
}