import IAdminRepository from "../../interface/repositories/IAdminRepository";
import { AdminModel } from "../database/adminModel";
import Admin from "../../domain/entitites/admin";
import Candidate from "../../domain/entitites/candidate";
import { CandidateModel } from "../database/candidateModel";
import { StackModel } from "../database/stackModel";
import Stack from "../../domain/entitites/stack";
import { InterviewerRegistration } from "../../domain/entitites/interviewer";
import { InterviewerModel } from "../database/interviewerModel";
import AppError from "../utils/appError";
import ScheduledInterview, { AggregatedScheduledInterview } from "../../domain/entitites/scheduledInterview";
import { ScheduledInterviewModel } from "../database/scheduledInterviewModel";

class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    const adminExists = await AdminModel.findOne({ email });
    if (!adminExists) {
      throw new AppError("Admin not found", 404);
    }
    return adminExists;
  }

  async create(admin: Admin): Promise<void> {
    const newAdmin = new AdminModel(admin);
    await newAdmin.save();
  }

  async findAllCandidates(
    page: number,
    limit: number
  ): Promise<{ candidates: Candidate[]; total: number }> {
    const candidatesList = await CandidateModel.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await CandidateModel.find().countDocuments();
    if (!candidatesList) {
      throw new AppError("Failed to fetch candidates from database", 500);
    }
    return { candidates: candidatesList, total };
  }

  async findAllInterviewers(
    page: number,
    limit: number
  ): Promise<{ interviewers: InterviewerRegistration[]; total: number }> {
    const interviewersList = await InterviewerModel.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await InterviewerModel.find().countDocuments();
    if (!interviewersList) {
      throw new AppError("Failed to fetch interviewers from database", 500);
    }
    return { interviewers: interviewersList, total };
  }

  async getInterviewerDetails(
    id: string
  ): Promise<InterviewerRegistration | null> {
    const interviewerDetails = await InterviewerModel.findById(id);
    if (!interviewerDetails) {
      throw new AppError("Interviewer not found", 404);
    }
    return interviewerDetails;
  }

  async blockCandidate(candidateId: string): Promise<boolean> {
    const candidate = await CandidateModel.findById(candidateId);
    if (!candidate) {
      throw new AppError("Candidate not found", 404);
    }
    await CandidateModel.findOneAndUpdate(
      { _id: candidateId },
      { isBlocked: !candidate.isBlocked }
    );
    return true;
  }

  async unlistStack(stackId: string): Promise<Stack | null> {
    const stack = await StackModel.findById(stackId);
    if (!stack) throw new AppError("Stack not found", 404);

    const stackUnlist = await StackModel.findByIdAndUpdate(
      stackId,
      { isListed: !stack.isListed },
      { new: true }
    );
    if (!stackUnlist) {
      throw new AppError("Failed to unlist stack", 500);
    }
    return stackUnlist;
  }

  async approveInterviewer(interviewerId: string): Promise<boolean> {
    const interviewer = await InterviewerModel.findByIdAndUpdate(
      { _id: interviewerId },
      { isApproved: true }
    );
    if (!interviewer) {
      throw new AppError("Interviewer not found", 404);
    }
    return true;
  }

  async addStack(stackName: string, technologies: string[]): Promise<boolean> {
    const newStack = new StackModel({
      stackName: stackName,
      technologies: technologies,
    });
    const savedStack = await newStack.save();
    if (!savedStack) {
      throw new AppError("Failed to add stack in the database", 500);
    }
    return true;
  }

  async findAllStacks(
    page: number,
    limit: number
  ): Promise<{ stacks: Stack[]; total: number }> {
    const stacksList = await StackModel.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await StackModel.find().countDocuments();
    if (!stacksList) {
      throw new AppError("Failed to fetch stacks from database", 500);
    }
    return { stacks: stacksList, total };
  }

  async findAllInterviews(
    page: number,
    limit: number
  ): Promise<{ interviews: ScheduledInterview[] | null; total: number }> {
    const interviews = await ScheduledInterviewModel.aggregate([
      {
        $lookup: {
          from: "interviewers",
          let: { interviewerId: { $toObjectId: "$interviewerId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$interviewerId"] } } },
          ],
          as: "interviewer",
        },
      },
      {
        $unwind: "$interviewer",
      },
      {
        $project: {
          "interviewer.password": 0,
          "interviewer.salarySlip": 0,
          "interviewer.resume": 0,
        },
      },
      {
        $lookup: {
          from: "candidates",
          let: { candidateId: { $toObjectId: "$candidateId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$candidateId"] } } }],
          as: "candidate",
        },
      },
      {
        $unwind: "$candidate",
      },
      { $project: { "candidate.password": 0 } },
      {
        $skip: (page - 1) * limit,
      },
      { $limit: limit },
    ]);

    const total = await ScheduledInterviewModel.find().countDocuments();
    return { interviews, total };
  }

  async dashboardDetails(): Promise<any> {
    const interviewersCount = await InterviewerModel.find().countDocuments();
    const candidatesCount = await CandidateModel.find().countDocuments();
    const interviews = await ScheduledInterviewModel.aggregate([
      {
        $group: { _id: "$status", total: { $sum: 1 } },
      },
    ]);
    const interviewsCount = { completed: 0, scheduled: 0 };

    interviews.forEach((int) => {
      if (int._id === "Completed") {
        interviewsCount.completed = int.total;
      } else if (int._id === "Scheduled") {
        interviewsCount.scheduled = int.total;
      }
    });

    const scheduledInterviews = await ScheduledInterviewModel.find();

    return {
      interviewersCount,
      candidatesCount,
      interviewsCount,
      scheduledInterviews,
    };
  }

  async findInterviewsStartingBetween(startTime: Date, endTime: Date): Promise<AggregatedScheduledInterview[]> {
    console.log('start: ',startTime)
    console.log('end: ',endTime)
    // const interviews = await ScheduledInterviewModel.find({fromTime: {$gte: startTime, $lte: endTime}})
    const interviews = await ScheduledInterviewModel.aggregate([
      {
        $match: {
          fromTime: {$gte: startTime, $lte: endTime},
          reminderSent: {$ne: true}
        }
      },
      {
        $lookup: {
          from: "candidates",
          let: { candidateId: { $toObjectId: "$candidateId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$candidateId"] } } }],
          as: "candidate",
        },
      },
      {
        $unwind: "$candidate",
      },
      { $project: { "candidate.password": 0 } },
    ])
    console.log(interviews)
    if(interviews.length > 0){
      const interviewIds = interviews.map(interview => interview._id);
      await ScheduledInterviewModel.updateMany({_id: {$in: interviewIds}}, {$set: {reminderSent: true}})
    }

    console.log(interviews);
    return interviews
  }
}

export default AdminRepository;
