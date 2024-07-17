import mongoose from 'mongoose'

interface Chat {
    chatName: string;
    isGroupChat: boolean;
    users: mongoose.Schema.Types.ObjectId[];
    latestMessage: mongoose.Schema.Types.ObjectId;
    groupAdmin: mongoose.Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export default Chat