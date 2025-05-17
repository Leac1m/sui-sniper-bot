export interface SnipeTransaction {
    recipient: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
}