"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../infrastructure/utils/appError"));
class PaymentUseCase {
    constructor(stripePayment, paymentRepository, walletRepository) {
        this.stripePayment = stripePayment;
        this.paymentRepository = paymentRepository;
        this.walletRepository = walletRepository;
    }
    async makePayment(info, previousUrl) {
        console.log("prev url: ", previousUrl);
        console.log("Inside make payment: ", info);
        const response = await this.stripePayment.makePayment(info, previousUrl);
        if (!response) {
            throw new appError_1.default("Payment failed", 500);
        }
        return response;
    }
    async handleSuccessfulPayment(session) {
        const { interviewerId, to, from, _id, date, candidateId, price, title, description, } = session.metadata;
        const book = await this.paymentRepository.bookSlot(session.metadata);
        console.log("BOOK: ", book);
        const type = 'credit';
        const wallet = await this.walletRepository.updateWallet(interviewerId, price, type);
        console.log("WALLET: ", wallet);
    }
    async makeSubscription(req) {
        try {
            console.log('inside use case: ', req);
            const response = await this.stripePayment.createSubscription(req);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async handleSubscriptionPayment(invoice, candidateId) {
        const { customer, subscription } = invoice;
        const updateUserPremium = await this.paymentRepository.updateUserPremiumStatus(candidateId);
        console.log(`Subscription ${subscription} for customer ${customer} paid successfully`);
    }
}
exports.default = PaymentUseCase;
