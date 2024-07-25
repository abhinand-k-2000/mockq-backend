"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtToken {
    constructor(secret) {
        this.secret = secret;
    }
    createJwtToken(id, role) {
        const payload = { id, role };
        const token = jsonwebtoken_1.default.sign(payload, this.secret, { expiresIn: '1d' });
        return token;
    }
    verifyJwtToken(token) {
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, this.secret);
            return decodedToken;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    otpToken(info, otp) {
        try {
            const payload = { info, otp };
            const token = jsonwebtoken_1.default.sign(payload, this.secret, { expiresIn: "5m" });
            return token;
        }
        catch (error) {
            console.log(error);
            throw (error);
        }
    }
}
exports.default = JwtToken;
