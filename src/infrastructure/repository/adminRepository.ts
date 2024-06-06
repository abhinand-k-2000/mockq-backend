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

  async findAllCandidates(): Promise<Candidate[]> {
    const candidatesList = await CandidateModel.find();
    if (!candidatesList) {
      throw new AppError("Failed to fetch candidates from database", 500);
    }
    return candidatesList;
  }

  async findAllInterviewers(): Promise<InterviewerRegistration[]> {
    const interviewersList = await InterviewerModel.find();
    if (!interviewersList) {
      throw new AppError("Failed to fetch interviewers from database", 500);
    }
    return interviewersList;
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

  async findAllStacks(): Promise<Stack[]> {
    const stacksList = await StackModel.find();
    if (!stacksList) {
      throw new AppError("Failed to fetch stacks from database", 500);
    }
    return stacksList;
  }
}

export default AdminRepository;
