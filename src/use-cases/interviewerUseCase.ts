import {InterviewerProfile, InterviewerRegistration} from "../domain/entitites/interviewer";
import IInterviewerRepository from "./interface/IInterviewerRepository";
import OtpGenerate from "../infrastructure/utils/generateOtp";
import JwtToken from "../infrastructure/utils/JwtToken";
import MailService from "../infrastructure/utils/mailService";
import HashPassword from "../infrastructure/utils/hashPassword";
import s3 from "../infrastructure/config/awsConfig"
import fs from "fs"

class InterviewerUseCase {
    constructor(
        private iInterviewerRepository: IInterviewerRepository,
        private otpGenerate: OtpGenerate,
        private jwtToken: JwtToken,
        private mailService: MailService,
        private hashPassword: HashPassword
    ){}

    async findInterviewer(interviewerInfo: InterviewerProfile) {
        try {
            const {email, name} = interviewerInfo
            const interviewerFound = await this.iInterviewerRepository.findByEmail(email)
            if(interviewerFound){
                return {status:200, data: interviewerFound, message: "Interviewer Found"}
            }
            const otp = this.otpGenerate.generateOtp();
            console.log("Interviewer Signup OTP: ", otp);
            const token = this.jwtToken.otpToken(interviewerInfo, otp);
            await this.mailService.sendMail(name, email, otp);
            return {status: 201, data: token, message: "OTP generated"}

        } catch (error) {
            console.log(error)
        }
    }

    async getInterviewerInfoUsingToken(token: string) {
        try {
            const decodedToken = this.jwtToken.verifyJwtToken(token);
            if(!decodedToken) throw new Error("Invalid Token");
            return decodedToken.info
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async saveInterviewer(token: string, otp: string){
        try {
            let decodedToken = this.jwtToken.verifyJwtToken(token);

            if(!decodedToken) throw new Error("Invalid token")

            if(otp !== decodedToken.otp) throw new Error ("Invalid OTP");

            const {password} = decodedToken.info;

            const hashedPassword = await this.hashPassword.hash(password)
            decodedToken.info.password = hashedPassword;

            const interviewerSave = await this.iInterviewerRepository.saveInterviewer(decodedToken.info)

            if(!interviewerSave) throw new Error("Failed to save interviewer")

            const newToken = this.jwtToken.createJwtToken(interviewerSave._id as string, "interviewer");

            return {success: true, data: {token: newToken}}
        } catch (error) {
            throw new Error(`Failed to save interviewer: ${(error as Error).message}`);
        }
    }


    async interviewerLogin(email: string, password: string) {
        try {
            const interviewerFound = await this.iInterviewerRepository.findByEmail(email);

            if(!interviewerFound) {
                return {success: false, message: "Interviewer not found!"}
            }   

            const passwordMatch = await this.hashPassword.compare(password, interviewerFound.password);
            if(!passwordMatch) {
                return {success: false, message: "Wrong password"}
            }

            if(interviewerFound.isBlocked){
                return {success: false, message: "You are blocked by admin"}
            }
            
            let token = this.jwtToken.createJwtToken(interviewerFound._id, "interviewer")


            return {success: true, data: {token: token, hasCompletedDetails: interviewerFound.hasCompletedDetails},  message: "Interviewer found"}
        } catch (error) {
            console.log(error);
            return {success: false, message: "An error occured during interviewer login"}
        }
    }

    async saveInterviewerDetails(interviewerDetails: InterviewerRegistration){
        try {
            const {_id, profilePicture, salarySlip, resume } = interviewerDetails

            const interviewer = await this.iInterviewerRepository.findInterviewerById(_id); 
            if(!interviewer){
                return {success: false, message: "Interviewer not found!"}
            }

            const uploadFileToS3 = async (file: any, keyPrefix: string) => {
                const params = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: `${keyPrefix}/${Date.now()}-${file[0].originalname}`,
                    Body: fs.createReadStream(file[0].path),
                    ContentType: file[0].mimetype,
                    ACL: 'public-read',
                };
                const data = await s3.upload(params).promise();
                return data.Location;
            }; 
            
            const profilePictureUrl = await uploadFileToS3(profilePicture, 'profilePictures');
            const salarySlipUrl = await uploadFileToS3(salarySlip, 'salarySlips');
            const resumeUrl = await uploadFileToS3(resume, 'resumes');

            interviewerDetails.profilePicture = profilePictureUrl
            interviewerDetails.salarySlip = salarySlipUrl;
            interviewerDetails.resume = resumeUrl
            interviewerDetails.hasCompletedDetails = true

            const updatedInterviewer = await this.iInterviewerRepository.saveInterviewerDetails(interviewerDetails);

            if(updatedInterviewer){
                return { success: true, message: "Interviewer details updated successfully!", data: updatedInterviewer };
            } else {
                return { success: false, message: "Failed to update interviewer details" };
            }

        } catch (error) {
           console.log("Error uploading to S3:", error);
            return { success: false, message: "Internal server error" };
        }
    }
}

export default InterviewerUseCase