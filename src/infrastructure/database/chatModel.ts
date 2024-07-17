import mongoose, { Model, Schema } from "mongoose";
import Chat from "../../domain/entitites/chat";

const chatSchema: Schema<Chat> = new Schema({
    chatName: {
        type: String, trim: true
    },
    isGroupChat: {
        type: Boolean, default: false
    },
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: "Candidate"
        }
    ],
    latestMessage: {
        type: Schema.Types.ObjectId,
        ref: "Message"
    },
    groupAdmin: {
        type: Schema.Types.ObjectId,
        ref: "Candidate"

    }
}, {
    timestamps: true
})



const ChatModel: Model<Chat> = mongoose.model('Chat', chatSchema);

export {ChatModel}