import { Request, Response } from "express";
import AdminUseCase from "../../use-cases/adminUseCase";



class AdminController {
   private adminCase: AdminUseCase;

    constructor(adminCase: AdminUseCase){
        this.adminCase = adminCase
    }

    async login(req: Request, res: Response){
        try {
            const {email, password} = req.body
            const admin = await this.adminCase.adminLogin(email, password)

            if(admin?.success){
                const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
                res.cookie('adminToken', admin.token, {
                    expires: expiryDate,
                    httpOnly: true
                })  
                return res.status(200).json(admin)
            } 
            return res.status(404).json(admin)
        } catch (error) {
            console.log(error)
            return res.status(500).json({success: false, message: "Internal Server Error"})
        }
    }


    async logout(req: Request, res: Response) {
        try {
            res.cookie("adminToken", "", {
              httpOnly: true,
              expires: new Date(0),
            });
            res.status(200).json({ success: true });
          } catch (error) {
            console.log(error);
          }
    }

    async createAdmin(req: Request, res: Response){
        try {
            const {name, email, password} = req.body
            const admin = await this.adminCase.createAdmin(name, email, password);
            if(admin?.success){
                return res.status(201).json(admin)
            }
            return res.status(400).json(admin)
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    async getAllCandidates(req: Request, res: Response) {
        try {
            const candidatesList = await this.adminCase.getAllCandidates()
            return res.status(200).json({ success: true, data: candidatesList, message: "Candidates list fetched" });
            
        } catch (error) {
            console.error("Error fetching candidates:", error);
            return res.status(500).json({ success: false, message: "Failed to fetch candidates" });
        }
    }

    async getAllInterviewers(req: Request, res: Response) {
        try {
            const interviewersList = await this.adminCase.getAllInterviewers()
            return res.status(200).json({success: true, data: interviewersList, message: "Interviewers list fetched"})
        } catch (error) {
            console.log("Error fetching interviewrs", error)
            return res.status(500).json({success: false, message: "Failed to fetch interviewers"})
        }
    }

    async getInterviewerDetails(req: Request, res: Response) {
        try {
            const {id} = req.params
            const interviewerDetails = await this.adminCase.interviewerDetails(id)
            return res.status(200).json({success: true, data: interviewerDetails, message: "Interviewer details fetched"})

        } catch (error) {
            console.log("Error fetching interviwer details ", error);
            return res.status(500).json({success: false, message: "Failed to fetch interview details"})
        }
    }

    async blockCandidate(req: Request, res: Response) {
        try {
            const {id} = req.params
            const candidateBlocked = await this.adminCase.blockCandidate(id)
            if(candidateBlocked){
                res.status(200).json({success: true})
            }
        } catch (error) {
            console.log("Error in blocking the candidate")
        }
    }

    async approveInterviewer(req: Request, res: Response) {
        try {
            const {id} = req.params
            const interviewerAppproved = await this.adminCase.approveInterviewer(id);
            if(interviewerAppproved){
                res.status(200).json({success: true, message: "Interviewer approved"})
            } else {
                res.status(400).json({ success: false, message: "Failed to approve interviewer" });
            }

        } catch (error) {
            console.log("Error in approving interviewer")
            return res.status(500).json({success: false, message: "Failed to approve interviewer"})
        }
    }

    async addStack(req: Request, res: Response) {
        try {
            const {stackName, technologies} = req.body;

            if(!stackName.trim()){
                return res.status(400).json({success: false, message: "Stack name should not be empty"})
            }
            if(technologies.length === 0){
                return res.status(400).json({success: false, message: "No technologies added"})
            }

            const stackAdded = await this.adminCase.addStack(stackName, technologies)
            if(stackAdded?.success){
                return res.status(201).json(stackAdded)
            }
            return res.status(400).json(stackAdded)
        } catch (error) {
            console.error('Error adding stack:', error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getAllStacks(req: Request, res: Response) {
        try {
            const stacksList = await this.adminCase.getAllStacks()
            return res.status(200).json({success: true, data: stacksList, message: "Stacks list fetched"})
        } catch (error) {
            return res.status(500).json({success: false, message: "Failed to fetch stacks"})
        }
    }

    async unlistStack(req: Request, res: Response) {
        try {
            const {id} =  req.params
            const unlistStack = await this.adminCase.unlistStack(id)
            if(unlistStack){
                return res.status(200).json({success: true, data: unlistStack})
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({success: false, message: "Internal server error"})
        }
    }
}


export default AdminController;