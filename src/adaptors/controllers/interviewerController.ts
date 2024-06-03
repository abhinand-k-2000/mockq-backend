import { Response, Request } from "express";
import InterviewerUseCase from "../../use-cases/interviewerUseCase";
import path from "path";
import fs from "fs"

// interface RequestModified extends Request {
//     interviewerId?: string
// }

class InterviewerController {
    constructor(
        private interviewerCase: InterviewerUseCase
    ){}

    async verifyInterviewerEmail(req: Request, res: Response) {
        try {
            const {name, email} = req.body;
            const interviewerInfo = req.body;

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

            const response = await this.interviewerCase.findInterviewer(interviewerInfo);
            if (response?.status === 200) {
                return res.status(400).json({ success: false, message: "User already exists" });
              }
              
              if (response?.status === 201) {
                const token = response.data;
                return res.status(201).json({ success: true, data: token });
              }

        } catch (error) {
            console.log(error)
            res.status(500).json({success: false, message: "Internal server error"})
        }
    }

    async resendOtp (req: Request, res: Response) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if(!token) return res.status(401).json({success: false, message: "Unauthorised user"})
            
            const interviewerInfo = await this.interviewerCase.getInterviewerInfoUsingToken(token);
            if(!interviewerInfo) return res.status(400).json({success: false, message: "No user found"})
            
            const response = await this.interviewerCase.findInterviewer(interviewerInfo)
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
            const token = req.headers.authorization?.split(' ')[1] as string;
            const {otp} = req.body

            const saveInterviewer = await this.interviewerCase.saveInterviewer(token, otp)

            if(saveInterviewer.success) {
                const {token} = saveInterviewer.data 
                res.cookie("interviewerToken", token)
                return res.status(201).json({success: true, data: {token}, message: "OTP veified"})
            } else {
                res.status(400).json({success: false, message: "OTP not verified"})
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({success: false, message: "Internal server error"})
        }
    }

    async verifyLogin (req: Request, res: Response) {
        try {
            const {email, password} = req.body;

            const interviewer = await this.interviewerCase.interviewerLogin(email, password)
            if(interviewer.success){
                res.cookie('interviewerToken', interviewer.data?.token, {
                    expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
                    httpOnly: true,   
                })
                res.status(200).json(interviewer)
            }else {
                res.status(400).json({success: false, message: interviewer?.message})
            }
        } catch (error) { 
            console.log(error)
            res.status(500).json({success: false, message: "Internal server error"})
        }
    }

    async verifyDetails(req: Request, res: Response) {
        try {
            const {yearsOfExperience, currentDesignation, organisation, collegeUniversity, introduction} = req.body
            const { profilePicture, salarySlip, resume } = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (!profilePicture || !salarySlip || !resume) {
                return res.status(400).json({ success: false, message: "All files must be uploaded" });
            }

            const interviewerDetails = {
                ...req.body,
                ...req.files,
                _id: req.interviewerId
            }

            
            const interviewerId = req.interviewerId
            const updatedInterviewer  = await this.interviewerCase.saveInterviewerDetails(interviewerDetails)


            
            if (updatedInterviewer.success) {

                // TO REMOVE FILES FROM SERVER
                [profilePicture, salarySlip, resume].forEach((files) => {
                    files.forEach(file => {
                        const filePath = path.join(__dirname, '../../infrastructure/public/images', file.filename);
                        fs.unlink(filePath, (err)=> {
                            if(err){
                                console.log("Error deleting the file from server", err)
                            }
                        })
                    })
                })

                return res.status(200).json({ success: true, message: "Interviewer details verified successfully", data: updatedInterviewer });
            } else {
                return res.status(404).json({ success: false, message: "Interviewer not found or unable to update details" });
            }


        } catch (error) {
            console.log(error)
            res.status(500).json({success: false, message: "Internal server error"})
        }
    }


    async logout(req: Request, res: Response){
        try {
            res.cookie("interviewerToken", "", {
              httpOnly: true,
              expires: new Date(0),
            });
            res.status(200).json({ success: true });
          } catch (error) {
            console.log(error);
          }
    }

}



export default InterviewerController 