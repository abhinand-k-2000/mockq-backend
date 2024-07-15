import mongoose from "mongoose";
import AppError from "../../infrastructure/utils/appError";
import CandidateUseCase from "../../use-cases/candidateUseCase";
import { Request, Response, NextFunction, response } from "express";


class CandidateController {
  constructor(private candidateCase: CandidateUseCase) {}

  async verifyCadidateEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email } = req.body;
      const candidateInfo = req.body;
      
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
      const response = await this.candidateCase.findCandidate(candidateInfo);

      if (response?.status === 200) {
        throw new AppError("User already exists", 400);
      }
      
      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({ success: true, token });
      }
  
    } catch (error) {
      next(error)
    }
  }  

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1] as string;
      if(!token) throw new AppError("Unauthorised user", 401);

      const candidateInfo = await this.candidateCase.getCandidateInfoUsingToken(token);
      if(!candidateInfo){
        throw new AppError("No user found", 400);
      }

      const response = await this.candidateCase.findCandidate(candidateInfo)
      if (response?.status === 200) {
        throw new AppError("User already exists", 400);
      }
      
      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({ success: true, token });
      }

    } catch (error) {
      next(error)
    }
  }


  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1] as string
      const {otp} = req.body

      const saveCandidate = await this.candidateCase.saveCandidate(token, otp)

      if(saveCandidate.success){
        res.cookie("candidateToken", saveCandidate.token)
        return res.status(200).json({success: true, token: saveCandidate.token, message: "OTP verified"})
      }else {
        res.status(400).json({success: false, message: "OTP not verified"})
      }
    } catch (error) {     
      next(error)
    }
  }



  async verifyLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const {email, password} = req.body
      const candidate = await this.candidateCase.candidateLogin(email, password)
      if(candidate?.success) {

        res.cookie('candidateToken', candidate.data?.token, {
          expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
          httpOnly: true
        })

        res.status(200).json(candidate)
      }
    } catch (error) {
      next(error)
    }
  }


   logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.cookie("candidateToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error)
    }
  }

  async home (req: Request, res: Response, next: NextFunction) {
    try {
      const stacksList = await this.candidateCase.getAllStacks()
      return res.status(200).json({success: true, data: {stacks: stacksList}})
    } catch (error) {
      next(error)
    }
  }


  async getInterviewersByTech(req: Request, res: Response, next: NextFunction) {
    try {
      const tech = req.query.tech
      if (!tech || typeof tech!== 'string') {
        throw new AppError("Technology required", 400);
    }

    const interviewersList = await this.candidateCase.getInterviewersByTech(tech)
    return res.status(200).json({success: true, data: {interviewersList}})
    } catch (error) {
      next(error)
    }

  }

  async getInterviewerSlotsDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const {interviewerId} = req.params 
      const {techName} = req.query

      if(!techName || typeof techName !== 'string') throw new AppError("Tech not found", 400)


      const details = await this.candidateCase.getInterviewerSlotDetails(interviewerId, techName)
      return res.status(200).json({success: true, data: {details}})
    } catch (error) {
      next(error)
    }
  }

  // async bookSlot(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const data = req.body;

  //     const candidateId = req.candidateId
  //     console.log("canidate Id: ", candidateId)
  //     console.log(req.body)

  //   const { interviewerId, slots } = data.data;
  //   const { schedule, date } = slots;
  //   const { title, price, description, to, from, _id } = schedule;

  //   const info = {
  //       interviewerId, to, from, _id, date, candidateId, price, title, description
  //   }

  //   const bookSlot = await this.candidateCase.bookSlot(info)
  //   return bookSlot
  //   } catch (error) {
  //     next(error)
  //   }
  // }


  async getScheduledInterviewList(req: Request, res: Response, next: NextFunction) {
    try {
      const candidateId = req.candidateId;
      if(!candidateId){
        throw new AppError("Failed to get candidate id", 400)
      }

      const interviewList = await this.candidateCase.getScheduledInterviewList(candidateId)
      return res.status(200).json({success: true, data: interviewList})

    } catch (error) {
      next(error)
    }
  }

  async handleForgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const {email} = req.body
      console.log(email)
      const token = await this.candidateCase.initiatePasswordReset(email)
      if (!token) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.status(200).json({success: true, data: token})
    } catch (error) {
      next(error)
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1] as string;
      if(!token) throw new AppError("Unauthorised user", 401);

      const {otp, password} = req.body
      await this.candidateCase.resetPassword(otp, password, token)
      return res.status(201).json({success: true, message: "Password changed successfully"})
      
    } catch (error) {
      next(error)
    }
  }


  async getFeedbackDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const {interviewId} = req.query 

      if(!interviewId || typeof interviewId !== 'string') throw new AppError("invalid interview Id", 400)

      // const id = new mongoose.Types.ObjectId(interviewId)
      const feedback = await this.candidateCase.getFeedbackDetails(interviewId)
      return res.status(200).json({success: true, data: feedback})
    } catch (error) {
      next(error)
    }
  }

  async handleCandidatePremium(req: Request, res: Response, next: NextFunction) {
    try {
      const candidateId = req.candidateId
      if(!candidateId) throw new AppError("Candidate Id not found", 400)
      const isPremium = await this.candidateCase.isCandidatePremium(candidateId)
      if(isPremium){
        return res.status(200).json({success: true, message: "Candidate is a premium candidate"})
      }
      throw new AppError("Candidate is not premium", 404)
    } catch (error) {
      next(error)
    }
  }
}   


export default CandidateController