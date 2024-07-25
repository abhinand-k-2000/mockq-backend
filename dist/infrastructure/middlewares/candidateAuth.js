"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JwtToken_1 = __importDefault(require("../utils/JwtToken"));
const candidateRepository_1 = __importDefault(require("../repository/candidateRepository"));
const jwt = new JwtToken_1.default(process.env.JWT_SECRET);
const candidateRepository = new candidateRepository_1.default;
const candidateAuth = async (req, res, next) => {
    let token = req.cookies.candidateToken;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized, No token provided" });
    }
    try {
        const decodedToken = jwt.verifyJwtToken(token);
        if (decodedToken && decodedToken.role !== "candidate") {
            return res.status(401).send({ success: false, message: "Unauthorized - Invalid Token" });
        }
        if (decodedToken && decodedToken.id) {
            const candidate = await candidateRepository.findCandidateById(decodedToken.id);
            if (candidate?.isBlocked) {
                return res.status(401).send({ success: false, message: "You are blocked!" });
            }
            req.candidateId = candidate?._id;
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
exports.default = candidateAuth;
