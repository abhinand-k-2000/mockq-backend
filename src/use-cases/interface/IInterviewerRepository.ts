import { InterviewerRegistration } from "../../domain/entitites/interviewer";


interface IInterviewerRepository {
    findByEmail(email: string): Promise<InterviewerRegistration | null>
    saveInterviewer(interviewer: InterviewerRegistration): Promise<InterviewerRegistration | null>
    findInterviewerById(id: string): Promise<InterviewerRegistration | null>
    saveInterviewerDetails(interviewerDetails: InterviewerRegistration): Promise<InterviewerRegistration | null>
}

export default IInterviewerRepository