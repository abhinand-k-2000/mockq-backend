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
    getInterviewSlots(interviewerId: string, page: number, limit: number): Promise<{slots: InterviewSlot[] | null, total: number}>
    getDomains():Promise<Stack[] | null>

    updatePassword(interviewerId: string, password: string): Promise<void | null>

    getScheduledInterviews(interviewerId: string, page: number, limit: number): Promise<{interviews: ScheduledInterview[], total: number} >

    getScheduledInterviewById(interviewId: object): Promise<ScheduledInterview[] | null>

    saveFeedback(feedbackDetails: Feedback): Promise<void >

    getPaymentDashboard(interviewerId: string): Promise<any>
    
    getScheduledInterviewByRoomId(roomId: string): Promise<ScheduledInterview | null>


}

export default IInterviewerRepository