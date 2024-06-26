interface  IStripePayment {
    makePayment(data: any): Promise<any>
}

export default IStripePayment