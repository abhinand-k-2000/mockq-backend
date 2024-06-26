import AppError from "../infrastructure/utils/appError";
import IPaymentRepository from "../interface/repositories/IPaymentRepository";
import IStripePayment from "../interface/utils/IStripePayment";

class PaymentUseCase {
  constructor(private stripePayment: IStripePayment,
    private paymentRepository: IPaymentRepository
  ) {}

  async makePayment(info: any) {

    const response = await this.stripePayment.makePayment(info);
    // console.log("Inside usecase respnose: ", response);  
    if (!response) {
      throw new AppError("Payment failed", 500);
    }

    // const { interviewerId, slots } = data.data;
    // const { schedule, date } = slots;
    // const { title, price, description, to, from, _id } = schedule;

    // const { interviewerId, to, from, _id, date, candidateId} = info


    // const bookMarked = this.paymentRepository.bookSlot(info)

    return response;
  }

  async handleSuccessfulPayment(session: any) {
    const {interviewerId, to, from, _id, date, candidateId, price, title, description } = session.metadata;

    const book = this.paymentRepository.bookSlot(session.metadata)
  }
}

export default PaymentUseCase;  
