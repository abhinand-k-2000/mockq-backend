import Candidate from "../../domain/entitites/candidate";
import { InterviewerRegistration } from "../../domain/entitites/interviewer";
import Stack from "../../domain/entitites/stack";
import ICandidateRepository, { InterviewerBasic } from "../../interface/repositories/ICandidateRepository";
import { CandidateModel } from "../database/candidateModel";
import { InterviewSlotModel } from "../database/interviewSlotModel";
import { InterviewerModel } from "../database/interviewerModel";
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


 async getInterviewersByTech(techName: string): Promise<InterviewerBasic[] | null> {

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
            { "slots.schedule.technologies": { $in: [techName] } }
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
  

  async getInterviewerSlotsDetails(interviewerId: string, techName: string): Promise<any> {

    const interviewerDetails = await InterviewerModel.findById(interviewerId, {name: 1, currentDesignation: 1, organisation: 1, profilePicture: 1, yearsOfExperience: 1});
    const interviewSlotDetails = await InterviewSlotModel.aggregate([
      {
        $match: {interviewerId: interviewerId}
      },
      {
        $unwind: "$slots"
      },
      {
        $unwind: "$slots.schedule"
      },
      {
        $match: {
          $or: [
            { "slots.schedule.title": { $regex: techName, $options: "i" } },
            {
              "slots.schedule.description": { $regex: techName, $options: "i" },
            },
            { "slots.schedule.technologies": { $in: [techName] } }
          ],
        },
      },
    ])


    const details = {
      interviewerDetails, interviewSlotDetails
    }

    return details
  }

  
} 

export default CandidateRepository;
