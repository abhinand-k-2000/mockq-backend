import nodemailer from "nodemailer";
import IMailService from "../../interface/utils/IMailService";

class MailService implements IMailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendMail(name: string, email: string, otp: string): Promise<void> {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: black">
        <h2 style="color: #007bff;">Dear ${name},</h2>
        <p>To ensure the security of your account, we've generated a One-Time Password (OTP) for you to complete your registration or login process.</p>
        <p style="font-size: 1.2em; font-weight: bold;">Your OTP is: 
          <span style="color: #007bff;">${otp}</span>
        </p>
        <p>Please use this OTP within the next 5 minutes to complete your action. If you did not initiate this request or need any assistance, please contact our support team immediately.</p>
        <p>Thank you for trusting <strong>MockQ</strong>. We look forward to serving you!</p>
        <p>Best regards,<br/><strong>MockQ</strong></p>
        <div style="margin-top: 20px; border-top: 1px solid #eaeaea; padding-top: 10px;">
          <p style="font-size: 0.9em; color: #777;">This email was sent to ${email}. If you did not request this email, please ignore it.</p>
        </div>
      </div>
    `;

    const info = await this.transporter.sendMail({
      from: process.env.MAIL,
      to: email,
      subject: "MockQ Verification Code ✔", // Subject line
      text: emailContent,
      html: emailContent, // html body
    });
  }


  async sendInterviewRemainder(name: string, email: string, startTime: Date): Promise<void> {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: black">
        <h2 style="color: #007bff;">Dear ${name},</h2>
        <p>This is a reminder that your interview is scheduled to start at ${startTime.toLocaleTimeString()}.</p>
        <p>Please ensure you are prepared and ready at the scheduled time. We wish you the best of luck!</p>
        <p>Thank you for using <strong>MockQ</strong>. We look forward to assisting you with your interview preparation!</p>
        <p>Best regards,<br/><strong>MockQ</strong></p>
        <div style="margin-top: 20px; border-top: 1px solid #eaeaea; padding-top: 10px;">
          <p style="font-size: 0.9em; color: #777;">This email was sent to ${email}. If you did not request this email, please ignore it.</p>
        </div>
      </div>
    `;
    const info = await this.transporter.sendMail({
      from: process.env.MAIL,
      to: email,
      subject: "MockQ Interview Reminder ✔",
      text: emailContent,
      html: emailContent
    })
  }

}

export default MailService;
