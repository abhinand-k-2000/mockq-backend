import InterviewSlot, {
  Slot,
  Schedule,
} from "../../domain/entitites/interviewSlot";
import { InterviewerRegistration } from "../../domain/entitites/interviewer";
import IInterviewerRepository from "../../interface/repositories/IInterviewerRepository";
import { InterviewSlotModel } from "../database/interviewSlotModel";
import { InterviewerModel } from "../database/interviewerModel";
import AppError from "../utils/appError";

class InterviewerRepository implements IInterviewerRepository {
  async findByEmail(email: string): Promise<InterviewerRegistration | null> {
    const interviewerFound = await InterviewerModel.findOne({ email: email });
    if (!interviewerFound) throw new AppError("Interviewer not found", 404);

    return interviewerFound;
  }

  async saveInterviewer(
    interviewer: InterviewerRegistration
  ): Promise<InterviewerRegistration | null> {
    const newInterviewer = new InterviewerModel(interviewer);
    const savedInterviewer = await newInterviewer.save();
    if (!savedInterviewer) {
      throw new AppError("Failed to save interviewer", 500);
    }
    return newInterviewer;
  }

  async findInterviewerById(
    id: string
  ): Promise<InterviewerRegistration | null> {
    const interviewerData = await InterviewerModel.findById(id);
    if (!interviewerData) {
      throw new AppError("Interviewer not found", 404);
    }
    return interviewerData;
  }

  async saveInterviewerDetails(
    interviewerDetails: InterviewerRegistration
  ): Promise<InterviewerRegistration | null> {
    const updatedInterviewer = await InterviewerModel.findByIdAndUpdate(
      interviewerDetails._id,
      interviewerDetails,
      { new: true }
    );

    return updatedInterviewer || null;
  }

  findById(id: string): Promise<InterviewerRegistration | null> {
    const interivewer = InterviewerModel.findById(id);
    if (!interivewer) {
      throw new AppError("Interviewer not found", 404);
    }
    return interivewer;
  }

  async saveInterviewSlot(slotData: InterviewSlot): Promise<InterviewSlot | null> {
    const { interviewerId, slots } = slotData;

    const transformData = (
      data: any[],
      interviewerId: string
    ): InterviewSlot => {
      const slots: Slot[] = data.map((item) => ({
        date: new Date(item.date),
        schedule: item.schedule.map((scheduleItem: Schedule) => ({
          description: scheduleItem.description,
          from: new Date(scheduleItem.from),
          to: new Date(scheduleItem.to),
          title: scheduleItem.title,
          status: scheduleItem.status as "open" | "booked",
          price: Number(scheduleItem.price),
        })),
      }));
      return { interviewerId, slots };
    };
    const transformedData = transformData(slots, interviewerId);

    let interviewSlot = await InterviewSlotModel.findOne({ interviewerId });

    if (!interviewSlot) {
      interviewSlot = new InterviewSlotModel(transformedData);
    } else {

      transformedData.slots.forEach((newSlot) => {
        const existingSlotIndex = interviewSlot!.slots.findIndex(
          (slot) =>
            slot.date?.toISOString().split("T")[0] ===
            newSlot.date?.toISOString().split("T")[0]
        );

        if (existingSlotIndex === -1) {
          interviewSlot?.slots.push(newSlot);
        } else {
          newSlot.schedule.forEach((newSchedule) => {
            const existingScheduleIndex = interviewSlot?.slots[
              existingSlotIndex
            ].schedule.findIndex(
              (s) =>
                s.from.toISOString() === newSchedule.from.toISOString() &&
                s.to.toISOString() === newSchedule.to.toISOString()
            );

            if (existingScheduleIndex === -1) {
              interviewSlot?.slots[existingSlotIndex].schedule.push(
                newSchedule
              );
            } else {
              throw new AppError("Time slot already taken", 400)
            
              interviewSlot!.slots[existingSlotIndex].schedule[
                existingScheduleIndex!
              ] = newSchedule;
            }
          });
        }
      });
    }

    const savedSlot = await interviewSlot.save();
    return savedSlot
  }

  async getInterviewSlots(
    interviewerId: string
  ): Promise<InterviewSlot[] | null> {

    const slotsList = await InterviewSlotModel.aggregate([
      {
        $match: { interviewerId: interviewerId.toString() },
      },
      {
        $unwind: "$slots",
      },
      {
        $project: {
          _id: 0,
          date: "$slots.date",
          schedule: "$slots.schedule"
        }
      }
     
     
    ]);

    return slotsList;
  }
}

export default InterviewerRepository;

