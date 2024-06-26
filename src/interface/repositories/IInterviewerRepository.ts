import InterviewSlot from "../../domain/entitites/interviewSlot"
import { InterviewerRegistration } from "../../domain/entitites/interviewer"
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


}

export default IInterviewerRepository