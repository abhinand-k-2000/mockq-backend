import Admin from '../../domain/entitites/admin'
import Candidate from '../../domain/entitites/candidate'
import { InterviewerRegistration } from '../../domain/entitites/interviewer'
import ScheduledInterview, { AggregatedScheduledInterview } from '../../domain/entitites/scheduledInterview'
import Stack from '../../domain/entitites/stack'



interface IAdminRepository {
    
    findByEmail(email: string): Promise<Admin | null>
    create(admin: Admin): Promise<void>
    findAllCandidates(page: number, limit: number): Promise<{candidates: Candidate[], total: number}>

    blockCandidate(id: string): Promise<boolean>
    addStack(stackName: string, technologies: string[]): Promise<boolean>

    findAllStacks(page: number, limit: number): Promise<{stacks: Stack[], total: number}>

    findAllInterviewers(page: number, limit: number): Promise<{interviewers: InterviewerRegistration[], total: number}>

    getInterviewerDetails(id: string): Promise<InterviewerRegistration | null>
    approveInterviewer(id: string): Promise<boolean>
    unlistStack(id: string): Promise<Stack | null>

    findAllInterviews(page: number, limit: number): Promise<{interviews: ScheduledInterview[] | null, total: number}>

    dashboardDetails() : Promise<any>

    findInterviewsStartingBetween(startTime: Date, endTime: Date): Promise<AggregatedScheduledInterview[]>

}


export default IAdminRepository