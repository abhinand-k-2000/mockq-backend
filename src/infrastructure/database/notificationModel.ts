import mongoose, {Model, mongo, Schema} from "mongoose"
import Notification from "../../domain/entitites/notification"

const notificationScheme = new Schema({
    userId: {
        type: String,
        required: true
    },
    heading: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean
    },
    feedbackId: {
        type: String
    }
},{
    timestamps: true
})


const NotificationModel: Model<Notification> = mongoose.model<Notification>("Notification", notificationScheme)
export {NotificationModel}