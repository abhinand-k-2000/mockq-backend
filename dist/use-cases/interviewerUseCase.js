"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../infrastructure/utils/appError"));
class InterviewerUseCase {
    constructor(iInterviewerRepository, otpGenerate, jwtToken, mailService, hashPassword, fileStorageService, iNotificationRepository, iWalletRepository) {
        this.iInterviewerRepository = iInterviewerRepository;
        this.otpGenerate = otpGenerate;
        this.jwtToken = jwtToken;
        this.mailService = mailService;
        this.hashPassword = hashPassword;
        this.fileStorageService = fileStorageService;
        this.iNotificationRepository = iNotificationRepository;
        this.iWalletRepository = iWalletRepository;
    }
    async findInterviewer(interviewerInfo) {
        const { email, name } = interviewerInfo;
        const interviewerFound = await this.iInterviewerRepository.findByEmail(email);
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
    async getInterviewerInfoUsingToken(token) {
        const decodedToken = this.jwtToken.verifyJwtToken(token);
        if (!decodedToken) {
            throw new appError_1.default("Invalid Token", 400);
        }
        return decodedToken.info;
    }
    async saveInterviewer(token, otp) {
        let decodedToken = this.jwtToken.verifyJwtToken(token);
        if (!decodedToken) {
            throw new appError_1.default("Invalid token", 400);
        }
        if (otp !== decodedToken.otp) {
            throw new appError_1.default("Invalid OTP", 401);
        }
        const { password } = decodedToken.info;
        const hashedPassword = await this.hashPassword.hash(password);
        decodedToken.info.password = hashedPassword;
        const interviewerSave = await this.iInterviewerRepository.saveInterviewer(decodedToken.info);
        if (!interviewerSave) {
            throw new appError_1.default("Failed to save interviewer", 500);
        }
        // Create a wallet for the new interviewer
        const newWallet = await this.iWalletRepository.createWallet(interviewerSave._id);
        const newToken = this.jwtToken.createJwtToken(interviewerSave._id, "interviewer");
        return { success: true, data: { token: newToken } };
    }
    async interviewerLogin(email, password) {
        const interviewerFound = await this.iInterviewerRepository.findByEmail(email);
        if (!interviewerFound) {
            throw new appError_1.default("Interviewer not found!", 404);
        }
        const passwordMatch = await this.hashPassword.compare(password, interviewerFound.password);
        if (!passwordMatch) {
            throw new appError_1.default("Wrong password", 401);
        }
        if (interviewerFound.isBlocked) {
            throw new appError_1.default("You are blocked by admin", 403);
        }
        // if(!interviewerFound.isApproved){
        //     return {success: false, message: "You are not approved by the admin"}
        // }
        let token = this.jwtToken.createJwtToken(interviewerFound._id, "interviewer");
        return {
            success: true,
            data: {
                token: token,
                hasCompletedDetails: interviewerFound.hasCompletedDetails,
                isApproved: interviewerFound.isApproved
            },
            message: "Interviewer found",
        };
    }
    async saveInterviewerDetails(interviewerDetails) {
        const { _id, profilePicture, salarySlip, resume } = interviewerDetails;
        const interviewer = await this.iInterviewerRepository.findInterviewerById(_id);
        if (!interviewer) {
            throw new appError_1.default("Interviewer not found!", 404);
        }
        const profilePictureUrl = await this.fileStorageService.uploadFile(profilePicture, "profilePictures");
        const salarySlipUrl = await this.fileStorageService.uploadFile(salarySlip, "salarySlips");
        const resumeUrl = await this.fileStorageService.uploadFile(resume, "resumes");
        interviewerDetails.profilePicture = profilePictureUrl;
        interviewerDetails.salarySlip = salarySlipUrl;
        interviewerDetails.resume = resumeUrl;
        interviewerDetails.hasCompletedDetails = true;
        const updatedInterviewer = await this.iInterviewerRepository.saveInterviewerDetails(interviewerDetails);
        if (!updatedInterviewer) {
            throw new appError_1.default("Failed to update interviewer details", 500);
        }
        return {
            success: true,
            message: "Interviewer details updated successfully!",
            data: updatedInterviewer,
        };
    }
    async getInterviewerProfile(interviewerId) {
        const interviewer = this.iInterviewerRepository.findById(interviewerId);
        if (!interviewer) {
            throw new appError_1.default("Interviewer not found", 404);
        }
        return interviewer;
    }
    async addSlot(slotData) {
        const { interviewerId, slots } = slotData;
        if (!interviewerId || !slots || !Array.isArray(slots) || slots.length === 0) {
            throw new appError_1.default("Invalid slot data", 400);
        }
        const slotAdded = await this.iInterviewerRepository.saveInterviewSlot(slotData);
        return slotAdded;
    }
    async getInterviewSlots(interviewerId, page, limit, searchQuery) {
        const { slots, total } = await this.iInterviewerRepository.getInterviewSlots(interviewerId, page, limit, searchQuery);
        return { slots, total };
    }
    async getDomains() {
        const domainList = await this.iInterviewerRepository.getDomains();
        return domainList;
    }
    async initiatePasswordReset(email) {
        try {
            const candidate = await this.iInterviewerRepository.findByEmail(email);
            if (!candidate) {
                return null;
            }
            const { name } = candidate;
            const otp = this.otpGenerate.generateOtp();
            const hashedOtp = await this.hashPassword.hash(otp);
            console.log("FORGOT PASSWORD OTP: ", otp);
            const token = this.jwtToken.otpToken({ userId: candidate._id }, hashedOtp);
            await this.mailService.sendMail(name, email, otp);
            return token;
        }
        catch (error) {
            throw new appError_1.default("Failed to initiate password reset", 500);
        }
    }
    async resetPassword(UserOtp, password, token) {
        const decodedToken = this.jwtToken.verifyJwtToken(token);
        const { otp, info } = decodedToken;
        const { userId } = info;
        const isOtpValid = await this.hashPassword.compare(UserOtp, otp);
        if (!isOtpValid) {
            throw new appError_1.default("Incorrect OTP", 400);
        }
        const hashedPassword = await this.hashPassword.hash(password);
        await this.iInterviewerRepository.updatePassword(userId, hashedPassword);
        return;
    }
    async getScheduledInterviews(interviewerId, page, limit) {
        const { interviews, total } = await this.iInterviewerRepository.getScheduledInterviews(interviewerId, page, limit);
        return { interviews, total };
    }
    async getDetails(interviewerId) {
        const details = await this.iInterviewerRepository.findInterviewerById(interviewerId);
        return details;
    }
    async getScheduledInterviewById(interviewId) {
        const interview = await this.iInterviewerRepository.getScheduledInterviewById(interviewId);
        return interview;
    }
    async saveFeedback(feedbacKDetails) {
        const { candidateId, } = feedbacKDetails;
        console.log('candidat id: ', candidateId);
        const feeback = await this.iInterviewerRepository.saveFeedback(feedbacKDetails);
        console.log("feedback in save feedbacK: ", feeback);
        const notification = {
            userId: candidateId,
            heading: "Feedback Received",
            message: "You have received a new feedback.",
            feedbackId: feeback.interviewId,
            read: false
        };
        await this.iNotificationRepository.send(notification);
    }
    async getPaymentDashboard(interviewerId) {
        const details = await this.iInterviewerRepository.getPaymentDashboard(interviewerId);
        return details;
    }
    async verifyVideoConference(roomId, userId) {
        const interview = await this.iInterviewerRepository.getScheduledInterviewByRoomId(roomId);
        if (!interview)
            throw new appError_1.default("Interview not found", 404);
        if (interview.candidateId === userId || interview.interviewerId === userId) {
            return true;
        }
        else {
            return false;
        }
    }
    async editProfile(interviewerId, details) {
        await this.iInterviewerRepository.editProfile(interviewerId, details);
    }
    async editPassword(interviewerId, oldPassword, newPassword) {
        const interviewer = await this.iInterviewerRepository.findInterviewerById(interviewerId);
        if (!interviewer)
            throw new appError_1.default("Interviewer not found ", 400);
        const isPasswordMatch = await this.hashPassword.compare(oldPassword, interviewer?.password);
        if (!isPasswordMatch)
            throw new appError_1.default("Current password is incorrect. Please check and try again.", 400);
        const hashedPassword = await this.hashPassword.hash(newPassword);
        await this.iInterviewerRepository.updatePassword(interviewerId, hashedPassword);
    }
}
exports.default = InterviewerUseCase;
