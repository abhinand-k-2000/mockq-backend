"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../../infrastructure/utils/appError"));
class ChatController {
    constructor(chatUseCase) {
        this.chatUseCase = chatUseCase;
    }
    async accessChat(req, res, next) {
        try {
            const candidateId = req.candidateId;
            if (!candidateId)
                throw new appError_1.default("Candidate id not found", 400);
            const { userId } = req.body;
            if (!userId)
                throw new appError_1.default("User id not found", 400);
            const chat = await this.chatUseCase.accessChat(candidateId, userId);
            return res.status(200).json({ success: true, data: chat });
        }
        catch (error) {
            next(error);
        }
    }
    async fetchChats(req, res, next) {
        try {
            const candidateId = req.candidateId;
            if (!candidateId)
                throw new appError_1.default("Candidate id not found", 400);
            const chats = await this.chatUseCase.fetchChats(candidateId);
            return res.status(200).json({ success: true, data: chats });
        }
        catch (error) {
            next(error);
        }
    }
    async createGroupChat(req, res, next) {
        try {
            const candidateId = req.candidateId;
            if (!candidateId)
                throw new appError_1.default("Candidate id not found", 400);
            console.log(req.body);
            if (!req.body.users || !req.body.chatName)
                throw new appError_1.default("Please fill up the fields", 400);
            let users = JSON.parse(req.body.users);
            if (users.length < 2)
                throw new appError_1.default("More than 2 users are required to form a group chat", 400);
            users.push(candidateId);
            const chats = await this.chatUseCase.CreateGroupChat(candidateId, users, req.body.chatName);
            return res.status(200).json({ success: true, data: chats });
        }
        catch (error) {
            next(error);
        }
    }
    async addToGroup(req, res, next) {
        try {
            const { chatId, userId } = req.body;
            if (!chatId || !userId)
                throw new appError_1.default("Please fill the required fields", 400);
            const chat = await this.chatUseCase.addToGroup(chatId, userId);
            return res.status(200).json({ success: true, data: chat });
        }
        catch (error) {
            next(error);
        }
    }
    async removeFromGroup(req, res, next) {
        try {
            const { chatId, userId } = req.body;
            if (!chatId || !userId)
                throw new appError_1.default("Please fill the required fiedls", 400);
            const chat = await this.chatUseCase.removeFromGroup(chatId, userId);
            return res.status(200).json({ success: true, data: chat });
        }
        catch (error) {
            next(error);
        }
    }
    async saveMessage(req, res, next) {
        try {
            const sender = req.candidateId;
            console.log(sender);
            if (!sender)
                throw new appError_1.default("sender id not found", 400);
            const { content, chatId } = req.body;
            const message = await this.chatUseCase.sendMessage(sender, chatId, content);
            return res.status(201).json({ success: true, data: message });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllMessages(req, res, next) {
        try {
            const { chatId } = req.params;
            if (!chatId)
                throw new appError_1.default("Chat id not found", 400);
            const messages = await this.chatUseCase.getAllMessages(chatId);
            return res.status(200).json({ success: true, data: messages });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = ChatController;
