import Stripe from "stripe";
import AppError from "./appError";


const stripe = new Stripe(process.env.STRIPE_API_SECRET || "");

class StripePayment {

  makePayment = async (info: any, previousUrl: string) => {
    // console.log('inside sripe make payment: ', previousUrl)
    try {
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
        roomId,
      } = info;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          // Define your product details here
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: title,
                description: description,
              },
              unit_amount: price * 100, // Price in cents
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.BASE_URL}/candidate/payment-success`,
        cancel_url: `${process.env.BASE_URL}${previousUrl}`,
        metadata: {
          interviewerId,
          to,
          from,
          _id,
          date,
          candidateId,
          price,
          title,
          description,
          roomId,
        },
      });
      return session.url;
    } catch (error) {
      console.error(error);
      throw new AppError("Failed to create stripe session", 500);
    }
  };

  createSubscription = async (createSubscriptionRequest: any) => {

    
    try {
      const customer = await stripe.customers.create({
        name: createSubscriptionRequest.name,
        email: createSubscriptionRequest.email,
      });

      // get the price id from the front-end
      const priceId = createSubscriptionRequest.priceId;
      const candidateId = createSubscriptionRequest.candidateId

      console.log("inside strip payment: candidatID: ", candidateId)
  
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        default_payment_method: createSubscriptionRequest.paymentMethodId,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        metadata: {
          candidateId: createSubscriptionRequest.candidateId,  
        },
        expand: ['latest_invoice.payment_intent'],
      });

      console.log("subscription in strip payment: ", subscription)
  
      const invoice = subscription.latest_invoice as Stripe.Invoice
      
      if(invoice.payment_intent){
        const intent = invoice.payment_intent as Stripe.PaymentIntent
        await stripe.paymentIntents.update(intent.id, {
          metadata: { candidateId: candidateId },
      });
      await stripe.invoices.update(invoice.id, {
          metadata: { candidateId: candidateId },
      });
        return {
          subscriptionId: subscription.id,
          clientSecret: intent.client_secret
        }
      }else {
        throw new AppError('Payment intent not found', 400);
      }
    } catch (error) {
      console.log(error)
    }
  };
}

export default StripePayment;
