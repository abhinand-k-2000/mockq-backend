import Admin from '../../domain/entitites/admin'
import Candidate from '../../domain/entitites/candidate'
import { InterviewerRegistration } from '../../domain/entitites/interviewer'
import Stack from '../../domain/entitites/stack'


interface IAdminRepository {
    
    findByEmail(email: string): Promise<Admin | null>
    create(admin: Admin): Promise<void>
    findAllCandidates(): Promise<Candidate[]>
    blockCandidate(id: string): Promise<boolean>
    addStack(stackName: string, technologies: string[]): Promise<boolean>
    findAllStacks(): Promise<Stack[]>
    findAllInterviewers(): Promise<InterviewerRegistration[]>
    getInterviewerDetails(id: string): Promise<InterviewerRegistration | null>
    approveInterviewer(id: string): Promise<boolean>

}


export default IAdminRepository