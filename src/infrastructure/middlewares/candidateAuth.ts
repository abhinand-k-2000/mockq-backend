import { Request, Response, NextFunction, RequestHandler } from "express"
import JwtToken from "../utils/JwtToken"
import CandidateRepository from "../repository/candidateRepository"


const jwt = new JwtToken(process.env.JWT_SECRET as string)
const candidateRepository = new CandidateRepository

// interface RequestModified extends Request {
//     candidateId?: string
// }

// 2 ways to add a property to the Request type

declare global {
    namespace Express {
        interface Request {
            candidateId?: string
        }
    }
}

const candidateAuth = async (req: Request, res: Response, next: NextFunction) => {

    let token = req.cookies.candidateToken

    if(!token){
        return res.status(401).json({success: false, message: "Unauthorized, No token provided"})
    }

    try {
        const decodedToken = jwt.verifyJwtToken(token)
        if(decodedToken && decodedToken.role !== "candidate"){
            return res.status(401).send({success: false, message: "Unauthorized - Invalid Token"})
        }

        if(decodedToken && decodedToken.id){
            const candidate = await candidateRepository.findCandidateById(decodedToken.id)
            if(candidate?.isBlocked){
                res.clearCookie("candidateToken")
                return res.status(403).send({success: false, message: "You are blocked!"})
            }
            req.candidateId = candidate?._id;
            next()
        }else {
            return res.status(401).send({success: false, message: "Unauthorized - Invalid Token"})
        }
    } catch (error) {
        console.log(error);
        return res.status(401).send({ success: false, message: "Unauthorized - Invalid token" })
    }
}

export default candidateAuth 