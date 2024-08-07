import mongoose, {Schema, Model} from "mongoose";
import Candidate from "../../domain/entitites/candidate";


const candidateSchema: Schema<Candidate> = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: String
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    subscriptionType: {
        type: String,
        default: 'free'
    },
    subscriptionExpiry: {
        type: Date
    }


})

const CandidateModel: Model<Candidate> = mongoose.model("Candidate", candidateSchema)

export {CandidateModel}