import { NextFunction, Request, Response } from "express";
import ChatUseCase from "../../use-cases/chatUseCase";
import AppError from "../../infrastructure/utils/appError";
import { ChatModel } from "../../infrastructure/database/chatModel";

class ChatController {
  constructor(private chatUseCase: ChatUseCase) {}

  async accessChat(req: Request, res: Response, next: NextFunction) {
    try {
        const candidateId = req.candidateId as string
        if(!candidateId) throw new AppError("Candidate id not found", 400);

        const {userId} = req.body;
        if(!userId) throw new AppError("User id not found", 400)
        
        const chat = await this.chatUseCase.accessChat(candidateId, userId)
        return res.status(200).json({success: true, data: chat})
    } catch (error) {
        next(error)
    }
  }

  async fetchChats(req: Request, res: Response, next: NextFunction) {
    try {
        const candidateId = req.candidateId
        if(!candidateId) throw new AppError("Candidate id not found", 400)
        
        const chats = await this.chatUseCase.fetchChats(candidateId)
        return res.status(200).json({success: true, data: chats})
    } catch (error) {
        next(error)
    } 
  }

  async createGroupChat(req: Request, res: Response, next: NextFunction) {
    try {
        const candidateId = req.candidateId;
        if(!candidateId) throw new AppError("Candidate id not found", 400)

        console.log(req.body)
        if(!req.body.users || !req.body.chatName) throw new AppError("Please fill up the fields", 400);

        let users = JSON.parse(req.body.users);
        if(users.length < 2) throw new AppError("More than 2 users are required to form a group chat", 400);

        users.push(candidateId)
        const chats = await this.chatUseCase.CreateGroupChat(candidateId, users, req.body.chatName)
        return res.status(200).json({success: true, data: chats})
    } catch (error) {
        next(error)
    }
  }

  async addToGroup(req: Request, res: Response, next: NextFunction) {
    try {
        const {chatId, userId} = req.body
        if(!chatId || !userId) throw new AppError("Please fill the required fields", 400)
        
        const chat = await this.chatUseCase.addToGroup(chatId, userId)
        return res.status(200).json({success: true, data: chat})
    } catch (error) {
        next(error)
    }
  }

  async removeFromGroup(req: Request, res: Response, next: NextFunction) {
    try {
        const {chatId, userId} = req.body;
        if(!chatId || !userId) throw new AppError("Please fill the required fiedls", 400)

        const chat = await this.chatUseCase.removeFromGroup(chatId, userId);
        return res.status(200).json({success: true, data: chat})
    } catch (error) {
        next(error)
    }
  }




  async saveMessage(req: Request, res: Response, next: NextFunction) {
    try {
        const sender = req.candidateId;
        console.log(sender)
    if (!sender) throw new AppError("sender id not found", 400);

    const { content, chatId } = req.body;
    const message = await this.chatUseCase.sendMessage(sender, chatId, content);
    return res.status(201).json({ success: true, data: message });
    } catch (error) {
        next(error)
    } 
  }


  async getAllMessages(req: Request, res: Response, next: NextFunction) {
    try {
        const {chatId} = req.params 
        if(!chatId) throw new AppError("Chat id not found", 400)
        const messages = await this.chatUseCase.getAllMessages(chatId)
        return res.status(200).json({success: true, data: messages})
    } catch (error) {
        next(error)
    }
  }
}

export default ChatController;
    