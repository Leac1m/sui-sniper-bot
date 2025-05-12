// /src/services/tokenWatcher.ts
import { SuiClient } from '@mysten/sui/client';
import { getFullnodeUrl } from '@mysten/sui/client';

const client = new SuiClient({ url: process.env.SUI_NETWORK || getFullnodeUrl('mainnet') });

let lastCheckpoint: number = 0;

export async function checkForNewPools(callback: (event: any) => void) {
  const events = await client.queryTransactionBlocks({
    filter: {
      // Use specific type, like 'MoveEventType', or 'PackageId'
      // Replace with your pool type or relevant event
      MoveEventModule: '0x1::deepbook::PairCreatedEvent',
    },
    order: 'descending',
    limit: 10,
  });

  for (const tx of events.data) {
    if (tx.checkpoint && Number(tx.checkpoint) > lastCheckpoint) {
      lastCheckpoint = Number(tx.checkpoint);
      callback(tx); // Trigger sniper callback
    }
  }
}
