"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongooseUri = process.env.MONGO_URL;
        // or const mongooseUri = process.env.MONGO_URL as string
        if (!mongooseUri) {
            throw new Error('MONGO_URL environment variable is not defined');
        }
        await mongoose_1.default.connect(mongooseUri);
        console.log("Database connected successfully!");
    }
    catch (error) {
        console.log(error);
    }
};
exports.connectDB = connectDB;
