import mongoose, {Schema, Model} from "mongoose";
import Candidate from "../../domain/entitites/candidate";

const candidateSchema: Schema<Candidate> = new Schema({
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
    }

})

const CandidateModel: Model<Candidate> = mongoose.model("Candidate", candidateSchema)
export {CandidateModel}