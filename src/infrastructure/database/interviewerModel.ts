import mongoose, {Model, Schema} from 'mongoose'
import { InterviewerRegistration} from '../../domain/entitites/interviewer'


const interviewerSchema: Schema<InterviewerRegistration> = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    organisation: {
        type: String
    },
    currentDesignation: {
        type: String
    },
    yearsOfExperience: {
        type: String
    },
    collegeUniversity: {
        type: String
    },
    profilePicture: {
        type: String
    },
    salarySlip: {
        type: String
    },
    resume: {
        type: String
    },
    introduction: {
        type: String
    },
    hasCompletedDetails: {
        type: Boolean, 
        default: false
    }
})

const InterviewerModel: Model<InterviewerRegistration> = mongoose.model("Interviewer", interviewerSchema)
export {InterviewerModel}