import Stripe from "stripe";
import AppError from "./appError";

// if (process.env.STRIPE_API_SECRET) {
//   var stripe = new Stripe(process.env.STRIPE_API_SECRET);
// }

const stripe = new Stripe(process.env.STRIPE_API_SECRET || '')

class StripePayment {
    // constructor(){}

    makePayment = async (info: any) => {
        try {
            // const {title, price, description} = info
            const { interviewerId, to, from, _id, date, candidateId, price, title, description } = info;
            // const { schedule} = slots;
            console.log("candidateID: ", candidateId)
            // const {title, price, description} = schedule

            const session = await stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              mode: 'payment',
              line_items: [
                // Define your product details here
                { 
                  price_data: {
                    currency: 'inr',
                    product_data: {
                      name: title,
                      description: description
                    },
                    unit_amount: price * 100, // Price in cents
                  },
                  quantity: 1
                },
              ],
              success_url: `http://localhost:5173/candidate/payment-success`,
              cancel_url: `http://localhost:5173/candidate/payment-failed`,
              metadata: { interviewerId, to, from, _id, date, candidateId, price, title, description }
            });
            // console.log("SESSION INSIDE STRIPE: ", session)
            return session.url
            // return session.id
          } catch (error) {
            console.error(error);
            throw new AppError("Failed to create stripe session", 500)
          }
    }
}

export default StripePayment
