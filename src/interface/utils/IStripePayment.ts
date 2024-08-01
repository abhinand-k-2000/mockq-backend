interface  IStripePayment {
    makePayment(data: any, previousUrl: string): Promise<any>
    createSubscription(createSubscriptionRequest: any): Promise<any>
}

export default IStripePayment