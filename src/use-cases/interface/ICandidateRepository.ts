import Candidate from "../../domain/entitites/candidate";

interface ICandidateRepository {
    findByEmail(email: string): Promise<Candidate | null>
    saveCandidate(candidate: Candidate): Promise<Candidate | null >
}

export default ICandidateRepository