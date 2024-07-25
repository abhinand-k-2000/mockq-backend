"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdminController {
    constructor(adminCase) {
        this.adminCase = adminCase;
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const admin = await this.adminCase.adminLogin(email, password);
            if (admin?.success) {
                const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
                res.cookie("adminToken", admin.token, {
                    expires: expiryDate,
                    httpOnly: true,
                });
                return res.status(200).json(admin);
            }
            return res.status(404).json(admin);
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            res.cookie("adminToken", "", {
                httpOnly: true,
                expires: new Date(0),
            });
            res.status(200).json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async createAdmin(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const admin = await this.adminCase.createAdmin(name, email, password);
            if (admin?.success) {
                return res.status(201).json(admin);
            }
            return res.status(400).json(admin);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllCandidates(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const { candidates, total } = await this.adminCase.getAllCandidates(page, limit);
            return res
                .status(200)
                .json({
                success: true,
                data: candidates,
                total,
                message: "Candidates list fetched",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllInterviewers(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const { interviewers, total } = await this.adminCase.getAllInterviewers(page, limit);
            return res
                .status(200)
                .json({
                success: true,
                data: interviewers,
                total,
                message: "Interviewers list fetched",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getInterviewerDetails(req, res, next) {
        try {
            const { id } = req.params;
            const interviewerDetails = await this.adminCase.interviewerDetails(id);
            return res
                .status(200)
                .json({
                success: true,
                data: interviewerDetails,
                message: "Interviewer details fetched",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async blockCandidate(req, res, next) {
        try {
            const { id } = req.params;
            const candidateBlocked = await this.adminCase.blockCandidate(id);
            if (candidateBlocked) {
                res.status(200).json({ success: true });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async approveInterviewer(req, res, next) {
        try {
            const { id } = req.params;
            const interviewerAppproved = await this.adminCase.approveInterviewer(id);
            if (interviewerAppproved) {
                res
                    .status(200)
                    .json({ success: true, message: "Interviewer approved" });
            }
            else {
                res
                    .status(400)
                    .json({ success: false, message: "Failed to approve interviewer" });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async addStack(req, res, next) {
        try {
            const { stackName, technologies } = req.body;
            if (!stackName.trim()) {
                return res
                    .status(400)
                    .json({ success: false, message: "Stack name should not be empty" });
            }
            if (technologies.length === 0) {
                return res
                    .status(400)
                    .json({ success: false, message: "No technologies added" });
            }
            const stackAdded = await this.adminCase.addStack(stackName, technologies);
            if (stackAdded?.success) {
                return res.status(201).json(stackAdded);
            }
            return res.status(400).json(stackAdded);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllStacks(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const { stacks, total } = await this.adminCase.getAllStacks(page, limit);
            return res
                .status(200)
                .json({
                success: true,
                data: stacks,
                total,
                message: "Stacks list fetched",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async unlistStack(req, res, next) {
        try {
            const { id } = req.params;
            const unlistStack = await this.adminCase.unlistStack(id);
            if (unlistStack) {
                return res.status(200).json({ success: true, data: unlistStack });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async getAllInterviews(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const { interviews, total } = await this.adminCase.getAllInterviews(page, limit);
            return res.status(200).json({ success: true, data: interviews, total });
        }
        catch (error) {
            next(error);
        }
    }
    async getDashboardDetails(req, res, next) {
        try {
            const details = await this.adminCase.getDashboardDetails();
            return res.status(200).json({ success: true, data: details });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = AdminController;
