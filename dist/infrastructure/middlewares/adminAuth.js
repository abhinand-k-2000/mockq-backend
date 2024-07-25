"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JwtToken_1 = __importDefault(require("../utils/JwtToken"));
const jwt = new JwtToken_1.default(process.env.JWT_SECRET);
const amdinAuth = async (req, res, next) => {
    let token = req.cookies.adminToken;
    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "Unauthorized, No token provided" });
    }
    try {
        const decodedToken = jwt.verifyJwtToken(token);
        if (decodedToken && decodedToken.role !== "admin") {
            return res
                .status(401)
                .send({ success: false, message: "Unauthorized - Invalid token" });
        }
        if (decodedToken && decodedToken.id) {
            req.adminId = decodedToken.id;
            next();
        }
        else {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized - Invalid token" });
        }
    }
    catch (error) {
        console.log(error);
        return res
            .status(401)
            .send({ success: false, message: "Unauthorized - Invalid Token" });
    }
};
exports.default = amdinAuth;
