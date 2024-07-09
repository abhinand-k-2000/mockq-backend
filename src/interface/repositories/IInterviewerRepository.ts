import Feedback from "../../domain/entitites/feedBack"
import InterviewSlot from "../../domain/entitites/interviewSlot"
import { InterviewerRegistration } from "../../domain/entitites/interviewer"
import ScheduledInterview from "../../domain/entitites/scheduledInterview"
import Stack from "../../domain/entitites/stack"


interface IInterviewerRepository {
    findByEmail(email: string): Promise<InterviewerRegistration | null>
    saveInterviewer(interviewer: InterviewerRegistration): Promise<InterviewerRegistration | null>
    findInterviewerById(id: string): Promise<InterviewerRegistration | null>
    saveInterviewerDetails(interviewerDetails: InterviewerRegistration): Promise<InterviewerRegistration | null>
    findById(id: string): Promise<InterviewerRegistration | null>
    saveInterviewSlot(slotData: InterviewSlot): Promise<InterviewSlot | null>
    getInterviewSlots(interviewerId: string): Promise<InterviewSlot[] | null>
    getDomains():Promise<Stack[] | null>

    updatePassword(interviewerId: string, password: string): Promise<void | null>

    getScheduledInterviews(interviewerId: string): Promise<ScheduledInterview[] >

    getScheduledInterviewById(interviewId: object): Promise<ScheduledInterview[] | null>

    saveFeedback(feedbackDetails: Feedback): Promise<void >

}

export default IInterviewerRepository