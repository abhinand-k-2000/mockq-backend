import IOtp from "../../use-cases/interface/IOtp";

class OtpGenerate implements IOtp {
  generateOtp(): string {
    var digits = "0123456789";

    var otpLength = 4;

    var otp = "";

    for (let i = 1; i <= otpLength; i++) {
      var index = Math.floor(Math.random() * digits.length);

      otp = otp + digits[index];
    }

    return otp;
  }
}

export default OtpGenerate