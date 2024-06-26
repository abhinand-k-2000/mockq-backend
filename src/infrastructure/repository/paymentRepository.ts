import IPaymentRepository from "../../interface/repositories/IPaymentRepository";
import { InterviewSlotModel } from "../database/interviewSlotModel";
import { ScheduledInterviewModel } from "../database/scheduledInterviewModel";


class PaymentRepository implements IPaymentRepository {

    async bookSlot(info: any): Promise<void | null> {
        // const { interviewerId, _id, date, candidateId } = info;
        const { interviewerId, to, from, _id, date, candidateId, price, title, description } = info
        console.log("Info: ", info)
    
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
    
          console.log("Slot updated successfully: ", updatedSlot);

          const scheduledInterview = new ScheduledInterviewModel({
            interviewerId,
            candidateId,
            date,
            fromTime: from,
            toTime: to,
            price,
            title,
            description
        });

        const savedScheduledInterview = await scheduledInterview.save()
        console.log("Scheduled interview created: ", savedScheduledInterview);


          return;
        } catch (error) {
          console.error("Error updating slot: ", error);
          throw new Error("Failed to book slot");
        }

      }

    
}


export default PaymentRepository