import Candidate from "../domain/entitites/candidate";
import JwtToken from "../infrastructure/utils/JwtToken";
import OtpGenerate from "../infrastructure/utils/generateOtp";
import MailService from "../infrastructure/utils/mailService";
import ICandidateRepository from "./interface/ICandidateRepository";
import HashPassword from "../infrastructure/utils/hashPassword";

class CandidateUseCase {
  constructor(
    private iCandidateRepository: ICandidateRepository,
    private otpGenerate: OtpGenerate,
    private jwtToken: JwtToken,
    private mailService: MailService,
    private hashPassword: HashPassword
  ) {}

  async findCandidate(candidateInfo: Candidate) {
    try {
      const candidateFound = await this.iCandidateRepository.findByEmail(
        candidateInfo.email
      );
      if (candidateFound) {
        return {
          status: 200,
          data: candidateFound,
          message: "Candidate found",
        };
      } else {
        const otp: string = this.otpGenerate.generateOtp();
        console.log("OTP: ", otp);
        const token = this.jwtToken.otpToken(candidateInfo, otp);
        const { name, email } = candidateInfo;
        await this.mailService.sendMail(name, email, otp);
        return { status: 201, data: token, message: "OTP generated and sent" };
      }
    } catch (error) {
      console.log(error);
    }
  }


  async getCandidateInfoUsingToken(token: string) {
    try {
      const decodedToken = this.jwtToken.verifyJwtToken(token);
      if(!decodedToken) {
        throw new Error("Invalid Token")
      }
      return decodedToken.info
    } catch (error) {
      return null
    }
  }

  async saveCandidate(token: string, otp: string) {
    try {
      let decodedToken = this.jwtToken.verifyJwtToken(token);

      if (!decodedToken) {
        throw new Error("Invalid Token");
      }

      if (otp !== decodedToken.otp) {
        throw new Error("Invalid OTP");
      }

      const { password } = decodedToken.info;
      const hashedPassword = await this.hashPassword.hash(password);
      decodedToken.info.password = hashedPassword;

      const candidateSave = await this.iCandidateRepository.saveCandidate(
        decodedToken.info
      );

      if (!candidateSave) {
        throw new Error("Failed to save candidate");
      }

      let newToken = this.jwtToken.createJwtToken(
        candidateSave._id as string,
        "candidate"
      );
      return { success: true, token: newToken };
    } catch (error) {
      console.log(error);
      return { success: false, error: (error as Error).message };
    }
  }

  async candidateLogin(email: string, password: string) {
    try {
      const candidateFound = await this.iCandidateRepository.findByEmail(email);

      if (!candidateFound)
        return { success: false, message: "User not found!" };

      const passwordMatch = await this.hashPassword.compare(password,candidateFound.password);

      if (!passwordMatch) {
        return { success: false, message: "Wrong password" };
      }
      return { success: true, message: "candidate found" };
    } catch (error) {
      console.log(error);
      return {success: false, message: "An error occured during login"}
    }
  }
}

export default CandidateUseCase;
