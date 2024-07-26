import { NextFunction, Request, Response } from "express";
import PaymentUseCase from "../../use-cases/paymentUseCase";
import Stripe from "stripe";
import {v4 as uuidv4} from 'uuid'
import AppError from "../../infrastructure/utils/appError";


const stripe = new Stripe(process.env.STRIPE_API_SECRET || "");

class PaymentController {
  constructor(private paymentCase: PaymentUseCase) {}

  async makePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const candidateId = req.candidateId?.toString();


      const { interviewerId, slots } = data.data;
      const { schedule, date } = slots;
      const { title, price, description, to, from, _id } = schedule;

      const roomId = uuidv4()

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
        roomId
      };

      const response = await this.paymentCase.makePayment(info);
      return res.status(200).json({ success: true, data: response });
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {

    const endpointSecret =process.env.STRIPE_WEBHOOK_SECRET!.toString();
    const sig: any = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }


    switch(event.type) {
      case "checkout.session.completed":
        console.log("Inside checkout.session.completed");
        const session = event.data.object;
        await this.paymentCase.handleSuccessfulPayment(session);
        break;

      case "invoice.payment_succeeded":
        console.log("Inside invoice.payment_succeeded"); 
        const invoice = event.data.object;
        
        if(invoice.metadata && invoice.metadata.candidateId){

          const candidateId = invoice.metadata.candidateId;

          console.log("candidate id in switch : ", candidateId)
          await this.paymentCase.handleSubscriptionPayment(invoice, candidateId)
        }else {
          console.warn('Invoice metadata or candidateId is missing');
        }
        break;

        default: 
          // console.log(`Unhandled event type ${event.type}`)
      }

    res.json({ received: true });
  }


  async createSubscription(req: Request, res: Response, next: NextFunction) {

    try {
      const {name, email, priceId, candidateId} = req.body
    if(!name || !email || !priceId || !candidateId) throw new AppError("Missing required fields", 400)

    const data = {name, email, priceId, candidateId} 


      const response = await this.paymentCase.makeSubscription(data)

      return res.status(200).json({success: true, data: response})
    } catch (error) {   
      next(error)
    }
  }
}

export default PaymentController;
