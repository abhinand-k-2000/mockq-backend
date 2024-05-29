import { InterviewerRegistration } from "../../domain/entitites/interviewer";
import IInterviewerRepository from "../../use-cases/interface/IInterviewerRepository";
import { InterviewerModel } from "../database/interviewerModel";

class InterviewerRepository implements IInterviewerRepository {
  async findByEmail(email: string): Promise<InterviewerRegistration | null> {
    try {
      const interviewerFound = await InterviewerModel.findOne({ email: email });
      if (!interviewerFound) return null;

      return interviewerFound;
    } catch (error) {
        console.log(error);
        return null;
    }
  }

  async saveInterviewer(interviewer: InterviewerRegistration): Promise<InterviewerRegistration | null> {
    try {
      const newInterviewer = new InterviewerModel(interviewer)
      await newInterviewer.save()
      return newInterviewer
    } catch (error) {
      console.log(error);
      return null
    }
  }
}

export default InterviewerRepository;
