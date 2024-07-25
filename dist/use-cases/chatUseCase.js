"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChatUseCase {
    constructor(messageRepository, chatRepository) {
        this.messageRepository = messageRepository;
        this.chatRepository = chatRepository;
    }
    async accessChat(candidateId, userId) {
        const chat = await this.chatRepository.accessChat(candidateId, userId);
        return chat;
    }
    async fetchChats(candidateId) {
        const chats = await this.chatRepository.fetchChats(candidateId);
        return chats;
    }
    async CreateGroupChat(candidateId, users, chatName) {
        const chat = await this.chatRepository.createGroupChat(candidateId, users, chatName);
        return chat;
    }
    async addToGroup(chatId, userId) {
        const chat = await this.chatRepository.addToGroup(chatId, userId);
        return chat;
    }
    async removeFromGroup(chatId, userId) {
        const chat = await this.chatRepository.removeFromGroup(chatId, userId);
        return chat;
    }
    async sendMessage(senderId, chatId, content) {
        let newMessage = {
            sender: senderId,
            content: content,
            chat: chatId,
        };
        const message = await this.messageRepository.saveMessage(newMessage);
        return message;
    }
    async getAllMessages(chatId) {
        const messages = await this.messageRepository.getAllMessages(chatId);
        return messages;
    }
}
exports.default = ChatUseCase;
