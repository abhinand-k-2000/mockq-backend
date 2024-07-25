"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const candidateModel_1 = require("../database/candidateModel");
const feedBackModel_1 = require("../database/feedBackModel");
const interviewSlotModel_1 = require("../database/interviewSlotModel");
const interviewerModel_1 = require("../database/interviewerModel");
const interviewerRatingModel_1 = require("../database/interviewerRatingModel");
const scheduledInterviewModel_1 = require("../database/scheduledInterviewModel");
const stackModel_1 = require("../database/stackModel");
const appError_1 = __importDefault(require("../utils/appError"));
class CandidateRepository {
    async findByEmail(email) {
        const candidateExists = await candidateModel_1.CandidateModel.findOne({ email: email });
        // if (!candidateExists) {
        //   throw new AppError("Candidate not found", 404);
        // }
        return candidateExists;
    }
    async saveCandidate(candidate) {
        const newCandidate = new candidateModel_1.CandidateModel(candidate);
        const savedCandidate = await newCandidate.save();
        if (!savedCandidate) {
            throw new appError_1.default("Failed to save candidate", 500);
        }
        return savedCandidate;
    }
    async findCandidateById(id) {
        const candidateData = await candidateModel_1.CandidateModel.findById(id);
        if (!candidateData) {
            throw new appError_1.default("Candidate not found", 404);
        }
        return candidateData;
    }
    async findAllStacks() {
        const stacks = await stackModel_1.StackModel.find({ isListed: true });
        if (!stacks) {
            throw new appError_1.default("Failed to fetch stacks from database", 500);
        }
        return stacks;
    }
    async getInterviewersByTech(techName) {
        const interviewersIdsList = await interviewSlotModel_1.InterviewSlotModel.aggregate([
            {
                $unwind: "$slots",
            },
            {
                $unwind: "$slots.schedule",
            },
            {
                $match: {
                    $or: [
                        { "slots.schedule.title": { $regex: techName, $options: "i" } },
                        {
                            "slots.schedule.description": { $regex: techName, $options: "i" },
                        },
                        { "slots.schedule.technologies": { $in: [techName] } },
                    ],
                },
            },
            {
                $group: {
                    _id: "$interviewerId",
                },
            },
        ]);
        if (!interviewersIdsList)
            throw new appError_1.default("No interviews available", 404);
        const interviewersIds = interviewersIdsList.map((item) => item._id);
        const interviewersDetails = await interviewerModel_1.InterviewerModel.find({ _id: { $in: interviewersIds } }, {
            name: 1,
            profilePicture: 1,
            introduction: 1,
            currentDesigantion: 1,
            organisation: 1,
        });
        return interviewersDetails;
    }
    async getInterviewerSlotsDetails(interviewerId, techName) {
        const interviewerDetails = await interviewerModel_1.InterviewerModel.findById(interviewerId, {
            name: 1,
            currentDesignation: 1,
            organisation: 1,
            profilePicture: 1,
            yearsOfExperience: 1,
        });
        // Slots which are in the past are not fetched 
        const interviewSlotDetails = await interviewSlotModel_1.InterviewSlotModel.aggregate([
            {
                $match: { interviewerId: interviewerId },
            },
            {
                $unwind: "$slots",
            },
            {
                $unwind: "$slots.schedule",
            },
            {
                $match: {
                    $or: [
                        { "slots.schedule.title": { $regex: techName, $options: "i" } },
                        {
                            "slots.schedule.description": { $regex: techName, $options: "i" },
                        },
                        { "slots.schedule.technologies": { $in: [techName] } },
                    ],
                    // "slots.date": {$gte: new Date()},
                },
            },
            {
                $match: {
                    $or: [
                        { "slots.date": { $gt: new Date() } }, // Future dates
                        {
                            $and: [
                                { "slots.date": { $eq: new Date().toISOString().split("T")[0] } }, // Today's date
                                { "slots.schedule.timeTo": { $gte: new Date() } }, // Times that are not in the past
                            ],
                        },
                    ],
                },
            },
            {
                $sort: { "slots.date": 1 }
            }
        ]);
        const details = {
            interviewerDetails,
            interviewSlotDetails,
        };
        return details;
    }
    async bookSlot(info) {
        const { interviewerId, _id, date, candidateId } = info;
        try {
            const slot = await interviewSlotModel_1.InterviewSlotModel.findOneAndUpdate({
                interviewerId: interviewerId,
                "slots.date": date,
                "slots.schedule._id": _id,
            }, {
                $set: { "slots.$[slotElem].schedule.$[schedElem].status": "booked" },
            }, {
                arrayFilters: [{ "slotElem.date": date }, { "schedElem._id": _id }],
                new: true, // Return the updated document
            });
            return;
        }
        catch (error) {
            throw error;
        }
    }
    async getScheduledInterviews(candidateId, page, limit) {
        const interviewList = await scheduledInterviewModel_1.ScheduledInterviewModel.find({ candidateId: candidateId })
            .skip((page - 1) * limit).limit(limit);
        const total = await scheduledInterviewModel_1.ScheduledInterviewModel.countDocuments({ candidateId });
        return { interviews: interviewList, total };
    }
    async updatePassword(candidateId, password) {
        await candidateModel_1.CandidateModel.findByIdAndUpdate(candidateId, {
            password: password
        });
    }
    async getFeedbackDetails(interviewId) {
        const feedback = await feedBackModel_1.FeedBackModel.aggregate([
            {
                $match: { interviewId: interviewId }
            }, {
                $lookup: {
                    from: "interviewers",
                    let: { interviewerId: { $toObjectId: "$interviewerId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$interviewerId"] } } },
                        { $project: { name: 1 } }
                    ],
                    as: "interviewer"
                }
            },
            {
                $unwind: "$interviewer"
            },
            {
                $lookup: {
                    from: "candidates",
                    let: { candidateId: { $toObjectId: "$candidateId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$candidateId"] } } },
                        { $project: { name: 1 } }
                    ],
                    as: "candidate"
                }
            }, {
                $unwind: "$candidate"
            }
        ]);
        return feedback[0];
    }
    async scehduledInterviewDetails(interviewId) {
        const interviewDetails = await scheduledInterviewModel_1.ScheduledInterviewModel.findById(interviewId);
        return interviewDetails;
    }
    async getAllPremiumCandidates(search, candidateId) {
        const candidates = await candidateModel_1.CandidateModel.find({
            $and: [
                { $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                    ] },
                { isPremium: true }
            ]
        }).find({ _id: { $ne: candidateId } });
        return candidates;
    }
    async saveInterviewerRating(data) {
        const { interviewerId, candidateId, interviewId, rating, comment } = data;
        const newRating = new interviewerRatingModel_1.InterviewerRatingModel({
            interviewerId, candidateId, interviewId, rating, comment
        });
        await newRating.save();
        await scheduledInterviewModel_1.ScheduledInterviewModel.findByIdAndUpdate(interviewId, { interviewerRatingAdded: true });
    }
    async getCandidateAnalytics(candidateId) {
        const interviews = await scheduledInterviewModel_1.ScheduledInterviewModel.aggregate([
            {
                $match: { candidateId: candidateId }
            },
            {
                $group: { _id: '$status', totalNumber: { $sum: 1 } }
            }
        ]);
        const interviewCounts = { completed: 0, scheduled: 0 };
        interviews.forEach((item) => {
            if (item._id === 'Completed') {
                interviewCounts.completed = item.totalNumber;
            }
            else if (item._id === 'Scheduled') {
                interviewCounts.scheduled = item.totalNumber;
            }
        });
        return interviewCounts;
    }
    async getScheduledInterviewByRoomId(roomId) {
        const interview = await scheduledInterviewModel_1.ScheduledInterviewModel.findOne({ roomId: roomId });
        return interview;
    }
}
exports.default = CandidateRepository;
