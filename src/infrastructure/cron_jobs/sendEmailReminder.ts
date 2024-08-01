import cron from "node-cron";
import AdminUseCase from "../../use-cases/adminUseCase";
import AdminRepository from "../repository/adminRepository";
import JwtToken from "../utils/JwtToken";
import MailService from "../utils/mailService";

const adminRepo = new AdminRepository()
const jwtToken = new JwtToken(process.env.JWT_SECRET || "")
const mailService = new MailService()
const adminUseCase = new AdminUseCase(adminRepo, jwtToken, mailService)


cron.schedule('* * * * *', async () => {
    try {
        await adminUseCase.execute()
    } catch (error) {
        console.log('Error executing send email remider use case', error)
    }
})