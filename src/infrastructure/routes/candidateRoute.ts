import express from "express"
const router = express.Router()

import CandidateController from "../../adaptors/controllers/candidateController"
import CandidateUseCase from "../../use-cases/candidateUseCase"
import CandidateRepository from "../repository/candidateRepository"
import OtpGenerate from "../utils/generateOtp"
import JwtToken from "../utils/JwtToken"
import MailService from "../utils/mailService"
import HashPassword from "../utils/hashPassword"
import candidateAuthenticate from "../middlewares/candidateAuth"

const repository = new CandidateRepository()
const otp = new OtpGenerate()
const jwt = new JwtToken(process.env.JWT_SECRET as string)
const mail = new MailService()
const hashPassword = new HashPassword()

const candidateCase = new CandidateUseCase(repository, otp, jwt, mail, hashPassword)
const controller = new CandidateController(candidateCase)

router.post('/verify-email', (req, res, next) => {controller.verifyCadidateEmail(req, res, next)})
router.post('/verify-otp', (req, res, next) => controller.verifyOtp(req, res, next))
router.post('/verify-login', (req, res, next) => controller.verifyLogin(req, res, next))
router.post('/resend-otp', (req, res, next) => controller.resendOtp(req, res, next))
router.post('/logout', (req, res, next) => controller.logout(req, res, next))

router.get('/home',candidateAuthenticate, (req, res, next) => controller.home(req, res, next))

router.get('/get-interviewers', (req, res, next) => controller.getInterviewersByTech(req, res, next))

router.get('/get-interviewer-slots-details/:interviewerId', (req, res, next) => controller.getInterviewerSlotsDetails(req, res, next))

// router.put('/book-slot', (req, res, next) => controller.bookSlot(req, res, next))

router.get('/get-scheduled-interviews', candidateAuthenticate, (req, res, next) => controller.getScheduledInterviewList(req, res, next))

export default router   