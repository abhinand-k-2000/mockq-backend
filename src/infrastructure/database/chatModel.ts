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
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate"
        }
    ],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"

    }
}, {
    timestamps: true
})



const Chat: Model<Chat> = mongoose.model('Chat', chatSchema);

export {Chat}