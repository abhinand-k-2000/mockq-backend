"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = __importDefault(require("../../adaptors/controllers/chatController"));
const chatUseCase_1 = __importDefault(require("../../use-cases/chatUseCase"));
const chatRepository_1 = __importDefault(require("../repository/chatRepository"));
const messageRepository_1 = __importDefault(require("../repository/messageRepository"));
const candidateAuth_1 = __importDefault(require("../middlewares/candidateAuth"));
const router = express_1.default.Router();
const chatRepository = new chatRepository_1.default();
const messageRepository = new messageRepository_1.default();
const useCase = new chatUseCase_1.default(messageRepository, chatRepository);
const controller = new chatController_1.default(useCase);
router.post('/', candidateAuth_1.default, (req, res, next) => controller.accessChat(req, res, next));
router.get('/', candidateAuth_1.default, (req, res, next) => controller.fetchChats(req, res, next));
router.post('/group', candidateAuth_1.default, (req, res, next) => controller.createGroupChat(req, res, next));
router.put('/group-add', candidateAuth_1.default, (req, res, next) => controller.addToGroup(req, res, next));
router.put('/group-remove', candidateAuth_1.default, (req, res, next) => controller.removeFromGroup(req, res, next));
router.post('/send-message', candidateAuth_1.default, (req, res, next) => controller.saveMessage(req, res, next));
router.get('/messages/:chatId', candidateAuth_1.default, (req, res, next) => controller.getAllMessages(req, res, next));
exports.default = router;
