import Candidate from "../../domain/entitites/candidate"
import Feedback from "../../domain/entitites/feedBack";
import { InterviewerRegistration } from "../../domain/entitites/interviewer"
import InterviewerRating from "../../domain/entitites/interviewerRating";
import ScheduledInterview from "../../domain/entitites/scheduledInterview";
import Stack from "../../domain/entitites/stack"

export interface InterviewerBasic{
    name: string;
    introduction?:string;
    organisation?: string;
    profilePicture?: string
}

interface ICandidateRepository {
    findByEmail(email: string): Promise<Candidate | null>
    saveCandidate(candidate: Candidate): Promise<Candidate | null >
    findCandidateById(id: string): Promise<Candidate | null >
    findAllStacks(): Promise<Stack[]>

    getInterviewersByTech(techName: string):Promise<InterviewerBasic[] | null>
    
    getInterviewerSlotsDetails(interviewerId: string, techName: string): Promise<any>

    // bookSlot(info: any): Promise<void | null>
    getScheduledInterviews(candidateId: string, page: number, limit: number): Promise< {interviews: ScheduledInterview[] | null, total: number}>

    updatePassword(candidateId: string, password: string): Promise<void | null> 

    getFeedbackDetails(interviewId: string): Promise<Feedback | null>

    scehduledInterviewDetails(interviewId: string): Promise<ScheduledInterview | null>

    getAllPremiumCandidates(search: string, candidateId: string): Promise<Candidate[]>

    saveInterviewerRating(rating: InterviewerRating): Promise<void>

    getCandidateAnalytics(candidateId: string): Promise<any>

    getScheduledInterviewByRoomId(roomId: string): Promise<ScheduledInterview | null>

    editProfile(candidateId: string, name: string, mobile: number,  profilePicUrl: string | null): Promise<void>

    
}

export default ICandidateRepository  