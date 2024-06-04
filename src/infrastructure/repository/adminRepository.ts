import IAdminRepository from "../../use-cases/interface/IAdminRepository";
import { AdminModel } from "../database/adminModel";
import Admin from "../../domain/entitites/admin";
import Candidate from "../../domain/entitites/candidate";
import { CandidateModel } from "../database/candidateModel";
import { StackModel } from "../database/stackModel";
import Stack from "../../domain/entitites/stack";
import { InterviewerRegistration } from "../../domain/entitites/interviewer";
import { InterviewerModel } from "../database/interviewerModel";

class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    const adminExists = await AdminModel.findOne({ email: email });
    if (adminExists) {
      return adminExists;
    }
    return null;
  }

  async create(admin: Admin): Promise<void> {
    const newAdmin = new AdminModel(admin);
    await newAdmin.save();
  }

  async findAllCandidates(): Promise<Candidate[]> {
    try {
      const candidatesList = await CandidateModel.find();
      return candidatesList;
    } catch (error) {
      throw new Error("Failed to fetch candidate from database");
    }
  }

  async findAllInterviewers(): Promise<InterviewerRegistration[]> {
    try {
      const interviewersList = await InterviewerModel.find();
      return interviewersList;
    } catch (error) {
      throw new Error("Failed to fetch interviewers from database");
    }
  }

  async getInterviewerDetails(
    id: string
  ): Promise<InterviewerRegistration | null> {
    try {
      const interviewerDetails = await InterviewerModel.findById(id);
      if (interviewerDetails) {
        return interviewerDetails;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error("Failed to fetch interviewer from database");
    }
  }

  async blockCandidate(candidateId: string): Promise<boolean> {
    try {
      const candidate = await CandidateModel.findById(candidateId);
      if (candidate) {
        await CandidateModel.findOneAndUpdate(
          { _id: candidateId },
          { isBlocked: !candidate.isBlocked }
        );
        return true;
      }
      return false;
    } catch (error) {
      throw new Error("Faied to block / unblock candidate from database");
    }
  }

  async unlistStack(stackId: string): Promise<Stack | null> {
    try {
      const stack = await StackModel.findById(stackId);
      if (!stack) return null;
  
      const stackUnlist = await StackModel.findByIdAndUpdate(stackId, { isListed: !stack.isListed }, {new: true});
      return stackUnlist;
    } catch (error) {
      throw new Error("Failed to unlist stack");
    }
  }
  

  async approveInterviewer(interviewerId: string): Promise<boolean> {
    try {
      const interviewer = await InterviewerModel.findByIdAndUpdate(
        { _id: interviewerId },
        { isApproved: true }
      );
      return true;
    } catch (error) {
      throw new Error("Failed to approve the interviewer");
    }
  }

  async addStack(stackName: string, technologies: string[]): Promise<boolean> {
    try {
      const newStack = new StackModel({
        stackName: stackName,
        technologies: technologies,
      });
      await newStack.save();
      return true;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to add stack in the database");
    }
  }

  async findAllStacks(): Promise<Stack[]> {
    try {
      const stacksList = await StackModel.find();
      return stacksList;
    } catch (error) {
      throw new Error("Failed to fetch stacks from database");
    }
  }
}

export default AdminRepository;
