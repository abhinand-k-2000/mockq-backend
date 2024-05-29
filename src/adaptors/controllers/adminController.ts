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
}


export default AdminController;