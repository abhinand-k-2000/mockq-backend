import  {Types} from 'mongoose'

interface Message {
    sender: Types.ObjectId;
    content: string;
    chat: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date
}

export default Message