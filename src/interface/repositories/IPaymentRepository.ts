



interface IPaymentRepository {
    bookSlot(data: any): Promise<void | null>

    updateUserPremiumStatus(candidateId: string): Promise<void>


}

export default IPaymentRepository