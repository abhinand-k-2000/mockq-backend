import mongoose, {Schema, Model} from 'mongoose'
import Feedback from '../../domain/entitites/feedBack'


const feedBackSchema: Schema<Feedback> = new Schema({
    interviewId: {
        type: String,
        required: true
    },
    interviewerId: {
        type: String,
        required: true
    },
    candidateId: {
        type: String,
        required: true
    },
    technicalSkills: {
        type: String,
        required: true
    },
    communicationSkills: {
        type: String,
        required: true
    },
    problemSolvingSkills: {
        type: String,
        required: true
    },
    strength: {
        type: String, required: true
    },
    areaOfImprovement: {
        type: String, required: true
    },
    additionalComments: {
        type: String, required: true
    }
}) 


const FeedBackModel: Model<Feedback> = mongoose.model("Feedback", feedBackSchema)
export {FeedBackModel}