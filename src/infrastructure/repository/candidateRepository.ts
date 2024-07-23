import Candidate from "../../domain/entitites/candidate";
import Feedback from "../../domain/entitites/feedBack";
import { InterviewerRegistration } from "../../domain/entitites/interviewer";
import InterviewerRating from "../../domain/entitites/interviewerRating";
import ScheduledInterview from "../../domain/entitites/scheduledInterview";
import Stack from "../../domain/entitites/stack";
import ICandidateRepository, {
  InterviewerBasic,
} from "../../interface/repositories/ICandidateRepository";
import { CandidateModel } from "../database/candidateModel";
import { FeedBackModel } from "../database/feedBackModel";
import { InterviewSlotModel } from "../database/interviewSlotModel";
import { InterviewerModel } from "../database/interviewerModel";
import { InterviewerRatingModel } from "../database/interviewerRatingModel";
import { ScheduledInterviewModel } from "../database/scheduledInterviewModel";
import { StackModel } from "../database/stackModel";
import AppError from "../utils/appError";

class CandidateRepository implements ICandidateRepository {
  async findByEmail(email: string): Promise<Candidate | null> {
    const candidateExists = await CandidateModel.findOne({ email: email });
    // if (!candidateExists) {
    //   throw new AppError("Candidate not found", 404);
    // }
    return candidateExists;
  }

  async saveCandidate(candidate: Candidate): Promise<Candidate | null> {
    const newCandidate = new CandidateModel(candidate);
    const savedCandidate = await newCandidate.save();
    if (!savedCandidate) {
      throw new AppError("Failed to save candidate", 500);
    }
    return savedCandidate;
  }

  async findCandidateById(id: string): Promise<Candidate | null> {
    const candidateData = await CandidateModel.findById(id);
    if (!candidateData) {
      throw new AppError("Candidate not found", 404);
    }
    return candidateData;
  }

  async findAllStacks(): Promise<Stack[]> {
    const stacks = await StackModel.find({ isListed: true });
    if (!stacks) {
      throw new AppError("Failed to fetch stacks from database", 500);
    }
    return stacks;
  }

  async getInterviewersByTech(
    techName: string
  ): Promise<InterviewerBasic[] | null> {
    const interviewersIdsList = await InterviewSlotModel.aggregate([
      {
        $unwind: "$slots",
      },
      {
        $unwind: "$slots.schedule",
      },
      {
        $match: {
          $or: [
            { "slots.schedule.title": { $regex: techName, $options: "i" } },
            {
              "slots.schedule.description": { $regex: techName, $options: "i" },
            },
            { "slots.schedule.technologies": { $in: [techName] } },
          ],
        },
      },
      {
        $group: {
          _id: "$interviewerId",
        },
      },
    ]);

    if (!interviewersIdsList)
      throw new AppError("No interviews available", 404);

    const interviewersIds = interviewersIdsList.map((item) => item._id);

    const interviewersDetails = await InterviewerModel.find(
      { _id: { $in: interviewersIds } },
      {
        name: 1,
        profilePicture: 1,
        introduction: 1,
        currentDesigantion: 1,
        organisation: 1,
      }
    );

    return interviewersDetails;
  }

  async getInterviewerSlotsDetails(
    interviewerId: string,
    techName: string
  ): Promise<any> {
    const interviewerDetails = await InterviewerModel.findById(interviewerId, {
      name: 1,
      currentDesignation: 1,
      organisation: 1,
      profilePicture: 1,
      yearsOfExperience: 1,
    });


    // Slots which are in the past are not fetched 

    const interviewSlotDetails = await InterviewSlotModel.aggregate([
      {
        $match: { interviewerId: interviewerId },
      },
      {
        $unwind: "$slots",
      },
      {
        $unwind: "$slots.schedule",
      },
      {
        $match: {
          $or: [
            { "slots.schedule.title": { $regex: techName, $options: "i" } },
            {
              "slots.schedule.description": { $regex: techName, $options: "i" },
            },
            { "slots.schedule.technologies": { $in: [techName] } },
          ],
          // "slots.date": {$gte: new Date()},
          
        },   
      },
      {
        $match: {
          $or: [
            { "slots.date": { $gt: new Date() } }, // Future dates
            {
              $and: [
                { "slots.date": { $eq: new Date().toISOString().split("T")[0] } }, // Today's date
                { "slots.schedule.timeTo": { $gte: new Date() } }, // Times that are not in the past
              ],
            },
          ],
        },
      },
      {
        $sort: {"slots.date": 1}
      }
    ]);



    const details = {
      interviewerDetails,
      interviewSlotDetails,
    };

    return details;
  }

  async bookSlot(info: any): Promise<void> {
    const { interviewerId, _id, date, candidateId } = info;

    try {
      const slot = await InterviewSlotModel.findOneAndUpdate(
        {
          interviewerId: interviewerId,
          "slots.date": date,
          "slots.schedule._id": _id,
        },
        {
          $set: { "slots.$[slotElem].schedule.$[schedElem].status": "booked" },
        },
        {
          arrayFilters: [{ "slotElem.date": date }, { "schedElem._id": _id }],
          new: true, // Return the updated document
        }
      );

      return;
    } catch (error) {
      console.error("Error updating slot: ", error);
      throw new Error("Failed to book slot");
    }
  }

  async getScheduledInterviews(candidateId: string): Promise<ScheduledInterview[] | null> {
    const interviewList = await ScheduledInterviewModel.find({candidateId: candidateId})

    return interviewList 

  }   

  async updatePassword(candidateId: string, password: string): Promise<void | null> {
      await CandidateModel.findByIdAndUpdate(candidateId, {
        password: password
      })

  }


  async getFeedbackDetails(interviewId: string): Promise<Feedback | null> {

    
    const feedback = await FeedBackModel.aggregate([
      {
        $match: {interviewId: interviewId}
      }, {
        $lookup: {
          from: "interviewers",
          let: {interviewerId: {$toObjectId: "$interviewerId"}},
          pipeline: [
            {$match: {$expr: {$eq: ["$_id", "$$interviewerId"]}}},
            {$project: {name: 1}}
          ],
          as: "interviewer"
        }
      },
      {
        $unwind: "$interviewer"
      },
      {
        $lookup: {
          from: "candidates",
          let: {candidateId: {$toObjectId: "$candidateId"}},
          pipeline: [
            {$match: {$expr: {$eq: ["$_id", "$$candidateId"]}}},  
            {$project: {name: 1}}
          ],
          as: "candidate"
        }
      },{
        $unwind: "$candidate"
      }
    ])


    return feedback[0]
  }


  async scehduledInterviewDetails(interviewId: string): Promise<ScheduledInterview | null> {
      const interviewDetails = await ScheduledInterviewModel.findById(interviewId)
      return interviewDetails
  }



  async getAllPremiumCandidates(search: string, candidateId: string): Promise<Candidate[]> {

    const candidates = await CandidateModel.find(
      {
        $and: [

          {$or: [
            {name: {$regex: search, $options: 'i'}},
            {email: {$regex: search, $options: 'i'}}, 
          ]},
          {isPremium: true}
        ]
      }
    ).find({_id: {$ne: candidateId}});
    return candidates
  }

  async saveInterviewerRating(data: InterviewerRating): Promise<void> {
    const {interviewerId, candidateId, interviewId, rating, comment} = data;

    const newRating =  new InterviewerRatingModel({
      interviewerId, candidateId, interviewId, rating, comment
    })

   await newRating.save()

   await ScheduledInterviewModel.findByIdAndUpdate(interviewId, {interviewerRatingAdded: true})

  }


  async getCandidateAnalytics(candidateId: string): Promise<any> {

    console.log(candidateId)
    
    const interviews = await ScheduledInterviewModel.aggregate([
      {
        $match: {candidateId: candidateId}
      },
       {
        $group: {_id: '$status', totalNumber: {$sum: 1}}
      }
    ])

    const interviewCounts = {completed: 0, scheduled: 0}

    interviews.forEach((item) => {
      if(item._id === 'Completed'){
        interviewCounts.completed = item.totalNumber
      }else if(item._id === 'Scheduled') {
        interviewCounts.scheduled = item.totalNumber
      }
    })


    return interviewCounts
  }

  async getScheduledInterviewByRoomId(roomId: string): Promise<ScheduledInterview | null> {
    const interview = await ScheduledInterviewModel.findOne({roomId: roomId})
    return interview
  }
}

export default CandidateRepository;
