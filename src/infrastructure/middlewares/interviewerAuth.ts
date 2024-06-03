import { Request, Response, NextFunction, RequestHandler } from "express"
import JwtToken from "../utils/JwtToken"
import InterviewerRepository from "../repository/interviewerRepository"


const jwt = new JwtToken(process.env.JWT_SECRET as string)
const interviewerRepository = new InterviewerRepository()

interface RequestModified extends Request {
    interviewerId?: string
}

// 2 ways to add a property to the Request type

declare global {
    namespace Express {
        interface Request {
            interviewerId?: string
        }
    }
}

const interviewerAuth = async (req: RequestModified, res: Response, next: NextFunction) => {

    let token = req.cookies.interviewerToken

    if(!token){
        return res.status(401).json({success: false, message: "Unauthorized, No token provided"})
    }

    try {
        const decodedToken = jwt.verifyJwtToken(token)
        if(decodedToken && decodedToken.role !== "interviewer"){
            return res.status(401).send({success: false, message: "Unauthorized - Invalid Token"})
        }

        if(decodedToken && decodedToken.id){
            const interviewer = await interviewerRepository.findInterviewerById(decodedToken.id);
            if(interviewer?.isBlocked){
                return res.status(401).send({success: false, message: "You are blocked!"})
            }
            req.interviewerId = interviewer?._id;
            next()
        }else {
            return res.status(401).send({success: false, message: "Unauthorized - Invalid Token"})
        }
    } catch (error) {
        console.log(error);
        return res.status(401).send({ success: false, message: "Unauthorized - Invalid token" })
    }
}

export default interviewerAuth 