import IPaymentRepository from "../../interface/repositories/IPaymentRepository";
import { CandidateModel } from "../database/candidateModel";
import { InterviewSlotModel } from "../database/interviewSlotModel";
import { ScheduledInterviewModel } from "../database/scheduledInterviewModel";
import AppError from "../utils/appError";


class PaymentRepository implements IPaymentRepository {

    async bookSlot(info: any): Promise<void | null> {
        const { interviewerId, to, from, _id, date, candidateId, price, title, description, roomId } = info
    
        try {
          const updatedSlot = await InterviewSlotModel.findOneAndUpdate(
            {
              interviewerId: interviewerId,
              'slots.date': date,
              'slots.schedule._id': _id
            },
            {
              $set: { 'slots.$[slotElem].schedule.$[schedElem].status': 'booked' }
            },
            {
              arrayFilters: [
                { 'slotElem.date': date },
                { 'schedElem._id': _id }
              ],
              new: true // Return the updated document
            }
          );
    
          if (!updatedSlot) {
            console.error("Slot not found or update failed");
            return null;
          }
    

          const scheduledInterview = new ScheduledInterviewModel({
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

        const savedScheduledInterview = await scheduledInterview.save()


          return;
        } catch (error) {
          console.error("Error updating slot: ", error);
          throw new Error("Failed to book slot");
        }

      }

    async updateUserPremiumStatus(candidateId: string): Promise<void> {


      console.log("inside the payment repository: ", candidateId)

      const currentDate = new Date();

      const oneYearFromNow = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate())

      const updateUser = await CandidateModel.findByIdAndUpdate(candidateId, {
        isPremium: true, 
        subscriptionType: 'premium',
        subscriptionExpiry: oneYearFromNow
      })

      if(!updateUser) throw new AppError("User not found or failed to update", 500)
    }

    
}

31


export default PaymentRepository