import Candidate from "../../domain/entitites/candidate";
import Stack from "../../domain/entitites/stack";
import ICandidateRepository from "../../interface/repositories/ICandidateRepository";
import { CandidateModel } from "../database/candidateModel";
import { StackModel } from "../database/stackModel";
import AppError from "../utils/appError";

class CandidateRepository implements ICandidateRepository {
  async findByEmail(email: string): Promise<Candidate | null> {
    const candidateExists = await CandidateModel.findOne({ email: email });
    if (!candidateExists) {
      throw new AppError("Candidate not found", 404);
    }
    return candidateExists;
  }

  async saveCandidate(candidate: Candidate): Promise<Candidate | null> {
    const newCandidate = new CandidateModel(candidate);
    const savedCandidate = await newCandidate.save();
    if (!savedCandidate) {
      throw new AppError("Failed to save candidate", 500);
    }
    return savedCandidate;
  }

  async findCandidateById(id: string): Promise<Candidate | null> {
    const candidateData = await CandidateModel.findById(id);
    if (!candidateData) {
      throw new AppError("Candidate not found", 404);
    }
    return candidateData;
  }

  async findAllStacks(): Promise<Stack[]> {
    const stacks = await StackModel.find({ isListed: true });
    if (!stacks) {
      throw new AppError("Failed to fetch stacks from database", 500);
    }
    return stacks;
  }
}

export default CandidateRepository;
