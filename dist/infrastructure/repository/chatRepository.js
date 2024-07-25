"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const candidateModel_1 = require("../database/candidateModel");
const chatModel_1 = require("../database/chatModel");
const appError_1 = __importDefault(require("../utils/appError"));
class ChatRepository {
    async accessChat(candidateId, userId) {
        let isChat = await chatModel_1.ChatModel.find({ isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: candidateId } } },
                { users: { $elemMatch: { $eq: userId } } }
            ]
        }).populate("users", "-password")
            .populate("latestMessage");
        // isChat = await CandidateModel.populate(isChat, {
        //     path: "latestMessage.sender",
        //     select: "name email"
        // })
        if (isChat.length > 0) {
            return isChat[0];
        }
        else {
            let chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [candidateId, userId],
                // latestMessage: null, // Ensure latestMessage is initialized
                // groupAdmin: null, // Initialize other optional fields as needed
                // // createdAt: new Date(),
                // // updatedAt: new Date()
            };
            try {
                const createdChat = await chatModel_1.ChatModel.create(chatData);
                console.log("chat - ", createdChat);
                const fullChat = await chatModel_1.ChatModel.findOne({ _id: createdChat._id }).populate("users", "-password");
                return fullChat;
            }
            catch (error) {
                throw error;
            }
        }
    }
    async fetchChats(candidateId) {
        try {
            const allChat = await chatModel_1.ChatModel.find({ users: { $elemMatch: { $eq: candidateId } } })
                .populate("users", "-password")
                .populate("groupAdmin", "-password")
                .populate("latestMessage")
                .sort({ updatedAt: -1 });
            const result = await candidateModel_1.CandidateModel.populate(allChat, {
                path: "latestMessage.sender",
                select: "name email"
            });
            return result;
        }
        catch (error) {
            console.log(error);
        }
    }
    async createGroupChat(candidateId, users, chatName) {
        try {
            const groupChat = await chatModel_1.ChatModel.create({
                chatName: chatName,
                users: users,
                isGroupChat: true,
                groupAdmin: candidateId
            });
            const fullGroupChat = await chatModel_1.ChatModel.findOne({ _id: groupChat._id })
                .populate("users", "-password")
                .populate("groupAdmin", "-password");
            return fullGroupChat;
        }
        catch (error) {
            console.log(error);
        }
    }
    async addToGroup(chatId, userId) {
        try {
            const added = await chatModel_1.ChatModel.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
                .populate("users", "-password");
            if (!added)
                throw new appError_1.default("Chat not found", 404);
            return added;
        }
        catch (error) {
            console.log(error);
        }
    }
    async removeFromGroup(chatId, userId) {
        try {
            const removed = await chatModel_1.ChatModel.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
                .populate("users", "-password")
                .populate("groupAdmin", "-password");
            if (!removed)
                throw new appError_1.default("Chat not found", 404);
            return removed;
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = ChatRepository;
