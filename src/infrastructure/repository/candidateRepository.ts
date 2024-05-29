import Candidate from "../../domain/entitites/candidate";
import ICandidateRepository from "../../use-cases/interface/ICandidateRepository";
import { CandidateModel } from "../database/candidateModel";

class CandidateRepository implements ICandidateRepository {

  async findByEmail(email: string): Promise<Candidate | null> {
    try {
      const candidateExists = await CandidateModel.findOne({ email: email });
      if (candidateExists) {
        return candidateExists;
      } else {
        return null;
      }
    } catch (error) {  
      console.log(error);
      return null;
    }
  }

  async saveCandidate(candidate: Candidate): Promise<Candidate | null> {
    try {
      const newCandidate = new CandidateModel(candidate);
      await newCandidate.save()
      return newCandidate
    } catch (error) {
      console.log(error)
      return null
    }
  }

  
}

export default CandidateRepository
