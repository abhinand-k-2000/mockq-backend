
import mongoose from 'mongoose';
import AppError from './appError';

export function stringToObjectId(str: string) {
  try {
    return new mongoose.Types.ObjectId(str);
  } catch (error) {
    throw new AppError("Invalid ObjectId string", 400)
  }
}
