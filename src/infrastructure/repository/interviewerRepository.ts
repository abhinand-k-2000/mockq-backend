import Feedback from "../../domain/entitites/feedBack";
import InterviewSlot, {
  Slot,
  Schedule,
} from "../../domain/entitites/interviewSlot";
import { InterviewerRegistration } from "../../domain/entitites/interviewer";
import ScheduledInterview from "../../domain/entitites/scheduledInterview";
import Stack from "../../domain/entitites/stack";
import IInterviewerRepository from "../../interface/repositories/IInterviewerRepository";
import { FeedBackModel } from "../database/feedBackModel";
import { InterviewSlotModel } from "../database/interviewSlotModel";
import { InterviewerModel } from "../database/interviewerModel";
import { ScheduledInterviewModel } from "../database/scheduledInterviewModel";
import { StackModel } from "../database/stackModel";
import AppError from "../utils/appError";



class InterviewerRepository implements IInterviewerRepository {
  async findByEmail(email: string): Promise<InterviewerRegistration | null> {
    const interviewerFound = await InterviewerModel.findOne({ email: email });
    // if (!interviewerFound) throw new AppError("Interviewer not found", 404);

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

  async saveInterviewSlot(
    slotData: InterviewSlot
  ): Promise<InterviewSlot | null> {
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
          technologies: scheduleItem.technologies,
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
              throw new AppError("Time slot already taken", 400);

              interviewSlot!.slots[existingSlotIndex].schedule[
                existingScheduleIndex!
              ] = newSchedule;
            }
          });
        }
      });
    }

    const savedSlot = await interviewSlot.save();
    return savedSlot;
  }

  async getInterviewSlots(
    interviewerId: string,
    page: number,
    limit: number,
    searchQuery: string
  ): Promise<{ slots: InterviewSlot[]; total: number }> {
console.log(searchQuery)
    const pipeline: any[] = [
      {
        $match: { interviewerId: interviewerId.toString() }
      },
      {
        $unwind: "$slots"
      },
    ];

    console.log(await InterviewSlotModel.aggregate(pipeline))
  
    if (searchQuery) {
      pipeline.push({
        $match: {
          $or: [
            {"slots.schedule.title": {$regex: searchQuery, $options: "i"}},
            {"slots.schedule.technologies": {$elemMatch: {$regex: searchQuery, $options: "i"}}}
          ]
        }
      });
    }
  
    pipeline.push(
      {
        $project: {
          _id: 0,
          date: "$slots.date",
          schedule: "$slots.schedule"
        }
      },
      {
        $sort: { date: -1 }
      }
    );
  
    const totalPipeline = [...pipeline, { $count: "total" }];
    const [totalResult] = await InterviewSlotModel.aggregate(totalPipeline);
    const total = totalResult ? totalResult.total : 0;
  
    pipeline.push(
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit
      }
    );
  
    const slots = await InterviewSlotModel.aggregate(pipeline);
  
    return { slots, total };
  }
  
  

  async getDomains(): Promise<Stack[] | null> {
    const domainList = await StackModel.find();
    if (!domainList) throw new AppError("Domains not found!", 400);
    return domainList;
  }

  async updatePassword(
    interivewerId: string,
    password: string
  ): Promise<void | null> {
    await InterviewerModel.findByIdAndUpdate(interivewerId, {
      password: password,
    });
  }

  async getScheduledInterviews(
    interviewerId: string,
    page: number, limit: number
  ): Promise<{interviews: ScheduledInterview[], total: number}> {
    const list = await ScheduledInterviewModel.find({
      interviewerId: interviewerId,
    }).skip((page - 1) * limit).limit(limit).sort({ date: -1 });

    const total = await ScheduledInterviewModel.find({interviewerId}).countDocuments()

    if (!list) throw new AppError("Interviews are not scheduled", 404);

    return {interviews: list, total};
  }

  async getScheduledInterviewById(
    interviewId: object
  ): Promise<ScheduledInterview[] | null> {
    const interview = await ScheduledInterviewModel.aggregate([
      {
        $match: { _id: interviewId }, // Use interviewId directly as a string
      },
      {
        $lookup: {
          from: "interviewers",
          let: { interviewerId: { $toObjectId: "$interviewerId" } }, // Convert interviewerId to ObjectId
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$interviewerId"] } } },
            { $project: { name: 1, profilePicture: 1 } },
          ],
          as: "interviewer",
        },
      },
      { $unwind: "$interviewer" },
      {
        $lookup: {
          from: "candidates",
          let: { candidateId: { $toObjectId: "$candidateId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$candidateId"] } } },
            { $project: { name: 1, email: 1, mobile: 1 } },
          ],
          as: "candidate",
        },
      },
      {
        $unwind: "$candidate",
      },
    ]);

    return interview[0];
  }

  async saveFeedback(feedbackDetails: Feedback): Promise<Feedback> {
    const {
      interviewId,
      interviewerId,
      candidateId,
      technicalSkills,
      communicationSkills,
      problemSolvingSkills,
      strength,
      areaOfImprovement,
      additionalComments,
    } = feedbackDetails;

    const feedback = new FeedBackModel({
      interviewId,
      interviewerId,
      candidateId,
      technicalSkills,
      communicationSkills,
      problemSolvingSkills,
      strength,
      areaOfImprovement,
      additionalComments,
    });

    const feedbackSaved = await feedback.save();

     await ScheduledInterviewModel.findByIdAndUpdate(
      interviewId,
      {
        status: "Completed",
      }
    );

    return feedbackSaved
    
  }

  async getPaymentDashboard(interviewerId: string): Promise<any> {

    // const interviews = await ScheduledInterviewModel.find({interviewerId: interviewerId})
      
    const interviews = await ScheduledInterviewModel.aggregate([
      {
        $match: {interviewerId: interviewerId.toString()}
      },
      {
        $lookup: {
          from: "candidates",
          let: {candidateId: {$toObjectId: "$candidateId"}},
          pipeline: [
            {
              $match: {
                $expr: {$eq: ["$_id", "$$candidateId"]}
              }
            }
          ],
          as: "candidate"
        }
      },
      {$unwind: "$candidate"},
      {
        $project: {"candidate.password": 0, "candidate.email": 0, "candidate.mobile": 0}
      }
    ])

    const totalEarnings = await ScheduledInterviewModel.aggregate([
      {
        $match: {interviewerId: interviewerId.toString()}
      },
      {
        $group: {'_id': null, total: {$sum: "$price"}}
      }
    ])

    const totalRevenue = totalEarnings[0]?.total
    return {interviews, totalRevenue}
  }

  async getScheduledInterviewByRoomId(roomId: string): Promise<ScheduledInterview | null> {
    const interview = await ScheduledInterviewModel.findOne({roomId: roomId})
    return interview
  }

  async editProfile(interviewerId: string, details: InterviewerRegistration): Promise<void> {
    const {name, mobile, currentDesignation, organisation, yearsOfExperience, introduction} = details
    await InterviewerModel.findByIdAndUpdate(interviewerId, {
      name,
      mobile, 
      currentDesignation,
      organisation,
      yearsOfExperience, 
      introduction
    })
  }




}

export default InterviewerRepository;
