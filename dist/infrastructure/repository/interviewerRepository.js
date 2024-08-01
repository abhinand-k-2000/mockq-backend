"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feedBackModel_1 = require("../database/feedBackModel");
const interviewSlotModel_1 = require("../database/interviewSlotModel");
const interviewerModel_1 = require("../database/interviewerModel");
const scheduledInterviewModel_1 = require("../database/scheduledInterviewModel");
const stackModel_1 = require("../database/stackModel");
const appError_1 = __importDefault(require("../utils/appError"));
class InterviewerRepository {
    async findByEmail(email) {
        const interviewerFound = await interviewerModel_1.InterviewerModel.findOne({ email: email });
        // if (!interviewerFound) throw new AppError("Interviewer not found", 404);
        return interviewerFound;
    }
    async saveInterviewer(interviewer) {
        const newInterviewer = new interviewerModel_1.InterviewerModel(interviewer);
        const savedInterviewer = await newInterviewer.save();
        if (!savedInterviewer) {
            throw new appError_1.default("Failed to save interviewer", 500);
        }
        return newInterviewer;
    }
    async findInterviewerById(id) {
        const interviewerData = await interviewerModel_1.InterviewerModel.findById(id);
        if (!interviewerData) {
            throw new appError_1.default("Interviewer not found", 404);
        }
        return interviewerData;
    }
    async saveInterviewerDetails(interviewerDetails) {
        const updatedInterviewer = await interviewerModel_1.InterviewerModel.findByIdAndUpdate(interviewerDetails._id, interviewerDetails, { new: true });
        return updatedInterviewer || null;
    }
    findById(id) {
        const interivewer = interviewerModel_1.InterviewerModel.findById(id);
        if (!interivewer) {
            throw new appError_1.default("Interviewer not found", 404);
        }
        return interivewer;
    }
    async saveInterviewSlot(slotData) {
        const { interviewerId, slots } = slotData;
        const transformData = (data, interviewerId) => {
            const slots = data.map((item) => ({
                date: new Date(item.date),
                schedule: item.schedule.map((scheduleItem) => ({
                    description: scheduleItem.description,
                    from: new Date(scheduleItem.from),
                    to: new Date(scheduleItem.to),
                    title: scheduleItem.title,
                    status: scheduleItem.status,
                    price: Number(scheduleItem.price),
                    technologies: scheduleItem.technologies,
                })),
            }));
            return { interviewerId, slots };
        };
        const transformedData = transformData(slots, interviewerId);
        let interviewSlot = await interviewSlotModel_1.InterviewSlotModel.findOne({ interviewerId });
        if (!interviewSlot) {
            interviewSlot = new interviewSlotModel_1.InterviewSlotModel(transformedData);
        }
        else {
            transformedData.slots.forEach((newSlot) => {
                const existingSlotIndex = interviewSlot.slots.findIndex((slot) => slot.date?.toISOString().split("T")[0] ===
                    newSlot.date?.toISOString().split("T")[0]);
                if (existingSlotIndex === -1) {
                    interviewSlot?.slots.push(newSlot);
                }
                else {
                    newSlot.schedule.forEach((newSchedule) => {
                        const existingScheduleIndex = interviewSlot?.slots[existingSlotIndex].schedule.findIndex((s) => s.from.toISOString() === newSchedule.from.toISOString() &&
                            s.to.toISOString() === newSchedule.to.toISOString());
                        if (existingScheduleIndex === -1) {
                            interviewSlot?.slots[existingSlotIndex].schedule.push(newSchedule);
                        }
                        else {
                            throw new appError_1.default("Time slot already taken", 400);
                            interviewSlot.slots[existingSlotIndex].schedule[existingScheduleIndex] = newSchedule;
                        }
                    });
                }
            });
        }
        const savedSlot = await interviewSlot.save();
        return savedSlot;
    }
    async getInterviewSlots(interviewerId, page, limit, searchQuery) {
        console.log(searchQuery);
        const pipeline = [
            {
                $match: { interviewerId: interviewerId.toString() }
            },
            {
                $unwind: "$slots"
            },
        ];
        console.log(await interviewSlotModel_1.InterviewSlotModel.aggregate(pipeline));
        if (searchQuery) {
            pipeline.push({
                $match: {
                    $or: [
                        { "slots.schedule.title": { $regex: searchQuery, $options: "i" } },
                        { "slots.schedule.technologies": { $elemMatch: { $regex: searchQuery, $options: "i" } } }
                    ]
                }
            });
        }
        pipeline.push({
            $project: {
                _id: 0,
                date: "$slots.date",
                schedule: "$slots.schedule"
            }
        }, {
            $sort: { date: -1 }
        });
        const totalPipeline = [...pipeline, { $count: "total" }];
        const [totalResult] = await interviewSlotModel_1.InterviewSlotModel.aggregate(totalPipeline);
        const total = totalResult ? totalResult.total : 0;
        pipeline.push({
            $skip: (page - 1) * limit
        }, {
            $limit: limit
        });
        const slots = await interviewSlotModel_1.InterviewSlotModel.aggregate(pipeline);
        return { slots, total };
    }
    async getDomains() {
        const domainList = await stackModel_1.StackModel.find();
        if (!domainList)
            throw new appError_1.default("Domains not found!", 400);
        return domainList;
    }
    async updatePassword(interivewerId, password) {
        await interviewerModel_1.InterviewerModel.findByIdAndUpdate(interivewerId, {
            password: password,
        });
    }
    async getScheduledInterviews(interviewerId, page, limit) {
        const list = await scheduledInterviewModel_1.ScheduledInterviewModel.find({
            interviewerId: interviewerId,
        }).skip((page - 1) * limit).limit(limit).sort({ date: -1 });
        const total = await scheduledInterviewModel_1.ScheduledInterviewModel.find({ interviewerId }).countDocuments();
        if (!list)
            throw new appError_1.default("Interviews are not scheduled", 404);
        return { interviews: list, total };
    }
    async getScheduledInterviewById(interviewId) {
        const interview = await scheduledInterviewModel_1.ScheduledInterviewModel.aggregate([
            {
                $match: { _id: interviewId }, // Use interviewId directly as a string
            },
            {
                $lookup: {
                    from: "interviewers",
                    let: { interviewerId: { $toObjectId: "$interviewerId" } }, // Convert interviewerId to ObjectId
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$interviewerId"] } } },
                        { $project: { name: 1, profilePicture: 1 } },
                    ],
                    as: "interviewer",
                },
            },
            { $unwind: "$interviewer" },
            {
                $lookup: {
                    from: "candidates",
                    let: { candidateId: { $toObjectId: "$candidateId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$candidateId"] } } },
                        { $project: { name: 1, email: 1, mobile: 1 } },
                    ],
                    as: "candidate",
                },
            },
            {
                $unwind: "$candidate",
            },
        ]);
        return interview[0];
    }
    async saveFeedback(feedbackDetails) {
        const { interviewId, interviewerId, candidateId, technicalSkills, communicationSkills, problemSolvingSkills, strength, areaOfImprovement, additionalComments, } = feedbackDetails;
        const feedback = new feedBackModel_1.FeedBackModel({
            interviewId,
            interviewerId,
            candidateId,
            technicalSkills,
            communicationSkills,
            problemSolvingSkills,
            strength,
            areaOfImprovement,
            additionalComments,
        });
        const feedbackSaved = await feedback.save();
        await scheduledInterviewModel_1.ScheduledInterviewModel.findByIdAndUpdate(interviewId, {
            status: "Completed",
        });
        return feedbackSaved;
    }
    async getPaymentDashboard(interviewerId) {
        // const interviews = await ScheduledInterviewModel.find({interviewerId: interviewerId})
        const interviews = await scheduledInterviewModel_1.ScheduledInterviewModel.aggregate([
            {
                $match: { interviewerId: interviewerId.toString() }
            },
            {
                $lookup: {
                    from: "candidates",
                    let: { candidateId: { $toObjectId: "$candidateId" } },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$candidateId"] }
                            }
                        }
                    ],
                    as: "candidate"
                }
            },
            { $unwind: "$candidate" },
            {
                $project: { "candidate.password": 0, "candidate.email": 0, "candidate.mobile": 0 }
            }
        ]);
        const totalEarnings = await scheduledInterviewModel_1.ScheduledInterviewModel.aggregate([
            {
                $match: { interviewerId: interviewerId.toString() }
            },
            {
                $group: { '_id': null, total: { $sum: "$price" } }
            }
        ]);
        const totalRevenue = totalEarnings[0].total;
        return { interviews, totalRevenue };
    }
    async getScheduledInterviewByRoomId(roomId) {
        const interview = await scheduledInterviewModel_1.ScheduledInterviewModel.findOne({ roomId: roomId });
        return interview;
    }
    async editProfile(interviewerId, details) {
        const { name, mobile, currentDesignation, organisation, yearsOfExperience, introduction } = details;
        await interviewerModel_1.InterviewerModel.findByIdAndUpdate(interviewerId, {
            name,
            mobile,
            currentDesignation,
            organisation,
            yearsOfExperience,
            introduction
        });
    }
}
exports.default = InterviewerRepository;
