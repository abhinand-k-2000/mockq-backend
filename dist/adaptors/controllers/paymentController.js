"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const uuid_1 = require("uuid");
const appError_1 = __importDefault(require("../../infrastructure/utils/appError"));
const stripe = new stripe_1.default(process.env.STRIPE_API_SECRET || "");
class PaymentController {
    constructor(paymentCase) {
        this.paymentCase = paymentCase;
    }
    async makePayment(req, res, next) {
        try {
            const { data, previousUrl } = req.body;
            const candidateId = req.candidateId?.toString();
            const { interviewerId, slots } = data;
            const { schedule, date } = slots;
            const { title, price, description, to, from, _id } = schedule;
            const roomId = (0, uuid_1.v4)();
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
                roomId,
            };
            const response = await this.paymentCase.makePayment(info, previousUrl);
            return res.status(200).json({ success: true, data: response });
        }
        catch (error) {
            next(error);
        }
    }
    async handleWebhook(req, res, next) {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET.toString();
        // console.log("Received webhook request");
        // console.log("Headers:", req.headers);
        // console.log("Raw Body:", req.body.toString("utf8")); // Ensure this is a string for logging
        // console.log("endpoint: ", endpointSecret);
        const sig = req.headers["stripe-signature"];
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            console.log("Webhook signature verified successfully");
        }
        catch (error) {
            console.error(`Webhook signature verification failed: ${error.message}`);
            return res.status(400).send(`Webhook Error: ${error.message}`);
        }
        switch (event.type) {
            case "checkout.session.completed":
                console.log("Inside checkout.session.completed");
                const session = event.data.object;
                await this.paymentCase.handleSuccessfulPayment(session);
                break;
            case "invoice.payment_succeeded":
                console.log("Inside invoice.payment_succeeded");
                const invoice = event.data.object;
                if (invoice.metadata && invoice.metadata.candidateId) {
                    const candidateId = invoice.metadata.candidateId;
                    console.log("candidate id in switch : ", candidateId);
                    await this.paymentCase.handleSubscriptionPayment(invoice, candidateId);
                }
                else {
                    console.warn("Invoice metadata or candidateId is missing");
                }
                break;
            default:
            // console.log(`Unhandled event type ${event.type}`)
        }
        res.json({ received: true });
    }
    async createSubscription(req, res, next) {
        try {
            const { name, email, priceId, candidateId } = req.body;
            if (!name || !email || !priceId || !candidateId)
                throw new appError_1.default("Missing required fields", 400);
            const data = { name, email, priceId, candidateId };
            const response = await this.paymentCase.makeSubscription(data);
            return res.status(200).json({ success: true, data: response });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = PaymentController;
