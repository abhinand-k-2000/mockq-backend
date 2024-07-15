interface  IStripePayment {
    makePayment(data: any): Promise<any>
    createSubscription(createSubscriptionRequest: any): Promise<any>
}

export default IStripePayment