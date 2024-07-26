"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const appError_1 = __importDefault(require("../../infrastructure/utils/appError"));
const mongoose_1 = __importDefault(require("mongoose"));
class InterviewerController {
    constructor(interviewerCase) {
        this.interviewerCase = interviewerCase;
    }
    async verifyInterviewerEmail(req, res, next) {
        try {
            const { name, email } = req.body;
            const interviewerInfo = req.body;
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
            const response = await this.interviewerCase.findInterviewer(interviewerInfo);
            if (response?.status === 200) {
                throw new appError_1.default("User already exists", 400);
            }
            if (response?.status === 201) {
                const token = response.data;
                return res.status(201).json({ success: true, data: token });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async resendOtp(req, res, next) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token)
                throw new appError_1.default("Unauthorized user", 401);
            const interviewerInfo = await this.interviewerCase.getInterviewerInfoUsingToken(token);
            if (!interviewerInfo)
                throw new appError_1.default("No user found", 400);
            const response = await this.interviewerCase.findInterviewer(interviewerInfo);
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
            const token = req.headers.authorization?.split(" ")[1];
            const { otp } = req.body;
            const saveInterviewer = await this.interviewerCase.saveInterviewer(token, otp);
            if (saveInterviewer.success) {
                const { token } = saveInterviewer.data;
                res.cookie("interviewerToken", token);
                return res
                    .status(201)
                    .json({ success: true, data: { token }, message: "OTP veified" });
            }
            else {
                throw new appError_1.default("OTP not verified", 400);
            }
        }
        catch (error) {
            next(error);
        }
    }
    async verifyLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            const interviewer = await this.interviewerCase.interviewerLogin(email, password);
            if (interviewer.success) {
                res.cookie("interviewerToken", interviewer.data?.token, {
                    expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
                    httpOnly: true,
                    secure: true, // use true if you're serving over https
                    sameSite: 'none' // allows cross-site cookie usage
                });
                res.status(200).json(interviewer);
            }
            else {
                throw new appError_1.default(interviewer.message, 400);
            }
        }
        catch (error) {
            next(error);
        }
    }
    async verifyDetails(req, res, next) {
        try {
            const { yearsOfExperience, currentDesignation, organisation, collegeUniversity, introduction, } = req.body;
            const { profilePicture, salarySlip, resume } = req.files;
            if (!profilePicture || !salarySlip || !resume) {
                throw new appError_1.default("All files must be uploaded", 400);
            }
            const interviewerDetails = {
                ...req.body,
                ...req.files,
                _id: req.interviewerId,
            };
            const interviewerId = req.interviewerId;
            const updatedInterviewer = await this.interviewerCase.saveInterviewerDetails(interviewerDetails);
            if (updatedInterviewer.success) {
                // TO REMOVE FILES FROM SERVER
                [profilePicture, salarySlip, resume].forEach((files) => {
                    files.forEach((file) => {
                        const filePath = path_1.default.join(__dirname, "../../infrastructure/public/images", file.filename);
                        fs_1.default.unlink(filePath, (err) => {
                            if (err) {
                                console.log("Error deleting the file from server", err);
                            }
                        });
                    });
                });
                return res.status(200).json({
                    success: true,
                    message: "Interviewer details verified successfully",
                    data: updatedInterviewer,
                });
            }
            else {
                throw new appError_1.default("Interviewer not found or unable to update details", 404);
            }
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            res.cookie("interviewerToken", "", {
                httpOnly: true,
                expires: new Date(0),
            });
            res.status(200).json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async getInterviewerProfile(req, res, next) {
        try {
            const interviewerId = req.interviewerId;
            if (!interviewerId) {
                throw new appError_1.default("Unauthorized user", 401);
            }
            const interviewerDetails = await this.interviewerCase.getInterviewerProfile(interviewerId);
            return res
                .status(200)
                .json({ success: true, data: { interviewer: interviewerDetails } });
        }
        catch (error) {
            next(error);
        }
    }
    async addInterviewSlot(req, res, next) {
        try {
            const { date, description, timeFrom, timeTo, title, price, technologies, } = req.body.slotData;
            const techs = technologies.map((option) => option.value);
            const interviewerId = req.interviewerId;
            if (!interviewerId) {
                throw new appError_1.default("Unauthorized user", 401);
            }
            const slotData = {
                interviewerId,
                slots: [
                    {
                        date: new Date(date),
                        schedule: [
                            {
                                description,
                                from: timeFrom,
                                to: timeTo,
                                title,
                                status: "open",
                                price,
                                technologies: techs,
                            },
                        ],
                    },
                ],
            };
            const slotAdded = await this.interviewerCase.addSlot(slotData);
            return res.status(201).json({
                success: true,
                data: slotAdded,
                message: "Slot added successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getInterviewSlots(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const interviewerId = req.interviewerId;
            if (!interviewerId) {
                throw new appError_1.default("Unauthorized user", 401);
            }
            const { slots, total } = await this.interviewerCase.getInterviewSlots(interviewerId, page, limit);
            return res
                .status(200)
                .json({
                success: true,
                data: slots,
                total,
                message: "Fetched interview slots list",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getDomains(req, res, next) {
        try {
            const domainsList = await this.interviewerCase.getDomains();
            return res
                .status(200)
                .json({
                success: true,
                data: domainsList,
                message: "Fetched domains list",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async handleForgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            console.log(email);
            const token = await this.interviewerCase.initiatePasswordReset(email);
            if (!token) {
                return res
                    .status(404)
                    .json({ success: false, message: "User not found" });
            }
            return res.status(200).json({ success: true, data: token });
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token)
                throw new appError_1.default("Unauthorised user", 401);
            const { otp, password } = req.body;
            await this.interviewerCase.resetPassword(otp, password, token);
            return res
                .status(201)
                .json({ success: true, message: "Password changed successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async getScheduledInterviews(req, res, next) {
        try {
            const interviewerId = req.interviewerId;
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            if (!interviewerId)
                throw new appError_1.default("Interviewer not found", 400);
            const { interviews, total } = await this.interviewerCase.getScheduledInterviews(interviewerId, page, limit);
            return res.status(200).json({ success: true, data: interviews, total });
        }
        catch (error) {
            next(error);
        }
    }
    async getDetails(req, res, next) {
        const interviewerId = req.interviewerId;
        if (!interviewerId)
            throw new appError_1.default("Interviewer id not found", 400);
        const details = await this.interviewerCase.getDetails(interviewerId);
        return res.status(200).json({ success: true, data: details });
    }
    async getScheduledInterviewById(req, res, next) {
        try {
            const { interviewId } = req.query;
            if (!interviewId || typeof interviewId !== 'string')
                throw new appError_1.default("Interview Id missing or invalid ", 400);
            let id = new mongoose_1.default.Types.ObjectId(interviewId);
            const interview = await this.interviewerCase.getScheduledInterviewById(id);
            return res.status(200).json({ success: true, data: interview });
        }
        catch (error) {
            next(error);
        }
    }
    async saveFeedbackDetails(req, res, next) {
        try {
            const { fullDetails } = req.body;
            const feedBack = await this.interviewerCase.saveFeedback(fullDetails);
            return res.status(201).json({ success: true, message: "Feedback uploaded successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async getPaymentDashboard(req, res, next) {
        try {
            const interviewerId = req.interviewerId;
            if (!interviewerId)
                throw new appError_1.default("Interviewer Id not found", 400);
            const data = await this.interviewerCase.getPaymentDashboard(interviewerId);
            return res.status(200).json({ success: true, data });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyVideoConference(req, res, next) {
        try {
            const { roomId, userId } = req.body;
            if (!roomId || !userId)
                throw new appError_1.default("Room ID and User ID are required", 400);
            const isVerified = await this.interviewerCase.verifyVideoConference(roomId, userId);
            if (!isVerified)
                throw new appError_1.default("You are not authorized to join this video conference.", 400);
            return res.status(200).json({ success: true, message: "Video conference verified successfully" });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = InterviewerController;
