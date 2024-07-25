"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OtpGenerate {
    generateOtp() {
        const digits = "0123456789";
        const otpLength = 4;
        let otp = "";
        for (let i = 1; i <= otpLength; i++) {
            const index = Math.floor(Math.random() * digits.length);
            otp = otp + digits[index];
        }
        return otp;
    }
}
exports.default = OtpGenerate;
