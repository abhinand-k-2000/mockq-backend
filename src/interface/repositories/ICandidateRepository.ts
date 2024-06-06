import Candidate from "../domain/entitites/candidate";
import Stack from "../domain/entitites/stack";

interface ICandidateRepository {
    findByEmail(email: string): Promise<Candidate | null>
    saveCandidate(candidate: Candidate): Promise<Candidate | null >
    findCandidateById(id: string): Promise<Candidate | null >
    findAllStacks(): Promise<Stack[]>
}

export default ICandidateRepository