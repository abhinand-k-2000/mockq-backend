"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JwtToken_1 = __importDefault(require("../utils/JwtToken"));
const interviewerRepository_1 = __importDefault(require("../repository/interviewerRepository"));
const jwt = new JwtToken_1.default(process.env.JWT_SECRET);
const interviewerRepository = new interviewerRepository_1.default();
const interviewerAuth = async (req, res, next) => {
    let token = req.cookies.interviewerToken;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized, No token provided" });
    }
    try {
        const decodedToken = jwt.verifyJwtToken(token);
        if (decodedToken && decodedToken.role !== "interviewer") {
            return res.status(401).send({ success: false, message: "Unauthorized - Invalid Token" });
        }
        if (decodedToken && decodedToken.id) {
            const interviewer = await interviewerRepository.findInterviewerById(decodedToken.id);
            if (interviewer?.isBlocked) {
                return res.status(401).send({ success: false, message: "You are blocked!" });
            }
            req.interviewerId = interviewer?._id;
            next();
        }
        else {
            return res.status(401).send({ success: false, message: "Unauthorized - Invalid Token" });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(401).send({ success: false, message: "Unauthorized - Invalid token" });
    }
};
exports.default = interviewerAuth;
