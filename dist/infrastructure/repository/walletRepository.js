"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const walletModel_1 = require("../database/walletModel");
const appError_1 = __importDefault(require("../utils/appError"));
class WalletRepository {
    async createWallet(interviewerId) {
        const wallet = new walletModel_1.WalletModel({
            interviewerId, balance: 0, transactions: []
        });
        return await wallet.save();
    }
    async updateWallet(interviewerId, amount, type) {
        const wallet = await walletModel_1.WalletModel.findOne({ interviewerId: interviewerId });
        if (!wallet)
            throw new appError_1.default("Wallet not found ", 404);
        wallet.balance = type === 'credit' ? wallet.balance + amount : wallet.balance - amount;
        wallet.transactions?.push({ amount, type, date: new Date() });
        return await wallet.save();
    }
}
exports.default = WalletRepository;
