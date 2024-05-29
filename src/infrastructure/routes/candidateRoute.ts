import express from "express"
const router = express.Router()

import CandidateController from "../../adaptors/controllers/candidateController"
import CandidateUseCase from "../../use-cases/candidateUseCase"
import CandidateRepository from "../repository/candidateRepository"
import OtpGenerate from "../utils/generateOtp"
import JwtToken from "../utils/JwtToken"
import MailService from "../utils/mailService"
import HashPassword from "../utils/hashPassword"

const repository = new CandidateRepository()
const otp = new OtpGenerate()
const jwt = new JwtToken(process.env.JWT_SECRET as string)
const mail = new MailService()
const hashPassword = new HashPassword

const candidateCase = new CandidateUseCase(repository, otp, jwt, mail, hashPassword)
const controller = new CandidateController(candidateCase)

router.post('/verify-email', (req, res) => {controller.verifyCadidateEmail(req, res)})
router.post('/verify-otp', (req, res) => controller.verifyOtp(req, res))
router.post('/verify-login', (req, res) => controller.verifyLogin(req, res))
router.post('/resend-otp', (req, res) => controller.resendOtp(req, res))




export default router   