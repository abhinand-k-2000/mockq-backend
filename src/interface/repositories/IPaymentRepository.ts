



interface IPaymentRepository {
    bookSlot(data: any): Promise<void | null>
}

export default IPaymentRepository