import { InterviewerRegistration } from "../../domain/entitites/interviewer";
import IInterviewerRepository from "../../interface/repositories/IInterviewerRepository";
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
}

export default InterviewerRepository;
