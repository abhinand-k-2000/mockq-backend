import Chat from "../../domain/entitites/chat";
import Message from "../../domain/entitites/message";





interface IChatRepository {
    
    accessChat(candidateId: string, userId: string): Promise<Chat | null>
    // saveMessage(message: Message): Promise<Message>
    fetchChats(candidateId: string): Promise<any >

    createGroupChat(candidateId: string, users: any, chatName: string): Promise<any>

    addToGroup(chatId: string, userId: string): Promise<any>

    removeFromGroup(chatId: string, userId: string): Promise<any>
}


export default IChatRepository