import express from "express";
const router = express.Router();

import InterviewerController from "../../adaptors/controllers/interviewerController";
import InterviewerRepository from "../repository/interviewerRepository";
import InterviewerUseCase from "../../use-cases/interviewerUseCase";
import OtpGenerate from "../utils/generateOtp";
import MailService from "../utils/mailService";
import JwtToken from "../utils/JwtToken";
import HashPassword from "../utils/hashPassword";
import { uploadStorage } from "../middlewares/multer";
import authenticate from "../middlewares/interviewerAuth"


const otp = new OtpGenerate()
const hash = new HashPassword()
const jwt = new JwtToken(process.env.JWT_SECRET as string)
const mail = new MailService()

const respository = new InterviewerRepository()
const interviewerCase = new InterviewerUseCase(respository, otp, jwt, mail, hash)
const controller = new InterviewerController(interviewerCase)



router.post('/verify-email', (req, res) => controller.verifyInterviewerEmail(req, res))
router.post('/verify-otp', (req, res) => controller.verifyOtp(req, res))
router.post('/verify-login', (req, res) => controller.verifyLogin(req, res))  
router.post('/resend-otp', (req, res) => controller.resendOtp(req, res))

router.post('/logout', (req, res) => controller.logout(req, res))

    
// The route to handle the upload of multiple files
router.post('/verify-details', authenticate, uploadStorage.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'salarySlip', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]), (req, res) => controller.verifyDetails(req, res));


export default router