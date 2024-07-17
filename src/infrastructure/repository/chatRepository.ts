import Chat from "../../domain/entitites/chat";
import Message from "../../domain/entitites/message";
import IChatRepository from "../../interface/repositories/IChatRepository";
import { CandidateModel } from "../database/candidateModel";
import { ChatModel } from "../database/chatModel";
import { MessageModel } from "../database/messageModel";
import AppError from "../utils/appError";

class ChatRepository implements IChatRepository {
     
 async accessChat(candidateId: string, userId: string): Promise<Chat | null> {

    let isChat = await ChatModel.find({isGroupChat: false, 
        $and: [
            {users: {$elemMatch: {$eq: candidateId}}},
            {users: {$elemMatch: {$eq: userId}}}
        ]
    }).populate("users", "-password")
    .populate("latestMessage")

    // isChat = await CandidateModel.populate(isChat, {
    //     path: "latestMessage.sender",
    //     select: "name email"
    // })

    if(isChat.length > 0) {
        return isChat[0] 
    }else {
        let chatData ={
            chatName: "sender",
            isGroupChat: false,
            users: [candidateId, userId],
            // latestMessage: null, // Ensure latestMessage is initialized
            // groupAdmin: null, // Initialize other optional fields as needed
            // // createdAt: new Date(),
            // // updatedAt: new Date()
        }

        try {
            const createdChat = await ChatModel.create(chatData);
            console.log("chat - ", createdChat)
            const fullChat = await ChatModel.findOne({_id: createdChat._id}).populate("users", "-password")
            return fullChat as Chat
        } catch (error) {
            throw error
        }
    }
 }

 async fetchChats(candidateId: string): Promise<any> {
     try {
        const allChat = await ChatModel.find({users: {$elemMatch: {$eq: candidateId}}})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({updatedAt: -1})

        const result = await CandidateModel.populate(allChat, {
            path: "latestMessage.sender",
            select: "name email"
           })
        return result
     } catch (error) {
        console.log(error)
     }
 }

 async createGroupChat(candidateId: string, users: any, chatName: string) {
    try {
        const groupChat = await ChatModel.create({
            chatName: chatName,
            users: users,
            isGroupChat: true, 
            groupAdmin: candidateId
        })

        const fullGroupChat = await ChatModel.findOne({_id: groupChat._id})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

        return fullGroupChat
    } catch (error) {
        console.log(error)
    }
 }

 async addToGroup(chatId: string, userId: string): Promise<any> {
     try {
        const added = await ChatModel.findByIdAndUpdate(chatId, {$push: {users: userId}}, {new: true})
        .populate("users", "-password")

        if(!added) throw new AppError("Chat not found", 404)
        return added
     } catch (error) {
        console.log(error)
     }
 }


 async removeFromGroup(chatId: string, userId: string): Promise<any> {
     try {
        const removed = await ChatModel.findByIdAndUpdate(chatId, {$pull: {users: userId}}, {new: true})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

        if(!removed) throw new AppError("Chat not found", 404)
    
        return removed
     } catch (error) {
        console.log(error)
     }
 }


}

export default ChatRepository;
