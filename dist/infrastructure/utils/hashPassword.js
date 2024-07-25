"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class HashPassword {
    async hash(password) {
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        return hashedPassword;
    }
    async compare(password, hashedPassword) {
        const passwordMatch = await bcryptjs_1.default.compare(password, hashedPassword);
        return passwordMatch;
    }
}
exports.default = HashPassword;
