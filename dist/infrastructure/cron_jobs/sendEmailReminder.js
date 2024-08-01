"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const adminUseCase_1 = __importDefault(require("../../use-cases/adminUseCase"));
const adminRepository_1 = __importDefault(require("../repository/adminRepository"));
const JwtToken_1 = __importDefault(require("../utils/JwtToken"));
const mailService_1 = __importDefault(require("../utils/mailService"));
const adminRepo = new adminRepository_1.default();
const jwtToken = new JwtToken_1.default(process.env.JWT_SECRET || "");
const mailService = new mailService_1.default();
const adminUseCase = new adminUseCase_1.default(adminRepo, jwtToken, mailService);
node_cron_1.default.schedule('* * * * *', async () => {
    try {
        await adminUseCase.execute();
    }
    catch (error) {
        console.log('Error executing send email remider use case', error);
    }
});
