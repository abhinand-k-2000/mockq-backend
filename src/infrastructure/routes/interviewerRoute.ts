import express from "express";
const router = express.Router();

import InterviewerController from "../../adaptors/controllers/interviewerController";
import InterviewerRepository from "../repository/interviewerRepository";
import InterviewerUseCase from "../../use-cases/interviewerUseCase";
import OtpGenerate from "../utils/generateOtp";
import MailService from "../utils/mailService";
import JwtToken from "../utils/JwtToken";
import HashPassword from "../utils/hashPassword";

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
    


export default router