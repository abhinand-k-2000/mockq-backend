import mongoose, { Model, Schema } from "mongoose";
import InterviewerRating from "../../domain/entitites/interviewerRating";

const ratingSchema: Schema<InterviewerRating> = new Schema(
  {
    interviewerId: {
      type: String,
      required: true,
    },
    candidateId: {
      type: String,
      required: true,
    },
    interviewId: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


const InterviewerRatingModel: Model<InterviewerRating> = mongoose.model("InterviewerRating", ratingSchema)

export {InterviewerRatingModel}