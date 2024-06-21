import Candidate from "../../domain/entitites/candidate"
import { InterviewerRegistration } from "../../domain/entitites/interviewer"
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
}

export default ICandidateRepository