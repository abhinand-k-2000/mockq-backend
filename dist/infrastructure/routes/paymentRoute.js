"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const paymentController_1 = __importDefault(require("../../adaptors/controllers/paymentController"));
const paymentUseCase_1 = __importDefault(require("../../use-cases/paymentUseCase"));
const stripePayment_1 = __importDefault(require("../utils/stripePayment"));
const paymentRepository_1 = __importDefault(require("../repository/paymentRepository"));
const candidateAuth_1 = __importDefault(require("../middlewares/candidateAuth"));
const walletRepository_1 = __importDefault(require("../repository/walletRepository"));
const stripe = new stripePayment_1.default();
const paymentRepository = new paymentRepository_1.default();
const walletRepository = new walletRepository_1.default();
const useCase = new paymentUseCase_1.default(stripe, paymentRepository, walletRepository);
const controller = new paymentController_1.default(useCase);
router.post('/create-payment', candidateAuth_1.default, (req, res, next) => controller.makePayment(req, res, next));
router.post('/webhook', express_1.default.raw({ type: ['application/json', 'application/json; charset=utf-8'] }), (req, res, next) => controller.handleWebhook(req, res, next));
// router.post('/webhook', (req, res, next) => controller.handleWebhook(req, res, next));
router.post('/create-subscription', (req, res, next) => controller.createSubscription(req, res, next));
exports.default = router;
