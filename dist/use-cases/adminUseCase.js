"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../infrastructure/utils/appError"));
class AdminUseCase {
    constructor(iAdminRepository, jwtToken, mailService) {
        this.iAdminRepository = iAdminRepository;
        this.jwtToken = jwtToken;
        this.mailService = mailService;
    }
    async adminLogin(email, password) {
        const adminFound = await this.iAdminRepository.findByEmail(email);
        if (!adminFound) {
            throw new appError_1.default("Invalid Email", 400);
        }
        if (adminFound.password !== password) {
            throw new appError_1.default("Invalid Password", 401);
        }
        const token = this.jwtToken.createJwtToken(adminFound._id, "admin");
        return { success: true, adminData: adminFound._id, token };
    }
    async createAdmin(name, email, password) {
        const existingAdmin = await this.iAdminRepository.findByEmail(email);
        if (existingAdmin) {
            throw new appError_1.default("Admin with this email already exists", 400);
        }
        const newAdmin = { name, email, password };
        await this.iAdminRepository.create(newAdmin);
        return {
            success: true,
            message: "Admin created successfully",
            adminData: newAdmin,
        };
    }
    async getAllCandidates(page, limit) {
        const { candidates, total } = await this.iAdminRepository.findAllCandidates(page, limit);
        return { candidates, total };
    }
    async getAllInterviewers(page, limit) {
        const { interviewers, total } = await this.iAdminRepository.findAllInterviewers(page, limit);
        return { interviewers, total };
    }
    async interviewerDetails(id) {
        const interviewerDetails = await this.iAdminRepository.getInterviewerDetails(id);
        return interviewerDetails;
    }
    async blockCandidate(candidateId) {
        const candidateBlocked = await this.iAdminRepository.blockCandidate(candidateId);
        return candidateBlocked;
    }
    async unlistStack(stackId) {
        const stackUnlist = await this.iAdminRepository.unlistStack(stackId);
        return stackUnlist;
    }
    async approveInterviewer(interviewerId) {
        const interviewerApproved = await this.iAdminRepository.approveInterviewer(interviewerId);
        return interviewerApproved;
    }
    async addStack(stackName, technologies) {
        const stackAdded = await this.iAdminRepository.addStack(stackName, technologies);
        if (stackAdded) {
            return { success: true, message: "Stack added successfully" };
        }
        throw new appError_1.default("Failed to add stack", 400);
    }
    async getAllStacks(page, limit) {
        const { stacks, total } = await this.iAdminRepository.findAllStacks(page, limit);
        return { stacks, total };
    }
    async getAllInterviews(page, limit) {
        const { interviews, total } = await this.iAdminRepository.findAllInterviews(page, limit);
        return { interviews, total };
    }
    async getDashboardDetails() {
        const details = await this.iAdminRepository.dashboardDetails();
        return details;
    }
    async execute() {
        const now = new Date();
        const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
        const upComingInterviews = await this.iAdminRepository.findInterviewsStartingBetween(now, tenMinutesLater);
        for (const interview of upComingInterviews) {
            const { candidate } = interview;
            await this.mailService.sendInterviewRemainder(candidate.name, candidate.email, new Date());
        }
    }
}
exports.default = AdminUseCase;
