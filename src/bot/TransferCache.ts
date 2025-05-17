type TransferRequest = {
    recipient: string;
    amount: number;
  };
  
  const TransferCache = new Map<number, TransferRequest>(); // Map<telegramId, snipe>
  
  export function setPendingTransfer(id: number, data: TransferRequest) {
    TransferCache.set(id, data);
  }
  
  export function getPendingTransfer(id: number): TransferRequest | undefined {
    return TransferCache.get(id);
  }
  
  export function clearPendingTransfer(id: number) {
    TransferCache.delete(id);
  }
  