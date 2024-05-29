import mongoose from 'mongoose'
 
export const connectDB = async () => {
    try {
        const mongooseUri = process.env.MONGO_URL   

        // or const mongooseUri = process.env.MONGO_URL as string
        if(!mongooseUri){
            throw new Error('MONGO_URL environment variable is not defined')
        }
        await mongoose.connect(mongooseUri)
        console.log("Database connected successfully!")
    } catch (error) {
        console.log(error)
    }
}