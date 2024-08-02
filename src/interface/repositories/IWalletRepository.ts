import Wallet from "../../domain/entitites/wallet"


interface IWalletRepository {
    createWallet(interviewerId: string): Promise<Wallet>
    updateWallet(interviewerId: string, amount: number, type: 'credit' | 'debit'): Promise<Wallet>
}

export default IWalletRepository