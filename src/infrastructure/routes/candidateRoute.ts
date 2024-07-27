import express from "express"
const router = express.Router()

import CandidateController from "../../adaptors/controllers/candidateController"
import CandidateUseCase from "../../use-cases/candidateUseCase"
import CandidateRepository from "../repository/candidateRepository"
import NotificationRepository from "../repository/notificationRepository"
import OtpGenerate from "../utils/generateOtp"
import JwtToken from "../utils/JwtToken"
import MailService from "../utils/mailService"
import HashPassword from "../utils/hashPassword"
import candidateAuthenticate from "../middlewares/candidateAuth"

const candidateRepository = new CandidateRepository()
const notificationRepository = new NotificationRepository()
const otp = new OtpGenerate()
const jwt = new JwtToken(process.env.JWT_SECRET as string)
const mail = new MailService()
const hashPassword = new HashPassword()

const candidateCase = new CandidateUseCase(candidateRepository, otp, jwt, mail, hashPassword, notificationRepository)
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

router.post('/forgot-password', (req, res, next) => controller.handleForgotPassword(req, res, next))

router.post('/reset-password', (req, res, next) => controller.resetPassword(req, res, next))

router.get('/get-feedback-details', candidateAuthenticate, (req, res, next) => controller.getFeedbackDetails(req, res, next))

router.get('/is-premium', candidateAuthenticate, (req, res, next) => controller.handleCandidatePremium(req, res, next))

router.get('/get-all-premium-users', candidateAuthenticate, (req, res, next) => controller.getAllPremiumCandidates(req, res, next))

router.post('/give-interviewer-rating', candidateAuthenticate, (req, res, next) => controller.saveInterviewerRating(req, res, next))

router.get('/get-analytics', candidateAuthenticate, (req, res, next) => controller.getCandidateAnalytics(req, res, next))

router.post('/verify-video-conference', candidateAuthenticate, (req, res, next) => controller.verifyVideoConference(req, res, next))

router.get('/get-notifications', candidateAuthenticate, (req, res, next) => controller.getNotifications(req, res, next))


export default router   