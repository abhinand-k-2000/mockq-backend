"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../../infrastructure/utils/appError"));
const fs_1 = __importDefault(require("fs"));
class CandidateController {
    constructor(candidateCase) {
        this.candidateCase = candidateCase;
    }
    async verifyCadidateEmail(req, res, next) {
        try {
            const { name, email } = req.body;
            const candidateInfo = req.body;
            const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
            const nameRegex = /^[a-zA-Z ]{2,30}$/;
            if (!email?.trim()) {
                throw new appError_1.default("Email is required", 400);
            }
            if (!emailRegex.test(email)) {
                throw new appError_1.default("Invalid email format", 400);
            }
            if (!name?.trim()) {
                throw new appError_1.default("Name is required", 400);
            }
            if (!nameRegex.test(name)) {
                throw new appError_1.default("Invalid name format", 400);
            }
            const response = await this.candidateCase.findCandidate(candidateInfo);
            if (response?.status === 200) {
                throw new appError_1.default("User already exists", 400);
            }
            if (response?.status === 201) {
                const token = response.data;
                return res.status(201).json({ success: true, token });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async resendOtp(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token)
                throw new appError_1.default("Unauthorised user", 401);
            const candidateInfo = await this.candidateCase.getCandidateInfoUsingToken(token);
            if (!candidateInfo) {
                throw new appError_1.default("No user found", 400);
            }
            const response = await this.candidateCase.findCandidate(candidateInfo);
            if (response?.status === 200) {
                throw new appError_1.default("User already exists", 400);
            }
            if (response?.status === 201) {
                const token = response.data;
                return res.status(201).json({ success: true, token });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOtp(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const { otp } = req.body;
            const saveCandidate = await this.candidateCase.saveCandidate(token, otp);
            if (saveCandidate.success) {
                res.cookie("candidateToken", saveCandidate.token);
                return res.status(200).json({ success: true, token: saveCandidate.token, message: "OTP verified" });
            }
            else {
                res.status(400).json({ success: false, message: "OTP not verified" });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async verifyLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            const candidate = await this.candidateCase.candidateLogin(email, password);
            if (candidate?.success) {
                res.cookie('candidateToken', candidate.data?.token, {
                    expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
                    httpOnly: true,
                    secure: true, // use true if you're serving over https
                    sameSite: 'none' // allows cross-site cookie usage
                });
                res.status(200).json(candidate);
            }
        }
        catch (error) {
            next(error);
        }
    }
    logout(req, res, next) {
        try {
            res.cookie("candidateToken", "", {
                httpOnly: true,
                expires: new Date(0),
            });
            res.status(200).json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async home(req, res, next) {
        try {
            const stacksList = await this.candidateCase.getAllStacks();
            return res.status(200).json({ success: true, data: { stacks: stacksList } });
        }
        catch (error) {
            next(error);
        }
    }
    async getInterviewersByTech(req, res, next) {
        try {
            const tech = req.query.tech;
            if (!tech || typeof tech !== 'string') {
                throw new appError_1.default("Technology required", 400);
            }
            const interviewersList = await this.candidateCase.getInterviewersByTech(tech);
            return res.status(200).json({ success: true, data: { interviewersList } });
        }
        catch (error) {
            next(error);
        }
    }
    async getInterviewerSlotsDetails(req, res, next) {
        try {
            const { interviewerId } = req.params;
            const { techName } = req.query;
            if (!techName || typeof techName !== 'string')
                throw new appError_1.default("Tech not found", 400);
            const details = await this.candidateCase.getInterviewerSlotDetails(interviewerId, techName);
            return res.status(200).json({ success: true, data: { details } });
        }
        catch (error) {
            next(error);
        }
    }
    async getScheduledInterviewList(req, res, next) {
        try {
            const candidateId = req.candidateId;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            if (!candidateId) {
                throw new appError_1.default("Failed to get candidate id", 400);
            }
            const { interviews, total } = await this.candidateCase.getScheduledInterviewList(candidateId, page, limit);
            return res.status(200).json({ success: true, data: interviews, total });
        }
        catch (error) {
            next(error);
        }
    }
    async handleForgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            console.log(email);
            const token = await this.candidateCase.initiatePasswordReset(email);
            if (!token) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            return res.status(200).json({ success: true, data: token });
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token)
                throw new appError_1.default("Unauthorised user", 401);
            const { otp, password } = req.body;
            await this.candidateCase.resetPassword(otp, password, token);
            return res.status(201).json({ success: true, message: "Password changed successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async getFeedbackDetails(req, res, next) {
        try {
            const { interviewId } = req.query;
            if (!interviewId || typeof interviewId !== 'string')
                throw new appError_1.default("invalid interview Id", 400);
            // const id = new mongoose.Types.ObjectId(interviewId)
            const feedback = await this.candidateCase.getFeedbackDetails(interviewId);
            return res.status(200).json({ success: true, data: feedback });
        }
        catch (error) {
            next(error);
        }
    }
    async handleCandidatePremium(req, res, next) {
        try {
            const candidateId = req.candidateId;
            if (!candidateId)
                throw new appError_1.default("Candidate Id not found", 400);
            const isPremium = await this.candidateCase.isCandidatePremium(candidateId);
            if (isPremium) {
                return res.status(200).json({ success: true, message: "Candidate is a premium candidate" });
            }
            throw new appError_1.default("Candidate is not premium", 404);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllPremiumCandidates(req, res, next) {
        try {
            const { search } = req.query;
            const candidateId = req.candidateId?.toString();
            if (!candidateId)
                throw new appError_1.default("candidate id not found", 400);
            if (!search || typeof search !== 'string')
                throw new appError_1.default("search query not found", 400);
            const candidates = await this.candidateCase.getAllPremiumUsers(search, candidateId);
            return res.status(200).json({ success: true, data: candidates });
        }
        catch (error) {
            next(error);
        }
    }
    async saveInterviewerRating(req, res, next) {
        try {
            const { interviewerId, interviewId, rating, comment } = req.body;
            const candidateId = req.candidateId;
            if (!candidateId)
                throw new appError_1.default("candidate id not found", 400);
            const data = {
                interviewerId, candidateId, interviewId, rating, comment
            };
            await this.candidateCase.saveInterviewerRating(data);
            return res.status(201).json({ success: true, message: "Rating done successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async getCandidateAnalytics(req, res, next) {
        try {
            const candidateId = req.candidateId;
            if (!candidateId)
                throw new appError_1.default("candidate id not found", 400);
            const analytics = await this.candidateCase.getCandidateAnalytics(candidateId.toString());
            return res.status(200).json({ success: true, data: analytics });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyVideoConference(req, res, next) {
        try {
            const { roomId, userId } = req.body;
            console.log('inside controller: ', roomId, userId);
            if (!roomId || !userId)
                throw new appError_1.default("Room ID and User ID are required", 400);
            const isVerified = await this.candidateCase.verifyVideoConference(roomId, userId);
            if (!isVerified)
                throw new appError_1.default("You are not authorized to join this video conference.", 400);
            return res.status(200).json({ success: true, message: "Video conference verified successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async getNotifications(req, res, next) {
        try {
            const candidateId = req.candidateId;
            if (!candidateId)
                throw new appError_1.default("candidate id not found", 400);
            const list = await this.candidateCase.getNotifications(candidateId);
            console.log("notifications: ", list);
            return res.status(200).json({ success: true, data: list });
        }
        catch (error) {
            next(error);
        }
    }
    async getProfileDetails(req, res, next) {
        try {
            const candidateId = req.candidateId;
            if (!candidateId)
                throw new appError_1.default("candidate id not found", 400);
            const candidate = await this.candidateCase.getProfileDetails(candidateId);
            return res.status(200).json({ success: true, data: candidate });
        }
        catch (error) {
            next(error);
        }
    }
    async editProfile(req, res, next) {
        try {
            const { name, mobile } = req.body;
            const profilePic = req.file ? [req.file] : [];
            const candidateId = req.candidateId;
            if (!candidateId)
                throw new appError_1.default("candidate id not found", 400);
            await this.candidateCase.editProfile(candidateId, name, mobile, profilePic);
            if (profilePic.length > 0) {
                fs_1.default.unlink(profilePic[0].path, (err) => {
                    if (err) {
                        throw new appError_1.default("Error deleting file from server", 500);
                    }
                });
            }
            return res.status(200).send({ success: true, message: "Profile update successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async editPassword(req, res, next) {
        try {
            const candidateId = req.candidateId;
            const { currentPassword, newPassword } = req.body;
            if (!candidateId)
                throw new appError_1.default("candidate id not found", 400);
            await this.candidateCase.editPassword(candidateId, currentPassword, newPassword);
            return res.status(200).send({ success: true, message: "Password changed successfully" });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = CandidateController;
