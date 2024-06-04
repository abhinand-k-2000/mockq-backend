import mongoose, {Model, Schema} from "mongoose";
import Stack from "../../domain/entitites/stack";

const stackSchema: Schema<Stack> = new Schema({
    
    stackName: {
        type: String,
        required: true
    },
    technologies: {
        type: [String],
        required: true
    }, 
    isListed: {
        type: Boolean,
        default: true
    }
})

const StackModel: Model<Stack> = mongoose.model("Stack", stackSchema)

export {StackModel}  