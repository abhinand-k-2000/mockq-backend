import JwtToken from "../../infrastructure/utils/JwtToken";
import CandidateUseCase from "../../use-cases/candidateUseCase";
import { Request, Response } from "express";


class CandidateController {
  constructor(private candidateCase: CandidateUseCase) {}

  async verifyCadidateEmail(req: Request, res: Response) {
    try {
      const { name, email } = req.body;
      const candidateInfo = req.body;
      
      const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
      const nameRegex = /^[a-zA-Z ]{2,30}$/;

      if (!email?.trim()) {
        return res.status(400).json({ success: false, message: "Email is required" });
      } 
      
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
      }
  
      if (!name?.trim()) {
        return res.status(400).json({ success: false, message: "Name is required" });
      } 
      
      if (!nameRegex.test(name)) {
        return res.status(400).json({ success: false, message: "Invalid name format" });
      }
      const response = await this.candidateCase.findCandidate(candidateInfo);

      if (response?.status === 200) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }
      
      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({ success: true, token });
      }
  
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }  

  async resendOtp(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1] as string;
      if(!token) return res.status(401).json({success: false, message: "Unauthorised user"})

      const candidateInfo = await this.candidateCase.getCandidateInfoUsingToken(token);
      if(!candidateInfo){
        return res.status(400).json({success: false, message: "No user found"})
      }

      const response = await this.candidateCase.findCandidate(candidateInfo)
      if (response?.status === 200) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }
      
      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({ success: true, token });
      }

    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }


  async verifyOtp(req: Request, res: Response) {
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
      console.log(error)
      res.status(500).json({ message: "Internal server error" });
    }
  }



  async verifyLogin(req: Request, res: Response) {
    try {
      const {email, password} = req.body
      const candidate = await this.candidateCase.candidateLogin(email, password)
      console.log("canidi: ", candidate)
      if(candidate?.success) {

        res.cookie('candidateToken', candidate.data?.token, {
          expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
          httpOnly: true
        })

        res.status(200).json(candidate)
      }else {
        console.log(candidate)
        res.status(400).json({success: false, message: candidate?.message})
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({success: false, message: "Internal server error"})
    }
  }


   logout(req: Request, res: Response) {
    try {
      res.cookie("candidateToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
    }
  }

  async home (req: Request, res: Response) {
    try {
      const stacksList = await this.candidateCase.getAllStacks()
      console.log(stacksList)
      return res.status(200).json({success: true, data: {stacks: stacksList}})
    } catch (error) {
      res.status(500).json({success: false, message: "Internal server error"})
    }
  }


}   


export default CandidateController