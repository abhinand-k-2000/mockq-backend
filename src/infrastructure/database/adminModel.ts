import mongoose, {Schema, Model} from 'mongoose';
import Admin from '../../domain/entitites/admin'

const adminSchema: Schema<Admin> = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

})


const AdminModel: Model<Admin> = mongoose.model<Admin>("admin", adminSchema)
export {AdminModel}