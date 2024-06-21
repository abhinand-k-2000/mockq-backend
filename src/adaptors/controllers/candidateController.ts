import AppError from "../../infrastructure/utils/appError";
import CandidateUseCase from "../../use-cases/candidateUseCase";
import { Request, Response, NextFunction } from "express";


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

}   


export default CandidateController