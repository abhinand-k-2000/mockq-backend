import IChatRepository from "../interface/repositories/IChatRepository";
import IMessageRepository from "../interface/repositories/IMessageRepository";

class ChatUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private chatRepository: IChatRepository
  ) {}

  async accessChat(candidateId: string, userId: string){
    const chat = await this.chatRepository.accessChat(candidateId, userId)
    return chat
  }

  async fetchChats(candidateId: string) {
    const chats = await this.chatRepository.fetchChats(candidateId)
    return chats
  }

  async CreateGroupChat(candidateId: string, users: any, chatName: string) {
    const chat = await this.chatRepository.createGroupChat(candidateId, users, chatName)
    return chat
  }

  async addToGroup(chatId: string, userId: string) {
    const chat = await this.chatRepository.addToGroup(chatId, userId)
    return chat
  }

  async removeFromGroup(chatId: string, userId: string) {
    const chat = await this.chatRepository.removeFromGroup(chatId, userId)
    return chat
  }

  async sendMessage(senderId: string, chatId: string, content: string) {
    let newMessage = {
      sender: senderId, 
      content: content,
      chat: chatId,
    };
    const message = await this.messageRepository.saveMessage(newMessage);
    return message;
  }

  async getAllMessages(chatId: string) {
    const messages = await this.messageRepository.getAllMessages(chatId)
    return messages
  }
}

export default ChatUseCase;   
