import Message from "../../domain/entitites/message";





interface IMessageRepository {
    

    saveMessage(message: any): Promise<any>

    getAllMessages(chatId: string): Promise<any>
}


export default IMessageRepository