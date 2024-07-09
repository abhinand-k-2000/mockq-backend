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
import FileStorageService from "../utils/fileStorageService";


const otp = new OtpGenerate()
const hash = new HashPassword()
const jwt = new JwtToken(process.env.JWT_SECRET as string)
const mail = new MailService()
const fileStorage = new FileStorageService()

const respository = new InterviewerRepository()
const interviewerCase = new InterviewerUseCase(respository, otp, jwt, mail, hash, fileStorage)
const controller = new InterviewerController(interviewerCase)



router.post('/verify-email', (req, res, next) => controller.verifyInterviewerEmail(req, res, next))
router.post('/verify-otp', (req, res, next) => controller.verifyOtp(req, res, next))
router.post('/verify-login', (req, res, next) => controller.verifyLogin(req, res, next))  
router.post('/resend-otp', (req, res, next) => controller.resendOtp(req, res, next))

router.post('/logout', (req, res, next) => controller.logout(req, res, next))

    
// The route to handle the upload of multiple files
router.post('/verify-details', authenticate, uploadStorage.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'salarySlip', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]), (req, res, next) => controller.verifyDetails(req, res, next));

router.get('/home', authenticate, (req, res, next) => controller.getInterviewerProfile(req, res, next))

router.post('/add-slot', authenticate, (req, res, next) => controller.addInterviewSlot(req, res, next))

router.get('/get-slots', authenticate, (req, res, next) => controller.getInterviewSlots(req, res, next))

router.get('/get-domains', authenticate, (req, res, next) => controller.getDomains(req, res, next))

router.post('/forgot-password', (req, res, next) => controller.handleForgotPassword(req, res, next))


router.post('/reset-password', (req, res, next) => controller.resetPassword(req, res, next))

router.get('/get-scheduled-interviews', authenticate, (req, res, next) => controller.getScheduledInterviews(req, res, next))

router.get('/get-details', authenticate, (req, res, next) => controller.getDetails(req, res, next))

router.get('/get-scheduled-interview-by-id', authenticate, (req, res, next) => controller.getScheduledInterviewById(req, res, next))

router.post('/give-feedback', authenticate, (req, res,next) => controller.saveFeedbackDetails(req, res, next))




    





    
export default router   