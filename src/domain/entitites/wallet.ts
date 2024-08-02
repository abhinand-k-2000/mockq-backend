enum TransactionType {
    CREDIT = 'credit',
    DEBIT = 'debit'
}

interface Transaction {
    amount: number;
    type: 'credit' | 'debit';
    date: Date;
}

interface Wallet {
    _id?: string;
    interviewerId: string;
    balance: number;
    transactions?: Transaction[];
}

export default Wallet;
