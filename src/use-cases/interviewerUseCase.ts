import {
  InterviewerProfile,
  InterviewerRegistration,
} from "../domain/entitites/interviewer";
import IInterviewerRepository from "../interface/repositories/IInterviewerRepository";
import IGenerateOtp from "../interface/utils/IGenerateOtp";
import IJwtToken from "../interface/utils/IJwtToken";
import IMailService from "../interface/utils/IMailService";
import IHashPassword from "../interface/utils/IhashPassword";

import IFileStorageService from "../interface/utils/IFileStorageService";
import AppError from "../infrastructure/utils/appError";
import Interview from "../domain/entitites/interviewSlot";
import InterviewSlot from "../domain/entitites/interviewSlot";

class InterviewerUseCase {
  constructor(
    private iInterviewerRepository: IInterviewerRepository,
    private otpGenerate: IGenerateOtp,
    private jwtToken: IJwtToken,
    private mailService: IMailService,
    private hashPassword: IHashPassword,
    private fileStorageService: IFileStorageService
  ) {}

  async findInterviewer(interviewerInfo: InterviewerProfile) {
    const { email, name } = interviewerInfo;
    const interviewerFound = await this.iInterviewerRepository.findByEmail(
      email
    );
    if (interviewerFound) {
      return {
        status: 200,
        data: interviewerFound,
        message: "Interviewer Found",
      };
    }
    const otp = this.otpGenerate.generateOtp();
    console.log("Interviewer Signup OTP: ", otp);
    const token = this.jwtToken.otpToken(interviewerInfo, otp);
    await this.mailService.sendMail(name, email, otp);
    return { status: 201, data: token, message: "OTP generated" };

  }

  async getInterviewerInfoUsingToken(token: string) {
    const decodedToken = this.jwtToken.verifyJwtToken(token);
    if (!decodedToken) {
      throw new AppError("Invalid Token", 400);
    }
    return decodedToken.info;
  }

  async saveInterviewer(token: string, otp: string) {
    let decodedToken = this.jwtToken.verifyJwtToken(token);

    if (!decodedToken) {
      throw new AppError("Invalid token", 400);
    }

    if (otp !== decodedToken.otp) {
      throw new AppError("Invalid OTP", 401);
    }

    const { password } = decodedToken.info;

    const hashedPassword = await this.hashPassword.hash(password);
    decodedToken.info.password = hashedPassword;

    const interviewerSave = await this.iInterviewerRepository.saveInterviewer(
      decodedToken.info
    );

    if (!interviewerSave) {
      throw new AppError("Failed to save interviewer", 500);
    }

    const newToken = this.jwtToken.createJwtToken(
      interviewerSave._id as string,
      "interviewer"
    );

    return { success: true, data: { token: newToken } };
  }

  async interviewerLogin(email: string, password: string) {
    const interviewerFound = await this.iInterviewerRepository.findByEmail(
      email
    );

    if (!interviewerFound) {
      throw new AppError("Interviewer not found!", 404);
    }

    const passwordMatch = await this.hashPassword.compare(
      password,
      interviewerFound.password
    );
    if (!passwordMatch) {
      throw new AppError("Wrong password", 401);
    }

    if (interviewerFound.isBlocked) {
      throw new AppError("You are blocked by admin", 403);
    }

    // if(!interviewerFound.isApproved){
    //     return {success: false, message: "You are not approved by the admin"}
    // }

    let token = this.jwtToken.createJwtToken(
      interviewerFound._id,
      "interviewer"
    );

    return {
      success: true,
      data: {
        token: token,
        hasCompletedDetails: interviewerFound.hasCompletedDetails,
      },
      message: "Interviewer found",
    };
  }

  async saveInterviewerDetails(interviewerDetails: InterviewerRegistration) {
    const { _id, profilePicture, salarySlip, resume } = interviewerDetails;

    const interviewer = await this.iInterviewerRepository.findInterviewerById(
      _id
    );
    if (!interviewer) {
      throw new AppError("Interviewer not found!", 404);
    }

    const profilePictureUrl = await this.fileStorageService.uploadFile(
      profilePicture,
      "profilePictures"
    );
    const salarySlipUrl = await this.fileStorageService.uploadFile(
      salarySlip,
      "salarySlips"
    );
    const resumeUrl = await this.fileStorageService.uploadFile(
      resume,
      "resumes"
    );

    interviewerDetails.profilePicture = profilePictureUrl;
    interviewerDetails.salarySlip = salarySlipUrl;
    interviewerDetails.resume = resumeUrl;
    interviewerDetails.hasCompletedDetails = true;

    const updatedInterviewer =
      await this.iInterviewerRepository.saveInterviewerDetails(
        interviewerDetails
      );

    if (!updatedInterviewer) {
      throw new AppError("Failed to update interviewer details", 500);
    }

    return {
      success: true,
      message: "Interviewer details updated successfully!",
      data: updatedInterviewer,
    };
  }

  async getInterviewerProfile(interviewerId: string) {
    const interviewer = this.iInterviewerRepository.findById(interviewerId)
    if(!interviewer){
        throw new AppError("Interviewer not found", 404)
    }
    return interviewer
  }

  async addSlot(slotData: InterviewSlot) {

    const { interviewerId, slots } = slotData;
    if (!interviewerId || !slots || !Array.isArray(slots) || slots.length === 0) {
        throw new AppError("Invalid slot data", 400);
    }
    const slotAdded = await this.iInterviewerRepository.saveInterviewSlot(slotData);
    return slotAdded;

  }


  async getInterviewSlots(interviewerId: string) {
    const slotList = this.iInterviewerRepository.getInterviewSlots(interviewerId)
    return slotList
  }

  async getDomains() {
    const domainList = this.iInterviewerRepository.getDomains();
    return domainList;
  }


  
}

export default InterviewerUseCase;
