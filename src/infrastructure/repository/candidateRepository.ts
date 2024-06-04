import Candidate from "../../domain/entitites/candidate";
import Stack from "../../domain/entitites/stack";
import ICandidateRepository from "../../use-cases/interface/ICandidateRepository";
import { CandidateModel } from "../database/candidateModel";
import { StackModel } from "../database/stackModel";

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

  async findCandidateById(id: string): Promise<Candidate | null> {
    try {
      const candidateData = await CandidateModel.findById(id)
      return candidateData
    } catch (error) {
      console.log(error)
      return null
    }
  }


  async findAllStacks(): Promise<Stack[]> {
    try {
      const stacks = await StackModel.find({isListed: true})
      return stacks
    } catch (error) {
      throw new Error("Failed to fetch stacks from database");
    }
    
  }

  
}

export default CandidateRepository
