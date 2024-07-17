import mongoose, { Model, Schema } from "mongoose";
import Message from "../../domain/entitites/message";

const messageSchema: Schema<Message> = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  {
    timestamps: true,
  }
);


const MessageModel: Model<Message>  = mongoose.model<Message>('Message', messageSchema);
export {MessageModel}