"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../infrastructure/utils/appError"));
class CandidateUseCase {
    constructor(iCandidateRepository, otpGenerate, jwtToken, mailService, hashPassword, iNotificationRepository) {
        this.iCandidateRepository = iCandidateRepository;
        this.otpGenerate = otpGenerate;
        this.jwtToken = jwtToken;
        this.mailService = mailService;
        this.hashPassword = hashPassword;
        this.iNotificationRepository = iNotificationRepository;
    }
    async findCandidate(candidateInfo) {
        const candidateFound = await this.iCandidateRepository.findByEmail(candidateInfo.email);
        if (candidateFound) {
            return {
                status: 200,
                data: candidateFound,
                message: "Candidate found",
            };
        }
        else {
            console.log(candidateInfo.email);
            const otp = this.otpGenerate.generateOtp();
            console.log("OTP: ", otp);
            const token = this.jwtToken.otpToken(candidateInfo, otp);
            const { name, email } = candidateInfo;
            await this.mailService.sendMail(name, email, otp);
            return { status: 201, data: token, message: "OTP generated and sent" };
        }
    }
    async getCandidateInfoUsingToken(token) {
        const decodedToken = this.jwtToken.verifyJwtToken(token);
        if (!decodedToken) {
            throw new appError_1.default("Invalid Token", 400);
        }
        return decodedToken.info;
    }
    async saveCandidate(token, otp) {
        let decodedToken = this.jwtToken.verifyJwtToken(token);
        if (!decodedToken) {
            throw new appError_1.default("Invalid Token", 400);
        }
        if (otp !== decodedToken.otp) {
            throw new appError_1.default("Invalid OTP", 401);
        }
        const { password } = decodedToken.info;
        const hashedPassword = await this.hashPassword.hash(password);
        decodedToken.info.password = hashedPassword;
        const candidateSave = await this.iCandidateRepository.saveCandidate(decodedToken.info);
        if (!candidateSave) {
            throw new appError_1.default("Failed to save candidate", 500);
        }
        let newToken = this.jwtToken.createJwtToken(candidateSave._id, "candidate");
        return { success: true, token: newToken };
    }
    async candidateLogin(email, password) {
        const candidateFound = await this.iCandidateRepository.findByEmail(email);
        if (!candidateFound) {
            throw new appError_1.default("User not found!", 404);
        }
        const passwordMatch = await this.hashPassword.compare(password, candidateFound.password);
        if (!passwordMatch) {
            throw new appError_1.default("Wrong password", 401);
        }
        if (candidateFound.isBlocked) {
            throw new appError_1.default("You are blocked by admin", 403);
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
    getInterviewersByTech(techName) {
        const interviewersList = this.iCandidateRepository.getInterviewersByTech(techName);
        return interviewersList;
    }
    getInterviewerSlotDetails(interviewerId, techName) {
        const details = this.iCandidateRepository.getInterviewerSlotsDetails(interviewerId, techName);
        return details;
    }
    // bookSlot(info: any) {
    //   const { interviewerId, to, from, _id, date, candidateId} = info
    //       const bookMarked = this.iCandidateRepository.bookSlot(info)
    //       return bookMarked
    // }
    async getScheduledInterviewList(candidateId, page, limit) {
        try {
            const { interviews, total } = await this.iCandidateRepository.getScheduledInterviews(candidateId, page, limit);
            return { interviews, total };
        }
        catch (error) {
            throw new appError_1.default("Failed to fetch scheduled interviews", 500);
        }
    }
    async initiatePasswordReset(email) {
        try {
            const candidate = await this.iCandidateRepository.findByEmail(email);
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
        await this.iCandidateRepository.updatePassword(userId, hashedPassword);
        return;
    }
    async getFeedbackDetails(interviewId) {
        const feedback = await this.iCandidateRepository.getFeedbackDetails(interviewId);
        if (!feedback)
            throw new appError_1.default("Feedback details not found", 400);
        const interviewDetails = await this.iCandidateRepository.scehduledInterviewDetails(feedback?.interviewId);
        return { feedback, interviewDetails };
    }
    async isCandidatePremium(candidateId) {
        const candidate = await this.iCandidateRepository.findCandidateById(candidateId);
        if (candidate?.isPremium) {
            return true;
        }
        else {
            return false;
        }
    }
    async getAllPremiumUsers(search, candidateId) {
        const candidates = await this.iCandidateRepository.getAllPremiumCandidates(search, candidateId);
        return candidates;
    }
    async saveInterviewerRating(data) {
        const newRating = await this.iCandidateRepository.saveInterviewerRating(data);
    }
    async getCandidateAnalytics(candidateId) {
        const analytics = await this.iCandidateRepository.getCandidateAnalytics(candidateId);
        return analytics;
    }
    async verifyVideoConference(roomId, userId) {
        const interview = await this.iCandidateRepository.getScheduledInterviewByRoomId(roomId);
        if (!interview)
            throw new appError_1.default("Interview not found", 404);
        console.log('roo: ', roomId, 'userId: ', userId);
        if (interview.candidateId === userId || interview.interviewerId === userId) {
            return true;
        }
        else {
            return false;
        }
    }
    async getNotifications(userId) {
        const list = await this.iNotificationRepository.fetchAll(userId);
        return list;
    }
}
exports.default = CandidateUseCase;
