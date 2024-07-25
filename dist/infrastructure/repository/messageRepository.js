"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const candidateModel_1 = require("../database/candidateModel");
const chatModel_1 = require("../database/chatModel");
const messageModel_1 = require("../database/messageModel");
class MessageRepository {
    async saveMessage(newMessage) {
        try {
            let message = await messageModel_1.MessageModel.create(newMessage);
            message = await message.populate("sender", "name");
            message = await message.populate("chat");
            message = await candidateModel_1.CandidateModel.populate(message, {
                path: 'chat.users',
                select: 'name email'
            });
            await chatModel_1.ChatModel.findByIdAndUpdate(newMessage.chat, {
                latestMessage: message
            });
            return message;
        }
        catch (error) {
            console.log(error);
        }
    }
    async getAllMessages(chatId) {
        try {
            const messages = await messageModel_1.MessageModel.find({ chat: chatId })
                .populate("sender", 'name email')
                .populate("chat");
            return messages;
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = MessageRepository;
