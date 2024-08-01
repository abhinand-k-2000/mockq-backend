"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const appError_1 = __importDefault(require("./appError"));
const stripe = new stripe_1.default(process.env.STRIPE_API_SECRET || "");
class StripePayment {
    constructor() {
        this.makePayment = async (info, previousUrl) => {
            console.log('inside sripe make payment: ', previousUrl);
            try {
                const { interviewerId, to, from, _id, date, candidateId, price, title, description, roomId, } = info;
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
                    success_url: `https://mockq.vercel.app/candidate/payment-success`,
                    // cancel_url: `http://localhost:5173${previousUrl}`,
                    cancel_url: `https://mockq.vercel.app/${previousUrl}`,
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
            }
            catch (error) {
                console.error(error);
                throw new appError_1.default("Failed to create stripe session", 500);
            }
        };
        this.createSubscription = async (createSubscriptionRequest) => {
            try {
                const customer = await stripe.customers.create({
                    name: createSubscriptionRequest.name,
                    email: createSubscriptionRequest.email,
                });
                // get the price id from the front-end
                const priceId = createSubscriptionRequest.priceId;
                const candidateId = createSubscriptionRequest.candidateId;
                console.log("inside strip payment: candidatID: ", candidateId);
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
                console.log("subscription in strip payment: ", subscription);
                const invoice = subscription.latest_invoice;
                if (invoice.payment_intent) {
                    const intent = invoice.payment_intent;
                    await stripe.paymentIntents.update(intent.id, {
                        metadata: { candidateId: candidateId },
                    });
                    await stripe.invoices.update(invoice.id, {
                        metadata: { candidateId: candidateId },
                    });
                    return {
                        subscriptionId: subscription.id,
                        clientSecret: intent.client_secret
                    };
                }
                else {
                    throw new appError_1.default('Payment intent not found', 400);
                }
            }
            catch (error) {
                console.log(error);
            }
        };
    }
}
exports.default = StripePayment;
