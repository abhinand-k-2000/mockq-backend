import { NextFunction, Request, Response } from "express";
import PaymentUseCase from "../../use-cases/paymentUseCase";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_SECRET || "");

class PaymentController {
  constructor(private paymentCase: PaymentUseCase) {}

  async makePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const candidateId = req.candidateId?.toString();
      console.log("Candidate ID in makePayment: ", candidateId); // Log the candidateId


      const { interviewerId, slots } = data.data;
      const { schedule, date } = slots;
      const { title, price, description, to, from, _id } = schedule;

      const info = {
        interviewerId,
        to,
        from,
        _id,
        date,
        candidateId,
        price,
        title,
        description,
      };

      // console.log(schedule)
      const response = await this.paymentCase.makePayment(info);
      return res.status(200).json({ success: true, data: response });
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    console.log("Inside webhook");

    const endpointSecret =
      "whsec_e31411d4c8b0d765cd62b1e71d632bc38726b1142487eb8bd4f1f1a21cd1ce59";
    const sig: any = req.headers["stripe-signature"];

    let event;
    console.log("REQUEST: ", req.body);

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
      console.log("Inside checkout.session.completed");
      const session = event.data.object;
      await this.paymentCase.handleSuccessfulPayment(session);
    }

    res.json({ received: true });
  }
}

export default PaymentController;
