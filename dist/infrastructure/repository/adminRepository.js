"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adminModel_1 = require("../database/adminModel");
const candidateModel_1 = require("../database/candidateModel");
const stackModel_1 = require("../database/stackModel");
const interviewerModel_1 = require("../database/interviewerModel");
const appError_1 = __importDefault(require("../utils/appError"));
const scheduledInterviewModel_1 = require("../database/scheduledInterviewModel");
class AdminRepository {
    async findByEmail(email) {
        const adminExists = await adminModel_1.AdminModel.findOne({ email });
        if (!adminExists) {
            throw new appError_1.default("Admin not found", 404);
        }
        return adminExists;
    }
    async create(admin) {
        const newAdmin = new adminModel_1.AdminModel(admin);
        await newAdmin.save();
    }
    async findAllCandidates(page, limit) {
        const candidatesList = await candidateModel_1.CandidateModel.find()
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await candidateModel_1.CandidateModel.find().countDocuments();
        if (!candidatesList) {
            throw new appError_1.default("Failed to fetch candidates from database", 500);
        }
        return { candidates: candidatesList, total };
    }
    async findAllInterviewers(page, limit) {
        const interviewersList = await interviewerModel_1.InterviewerModel.find()
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await interviewerModel_1.InterviewerModel.find().countDocuments();
        if (!interviewersList) {
            throw new appError_1.default("Failed to fetch interviewers from database", 500);
        }
        return { interviewers: interviewersList, total };
    }
    async getInterviewerDetails(id) {
        const interviewerDetails = await interviewerModel_1.InterviewerModel.findById(id);
        if (!interviewerDetails) {
            throw new appError_1.default("Interviewer not found", 404);
        }
        return interviewerDetails;
    }
    async blockCandidate(candidateId) {
        const candidate = await candidateModel_1.CandidateModel.findById(candidateId);
        if (!candidate) {
            throw new appError_1.default("Candidate not found", 404);
        }
        await candidateModel_1.CandidateModel.findOneAndUpdate({ _id: candidateId }, { isBlocked: !candidate.isBlocked });
        return true;
    }
    async unlistStack(stackId) {
        const stack = await stackModel_1.StackModel.findById(stackId);
        if (!stack)
            throw new appError_1.default("Stack not found", 404);
        const stackUnlist = await stackModel_1.StackModel.findByIdAndUpdate(stackId, { isListed: !stack.isListed }, { new: true });
        if (!stackUnlist) {
            throw new appError_1.default("Failed to unlist stack", 500);
        }
        return stackUnlist;
    }
    async approveInterviewer(interviewerId) {
        const interviewer = await interviewerModel_1.InterviewerModel.findByIdAndUpdate({ _id: interviewerId }, { isApproved: true });
        if (!interviewer) {
            throw new appError_1.default("Interviewer not found", 404);
        }
        return true;
    }
    async addStack(stackName, technologies) {
        const newStack = new stackModel_1.StackModel({
            stackName: stackName,
            technologies: technologies,
        });
        const savedStack = await newStack.save();
        if (!savedStack) {
            throw new appError_1.default("Failed to add stack in the database", 500);
        }
        return true;
    }
    async findAllStacks(page, limit) {
        const stacksList = await stackModel_1.StackModel.find()
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await stackModel_1.StackModel.find().countDocuments();
        if (!stacksList) {
            throw new appError_1.default("Failed to fetch stacks from database", 500);
        }
        return { stacks: stacksList, total };
    }
    async findAllInterviews(page, limit) {
        const interviews = await scheduledInterviewModel_1.ScheduledInterviewModel.aggregate([
            {
                $lookup: {
                    from: "interviewers",
                    let: { interviewerId: { $toObjectId: "$interviewerId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$interviewerId"] } } },
                    ],
                    as: "interviewer",
                },
            },
            {
                $unwind: "$interviewer",
            },
            {
                $project: {
                    "interviewer.password": 0,
                    "interviewer.salarySlip": 0,
                    "interviewer.resume": 0,
                },
            },
            {
                $lookup: {
                    from: "candidates",
                    let: { candidateId: { $toObjectId: "$candidateId" } },
                    pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$candidateId"] } } }],
                    as: "candidate",
                },
            },
            {
                $unwind: "$candidate",
            },
            { $project: { "candidate.password": 0 } },
            {
                $skip: (page - 1) * limit,
            },
            { $limit: limit },
        ]);
        const total = await scheduledInterviewModel_1.ScheduledInterviewModel.find().countDocuments();
        return { interviews, total };
    }
    async dashboardDetails() {
        const interviewersCount = await interviewerModel_1.InterviewerModel.find().countDocuments();
        const candidatesCount = await candidateModel_1.CandidateModel.find().countDocuments();
        const interviews = await scheduledInterviewModel_1.ScheduledInterviewModel.aggregate([
            {
                $group: { _id: "$status", total: { $sum: 1 } },
            },
        ]);
        const interviewsCount = { completed: 0, scheduled: 0 };
        interviews.forEach((int) => {
            if (int._id === "Completed") {
                interviewsCount.completed = int.total;
            }
            else if (int._id === "Scheduled") {
                interviewsCount.scheduled = int.total;
            }
        });
        const scheduledInterviews = await scheduledInterviewModel_1.ScheduledInterviewModel.find();
        return {
            interviewersCount,
            candidatesCount,
            interviewsCount,
            scheduledInterviews,
        };
    }
    async findInterviewsStartingBetween(startTime, endTime) {
        console.log('start: ', startTime);
        console.log('end: ', endTime);
        // const interviews = await ScheduledInterviewModel.find({fromTime: {$gte: startTime, $lte: endTime}})
        const interviews = await scheduledInterviewModel_1.ScheduledInterviewModel.aggregate([
            {
                $match: {
                    fromTime: { $gte: startTime, $lte: endTime },
                    reminderSent: { $ne: true }
                }
            },
            {
                $lookup: {
                    from: "candidates",
                    let: { candidateId: { $toObjectId: "$candidateId" } },
                    pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$candidateId"] } } }],
                    as: "candidate",
                },
            },
            {
                $unwind: "$candidate",
            },
            { $project: { "candidate.password": 0 } },
        ]);
        console.log(interviews);
        if (interviews.length > 0) {
            const interviewIds = interviews.map(interview => interview._id);
            await scheduledInterviewModel_1.ScheduledInterviewModel.updateMany({ _id: { $in: interviewIds } }, { $set: { reminderSent: true } });
        }
        console.log(interviews);
        return interviews;
    }
}
exports.default = AdminRepository;
