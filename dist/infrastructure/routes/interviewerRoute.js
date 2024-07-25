"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const interviewerController_1 = __importDefault(require("../../adaptors/controllers/interviewerController"));
const interviewerRepository_1 = __importDefault(require("../repository/interviewerRepository"));
const interviewerUseCase_1 = __importDefault(require("../../use-cases/interviewerUseCase"));
const generateOtp_1 = __importDefault(require("../utils/generateOtp"));
const mailService_1 = __importDefault(require("../utils/mailService"));
const JwtToken_1 = __importDefault(require("../utils/JwtToken"));
const hashPassword_1 = __importDefault(require("../utils/hashPassword"));
const multer_1 = require("../middlewares/multer");
const interviewerAuth_1 = __importDefault(require("../middlewares/interviewerAuth"));
const fileStorageService_1 = __importDefault(require("../utils/fileStorageService"));
const otp = new generateOtp_1.default();
const hash = new hashPassword_1.default();
const jwt = new JwtToken_1.default(process.env.JWT_SECRET);
const mail = new mailService_1.default();
const fileStorage = new fileStorageService_1.default();
const respository = new interviewerRepository_1.default();
const interviewerCase = new interviewerUseCase_1.default(respository, otp, jwt, mail, hash, fileStorage);
const controller = new interviewerController_1.default(interviewerCase);
router.post('/verify-email', (req, res, next) => controller.verifyInterviewerEmail(req, res, next));
router.post('/verify-otp', (req, res, next) => controller.verifyOtp(req, res, next));
router.post('/verify-login', (req, res, next) => controller.verifyLogin(req, res, next));
router.post('/resend-otp', (req, res, next) => controller.resendOtp(req, res, next));
router.post('/logout', (req, res, next) => controller.logout(req, res, next));
// The route to handle the upload of multiple files
router.post('/verify-details', interviewerAuth_1.default, multer_1.uploadStorage.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'salarySlip', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]), (req, res, next) => controller.verifyDetails(req, res, next));
router.get('/home', interviewerAuth_1.default, (req, res, next) => controller.getInterviewerProfile(req, res, next));
router.post('/add-slot', interviewerAuth_1.default, (req, res, next) => controller.addInterviewSlot(req, res, next));
router.get('/get-slots', interviewerAuth_1.default, (req, res, next) => controller.getInterviewSlots(req, res, next));
router.get('/get-domains', interviewerAuth_1.default, (req, res, next) => controller.getDomains(req, res, next));
router.post('/forgot-password', (req, res, next) => controller.handleForgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => controller.resetPassword(req, res, next));
router.get('/get-scheduled-interviews', interviewerAuth_1.default, (req, res, next) => controller.getScheduledInterviews(req, res, next));
router.get('/get-details', interviewerAuth_1.default, (req, res, next) => controller.getDetails(req, res, next));
router.get('/get-scheduled-interview-by-id', interviewerAuth_1.default, (req, res, next) => controller.getScheduledInterviewById(req, res, next));
router.post('/give-feedback', interviewerAuth_1.default, (req, res, next) => controller.saveFeedbackDetails(req, res, next));
router.get('/get-payment-dashboard', interviewerAuth_1.default, (req, res, next) => controller.getPaymentDashboard(req, res, next));
router.post('/verify-video-conference', interviewerAuth_1.default, (req, res, next) => controller.verifyVideoConference(req, res, next));
exports.default = router;
