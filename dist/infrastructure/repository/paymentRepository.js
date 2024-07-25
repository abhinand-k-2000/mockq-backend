"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const candidateModel_1 = require("../database/candidateModel");
const interviewSlotModel_1 = require("../database/interviewSlotModel");
const scheduledInterviewModel_1 = require("../database/scheduledInterviewModel");
const appError_1 = __importDefault(require("../utils/appError"));
class PaymentRepository {
    async bookSlot(info) {
        const { interviewerId, to, from, _id, date, candidateId, price, title, description, roomId } = info;
        try {
            const updatedSlot = await interviewSlotModel_1.InterviewSlotModel.findOneAndUpdate({
                interviewerId: interviewerId,
                'slots.date': date,
                'slots.schedule._id': _id
            }, {
                $set: { 'slots.$[slotElem].schedule.$[schedElem].status': 'booked' }
            }, {
                arrayFilters: [
                    { 'slotElem.date': date },
                    { 'schedElem._id': _id }
                ],
                new: true // Return the updated document
            });
            if (!updatedSlot) {
                console.error("Slot not found or update failed");
                return null;
            }
            const scheduledInterview = new scheduledInterviewModel_1.ScheduledInterviewModel({
                interviewerId,
                candidateId,
                date,
                fromTime: from,
                toTime: to,
                price,
                title,
                description,
                roomId
            });
            const savedScheduledInterview = await scheduledInterview.save();
            return;
        }
        catch (error) {
            console.error("Error updating slot: ", error);
            throw new Error("Failed to book slot");
        }
    }
    async updateUserPremiumStatus(candidateId) {
        console.log("inside the payment repository: ", candidateId);
        const currentDate = new Date();
        const oneYearFromNow = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
        const updateUser = await candidateModel_1.CandidateModel.findByIdAndUpdate(candidateId, {
            isPremium: true,
            subscriptionType: 'premium',
            subscriptionExpiry: oneYearFromNow
        });
        if (!updateUser)
            throw new appError_1.default("User not found or failed to update", 500);
    }
}
31;
exports.default = PaymentRepository;
