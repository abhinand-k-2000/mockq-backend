import { NextFunction } from "express";
import Candidate from "../domain/entitites/candidate";
import AppError from "../infrastructure/utils/appError";
import ICandidateRepository from "../interface/repositories/ICandidateRepository";
import IGenerateOtp from "../interface/utils/IGenerateOtp";
import IJwtToken from "../interface/utils/IJwtToken";
import IMailService from "../interface/utils/IMailService";
import IHashPassword from "../interface/utils/IhashPassword";

type DecodedToken = {
  info: { userId: string };
  otp: string;
  iat: number;
  exp: number;
}

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

    const candidateSave = await this.iCandidateRepository.saveCandidate(
      decodedToken.info
    );

    if (!candidateSave) {
      throw new AppError("Failed to save candidate", 500);
    }

    let newToken = this.jwtToken.createJwtToken(
      candidateSave._id as string,
      "candidate"
    );
    return { success: true, token: newToken };
  }

  async candidateLogin(email: string, password: string) {
    const candidateFound = await this.iCandidateRepository.findByEmail(email);

    if (!candidateFound) {
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

    return {
      success: true,
      data: { token: token },
      message: "candidate found",
    };
  }

  async getAllStacks() {
    const stacksList = await this.iCandidateRepository.findAllStacks();
    return stacksList;
  }

  getInterviewersByTech(techName: string) {
    const interviewersList =
      this.iCandidateRepository.getInterviewersByTech(techName);
    return interviewersList;
  }

  getInterviewerSlotDetails(interviewerId: string, techName: string) {
    const details = this.iCandidateRepository.getInterviewerSlotsDetails(
      interviewerId,
      techName
    );
    return details;
  }

  // bookSlot(info: any) {
  //   const { interviewerId, to, from, _id, date, candidateId} = info

  //       const bookMarked = this.iCandidateRepository.bookSlot(info)
  //       return bookMarked

  // }

  async getScheduledInterviewList(candidateId: string) {
    try {
      const interviewList =
        await this.iCandidateRepository.getScheduledInterviews(candidateId);
      return interviewList;
    } catch (error) {
      throw new AppError("Failed to fetch scheduled interviews", 500);
    }
  }

  async initiatePasswordReset(email: string) {
    try {
      const candidate = await this.iCandidateRepository.findByEmail(email);
      if (!candidate) {
        return null
      }
      const { name } = candidate;
      const otp = this.otpGenerate.generateOtp();
      const hashedOtp = await this.hashPassword.hash(otp)
      console.log("FORGOT PASSWORD OTP: ", otp) 
      const token = this.jwtToken.otpToken({ userId: candidate._id }, hashedOtp);

      await this.mailService.sendMail(name, email, otp);


      return token;
    } catch (error) {
      throw new AppError("Failed to initiate password reset", 500);
    }
  }

  

  async resetPassword(UserOtp: string, password: string, token: any) {
    const decodedToken = this.jwtToken.verifyJwtToken(token) as DecodedToken
    const {otp, info}  = decodedToken
    const {userId} = info
    
    const isOtpValid = await this.hashPassword.compare(UserOtp, otp)
    if(!isOtpValid){
      throw new AppError("Incorrect OTP", 400)
    }
    const hashedPassword = await this.hashPassword.hash(password)

    await this.iCandidateRepository.updatePassword(userId, hashedPassword)

    return 

  }


  async getFeedbackDetails(interviewId: string) {
    const  feedback =await this.iCandidateRepository.getFeedbackDetails(interviewId)
    if(!feedback) throw new AppError("Feedback details not found", 400)
    const interviewDetails = await this.iCandidateRepository.scehduledInterviewDetails(feedback?.interviewId)

    return {feedback, interviewDetails}
  }
}



export default CandidateUseCase;

