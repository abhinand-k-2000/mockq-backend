import { NextFunction, Request, Response } from "express";
import AdminUseCase from "../../use-cases/adminUseCase";

class AdminController {
  private adminCase: AdminUseCase;

  constructor(adminCase: AdminUseCase) {
    this.adminCase = adminCase;
  }

  async login(req: Request, res: Response, next: NextFunction) {
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
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.cookie("adminToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error)
    }
  }

  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const admin = await this.adminCase.createAdmin(name, email, password);
      if (admin?.success) {
        return res.status(201).json(admin);
      }
      return res.status(400).json(admin);
    } catch (error) {
      next(error)
    }
  }

  async getAllCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      const candidatesList = await this.adminCase.getAllCandidates();
      return res
        .status(200)
        .json({
          success: true,
          data: candidatesList,
          message: "Candidates list fetched",
        });
    } catch (error) {
        next(error)
    }
  }

  async getAllInterviewers(req: Request, res: Response, next: NextFunction) {
    try {
      const interviewersList = await this.adminCase.getAllInterviewers();
      return res
        .status(200)
        .json({
          success: true,
          data: interviewersList,
          message: "Interviewers list fetched",
        });
    } catch (error) {
        next(error)
    }
  }

  async getInterviewerDetails(req: Request, res: Response, next: NextFunction) {
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
    } catch (error) {
        next(error)
    }
  }

  async blockCandidate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const candidateBlocked = await this.adminCase.blockCandidate(id);
      if (candidateBlocked) {
        res.status(200).json({ success: true });
      }
    } catch (error) {
        next(error)
    }
  }

  async approveInterviewer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const interviewerAppproved = await this.adminCase.approveInterviewer(id);
      if (interviewerAppproved) {
        res
          .status(200)
          .json({ success: true, message: "Interviewer approved" });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Failed to approve interviewer" });
      }
    } catch (error) {
        next(error)
    }
  }

  async addStack(req: Request, res: Response, next: NextFunction) {
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
    } catch (error) {
      
      next(error)
    }
  }

  async getAllStacks(req: Request, res: Response, next: NextFunction) {
    try {
      const stacksList = await this.adminCase.getAllStacks();
      return res
        .status(200)
        .json({
          success: true,
          data: stacksList,
          message: "Stacks list fetched",
        });
    } catch (error) {
        next(error)
    }
  }

  async unlistStack(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const unlistStack = await this.adminCase.unlistStack(id);
      if (unlistStack) {
        return res.status(200).json({ success: true, data: unlistStack });
      }
    } catch (error) {
        next(error)
    }
  }

  async getAllInterviews(req: Request, res: Response, next: NextFunction) {
    try {
      const interviews = await this.adminCase.getAllInterviews()
      return res.status(200).json({success: true, data: interviews})
    } catch (error) {
      next(error)
    }
  }

  async getDashboardDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await this.adminCase.getDashboardDetails()
      return res.status(200).json({success: true, data: details})
    } catch (error) {
      next(error)
    }
  }
}

export default AdminController;
