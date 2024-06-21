import { Response, Request, NextFunction } from "express";
import InterviewerUseCase from "../../use-cases/interviewerUseCase";
import path from "path";
import fs from "fs";
import AppError from "../../infrastructure/utils/appError";
import InterviewSlot from "../../domain/entitites/interviewSlot";

// interface RequestModified extends Request {
//     interviewerId?: string
// }
interface Technology {
  value: string;
  label: string
}

class InterviewerController {
  constructor(private interviewerCase: InterviewerUseCase) {}

  async verifyInterviewerEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name, email } = req.body;
      const interviewerInfo = req.body;

      const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
      const nameRegex = /^[a-zA-Z ]{2,30}$/;

      if (!email?.trim()) {
        throw new AppError("Email is required", 400);
      }

      if (!emailRegex.test(email)) {
        throw new AppError("Invalid email format", 400);
      }

      if (!name?.trim()) {
        throw new AppError("Name is required", 400);
      }

      if (!nameRegex.test(name)) {
        throw new AppError("Invalid name format", 400);
      }

      const response = await this.interviewerCase.findInterviewer(
        interviewerInfo
      );
      if (response?.status === 200) {
        throw new AppError("User already exists", 400);
      }

      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({ success: true, data: token });
      }
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) throw new AppError("Unauthorized user", 401);

      const interviewerInfo =
        await this.interviewerCase.getInterviewerInfoUsingToken(token);
      if (!interviewerInfo) throw new AppError("No user found", 400);

      const response = await this.interviewerCase.findInterviewer(
        interviewerInfo
      );
      if (response?.status === 200) {
        throw new AppError("User already exists", 400);
      }

      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({ success: true, token });
      }
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1] as string;
      const { otp } = req.body;

      const saveInterviewer = await this.interviewerCase.saveInterviewer(
        token,
        otp
      );

      if (saveInterviewer.success) {
        const { token } = saveInterviewer.data;
        res.cookie("interviewerToken", token);
        return res
          .status(201)
          .json({ success: true, data: { token }, message: "OTP veified" });
      } else {
        throw new AppError("OTP not verified", 400);
      }
    } catch (error) {
      next(error);
    }
  }

  async verifyLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const interviewer = await this.interviewerCase.interviewerLogin(
        email,
        password
      );
      if (interviewer.success) {
        res.cookie("interviewerToken", interviewer.data?.token, {
          expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
          httpOnly: true,
        });
        res.status(200).json(interviewer);
      } else {
        throw new AppError(interviewer.message, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  async verifyDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        yearsOfExperience,
        currentDesignation,
        organisation,
        collegeUniversity,
        introduction,
      } = req.body;
      const { profilePicture, salarySlip, resume } = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      if (!profilePicture || !salarySlip || !resume) {
        throw new AppError("All files must be uploaded", 400);
      }

      const interviewerDetails = {
        ...req.body,
        ...req.files,
        _id: req.interviewerId,
      };

      const interviewerId = req.interviewerId;
      const updatedInterviewer =
        await this.interviewerCase.saveInterviewerDetails(interviewerDetails);

      if (updatedInterviewer.success) {
        // TO REMOVE FILES FROM SERVER
        [profilePicture, salarySlip, resume].forEach((files) => {
          files.forEach((file) => {
            const filePath = path.join(
              __dirname,
              "../../infrastructure/public/images",
              file.filename
            );
            fs.unlink(filePath, (err) => {
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
      } else {
        throw new AppError(
          "Interviewer not found or unable to update details",
          404
        );
      }
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.cookie("interviewerToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async getInterviewerProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const interviewerId = req.interviewerId;
      if (!interviewerId) {
        throw new AppError("Unauthorized user", 401);
      }

      const interviewerDetails =
        await this.interviewerCase.getInterviewerProfile(interviewerId);
      return res
        .status(200)
        .json({ success: true, data: { interviewer: interviewerDetails } });
    } catch (error) {
      next(error);
    }
  }

  

  async addInterviewSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, description, timeFrom, timeTo, title, price, technologies } = req.body.slotData;
      const techs: string[] = (technologies as Technology[]).map((option: Technology) => option.value);
      const interviewerId = req.interviewerId;

      if (!interviewerId) {
        throw new AppError("Unauthorized user", 401);
      }
   
      const slotData: InterviewSlot = {
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
                technologies: techs
              },
            ],
          },
        ],
      };

      const slotAdded = await this.interviewerCase.addSlot(slotData);
      return res
        .status(201)
        .json({
          success: true,
          data: slotAdded,
          message: "Slot added successfully",
        });
    } catch (error) {
      next(error);
    }
  }

  async getInterviewSlots(req: Request, res: Response, next: NextFunction) {

    try {
      const interviewerId = req.interviewerId
    if(!interviewerId){
      throw new AppError("Unauthorized user", 401)
    }
    const slotsList = await this.interviewerCase.getInterviewSlots(interviewerId)
    return res.status(200).json({success: true, data: slotsList, message: "Fetched interview slots list"})
    } catch (error) {
      next(error)
    }
  }

  async getDomains(req: Request, res: Response, next: NextFunction) {
    try {
      const domainsList = await this.interviewerCase.getDomains()
      return res.status(200).json({success: true, data: domainsList, message: "Fetched domains list"})
    } catch (error) {
      next(error)
    }
  }



  
}

export default InterviewerController;
