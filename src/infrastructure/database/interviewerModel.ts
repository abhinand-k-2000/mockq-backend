import mongoose, {Model, Schema} from 'mongoose'
import {InterviewerProfile, InterviewerRegistration} from '../../domain/entitites/interviewer'


const interviewerSchema: Schema<InterviewerProfile> = new Schema({
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
        type: Boolean
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
    college: {
        type: String
    },
    profilePhoto: {
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
    }
})

const InterviewerModel: Model<InterviewerProfile> = mongoose.model("Interviewer", interviewerSchema)
export {InterviewerModel}