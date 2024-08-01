
interface IMailService{
    sendMail(name: string, email: string, otp: string): Promise<void> 
    sendInterviewRemainder(name: string, email: string, startTime: Date): Promise<void> 

}

export default IMailService