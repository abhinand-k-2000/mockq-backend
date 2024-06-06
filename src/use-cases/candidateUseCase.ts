import { NextFunction } from "express";
import Candidate from "../domain/entitites/candidate";
import AppError from "../infrastructure/utils/appError";
import ICandidateRepository from "../interface/repositories/ICandidateRepository";
import IGenerateOtp from "../interface/utils/IGenerateOtp";
import IJwtToken from "../interface/utils/IJwtToken";
import IMailService from "../interface/utils/IMailService";
import IHashPassword from "../interface/utils/IhashPassword";

class CandidateUseCase {
  constructor(
    private iCandidateRepository: ICandidateRepository,
    private otpGenerate: IGenerateOtp,
    private jwtToken: IJwtToken,
    private mailService: IMailService,
    private hashPassword: IHashPassword
  ) {}

  async findCandidate(candidateInfo: Candidate) {
    const candidateFound = await this.iCandidateRepository.findByEmail(
      candidateInfo.email
    );
    if (candidateFound) {
      return {
        status: 200,
        data: candidateFound,
        message: "Candidate found",
      };
    } else {
      const otp: string = this.otpGenerate.generateOtp();
      console.log("OTP: ", otp);
      const token = this.jwtToken.otpToken(candidateInfo, otp);
      const { name, email } = candidateInfo;
      await this.mailService.sendMail(name, email, otp);
      return { status: 201, data: token, message: "OTP generated and sent" };
    }
  }

  async getCandidateInfoUsingToken(token: string) {
    const decodedToken = this.jwtToken.verifyJwtToken(token);
    if (!decodedToken) {
      throw new AppError("Invalid Token", 400);
    }
    return decodedToken.info;
  }

  async saveCandidate(token: string, otp: string) {
    let decodedToken = this.jwtToken.verifyJwtToken(token);

    if (!decodedToken) {
      throw new AppError("Invalid Token", 400);
    }

    if (otp !== decodedToken.otp) {
      throw new AppError("Invalid OTP", 401);
    }

    const { password } = decodedToken.info;
    const hashedPassword = await this.hashPassword.hash(password);
    decodedToken.info.password = hashedPassword;

    const candidateSave = await this.iCandidateRepository.saveCandidate(decodedToken.info);

    if (!candidateSave) {
      throw new AppError("Failed to save candidate", 500);
    }

    let newToken = this.jwtToken.createJwtToken(candidateSave._id as string, "candidate");
    return { success: true, token: newToken };
  }

  async candidateLogin(email: string, password: string) {
    const candidateFound = await this.iCandidateRepository.findByEmail(email);

    if (!candidateFound) {
      console.log("Inside cnadidata founf");
      throw new AppError("User not found!", 404);
    }
    const passwordMatch = await this.hashPassword.compare(
      password,
      candidateFound.password
    );

    if (!passwordMatch) {
      throw new AppError("Wrong password", 401);
    }

    if (candidateFound.isBlocked) {
      throw new AppError("You are blocked by admin", 403);
    }

    let token = this.jwtToken.createJwtToken(candidateFound._id, "candidate");

    return {success: true, data: { token: token }, message: "candidate found"};
  }

  async getAllStacks() {
    const stacksList = await this.iCandidateRepository.findAllStacks();
    return stacksList;
  }
}

export default CandidateUseCase;
