type SnipeRequest = {
    recipient: string;
    amount: number;
  };
  
  const snipeCache = new Map<number, SnipeRequest>(); // Map<telegramId, snipe>
  
  export function setPendingSnipe(id: number, data: SnipeRequest) {
    snipeCache.set(id, data);
  }
  
  export function getPendingSnipe(id: number): SnipeRequest | undefined {
    return snipeCache.get(id);
  }
  
  export function clearPendingSnipe(id: number) {
    snipeCache.delete(id);
  }
  