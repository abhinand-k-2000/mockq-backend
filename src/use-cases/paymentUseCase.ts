import AppError from "../infrastructure/utils/appError";
import IPaymentRepository from "../interface/repositories/IPaymentRepository";
import IWalletRepository from "../interface/repositories/IWalletRepository";
import IStripePayment from "../interface/utils/IStripePayment";

class PaymentUseCase {
  constructor(
    private stripePayment: IStripePayment,
    private paymentRepository: IPaymentRepository,
    private walletRepository: IWalletRepository
  ) {}

  async makePayment(info: any, previousUrl: string) {
    console.log("prev url: ", previousUrl)
    console.log("Inside make payment: ", info);

    const response = await this.stripePayment.makePayment(info, previousUrl);
    if (!response) {
      throw new AppError("Payment failed", 500);
    }
    return response;
  }

    async handleSuccessfulPayment(session: any) {
      const {
        interviewerId,
        to,
        from,
        _id,
        date,
        candidateId,
        price,
        title,
        description,
      } = session.metadata;

      const book = await this.paymentRepository.bookSlot(session.metadata);
      console.log("BOOK: ", book)
      const type = 'credit';
      const wallet = await this.walletRepository.updateWallet(interviewerId, price, type)
      console.log("WALLET: ", wallet)

    }

  async makeSubscription(req: any) {
    try {
      console.log('inside use case: ', req)
      const response = await this.stripePayment.createSubscription(req);
      return response;
    } catch (error) {
      throw error;
    }
  }


  async handleSubscriptionPayment(invoice: any, candidateId: string) {
    const {customer, subscription} = invoice;

    const updateUserPremium = await this.paymentRepository.updateUserPremiumStatus(candidateId)

    console.log(`Subscription ${subscription} for customer ${customer} paid successfully`);

  }
}

export default PaymentUseCase;
