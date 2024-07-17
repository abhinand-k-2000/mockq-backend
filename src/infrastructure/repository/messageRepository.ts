import Message from "../../domain/entitites/message";
import IChatRepository from "../../interface/repositories/IChatRepository";
import IMessageRepository from "../../interface/repositories/IMessageRepository";
import { CandidateModel } from "../database/candidateModel";
import { ChatModel } from "../database/chatModel";
import { MessageModel } from "../database/messageModel";


class MessageRepository implements IMessageRepository{

   async saveMessage(newMessage: any): Promise<any> {
        try {
            
        let message: any = await MessageModel.create(newMessage);

        message = await message.populate("sender", "name")
        message = await message.populate("chat")
        message = await CandidateModel.populate(message, {
            path: 'chat.users',
            select: 'name email'
        })

        await ChatModel.findByIdAndUpdate(newMessage.chat, {
            latestMessage: message
        })

        return message as Message
        } catch (error) {
            console.log(error)
        }


    }


    async getAllMessages(chatId: string): Promise<any> {
        try {
            const messages = await MessageModel.find({chat: chatId})
            .populate("sender", 'name email')
            .populate("chat")

            return messages
        } catch (error) {
            console.log(error)
        }
    }
}

export default MessageRepository