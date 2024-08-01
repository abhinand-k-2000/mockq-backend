import mongoose, { Schema } from "mongoose";
import ScheduledInterview from "../../domain/entitites/scheduledInterview";

const ScheduledInterviewSchema = new Schema<ScheduledInterview>({
  date: {
    type: Date,
    required: true,
  },
  fromTime: {
    type: Date,
    required: true,
  },
  toTime: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  interviewerId: {
    type: String,
    required: true,
  },
  candidateId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  roomId: {
    type: String,
    required: true
  },
  interviewerRatingAdded: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {timestamps: true});

const ScheduledInterviewModel = mongoose.model<ScheduledInterview>(
  "SchduledInterview",
  ScheduledInterviewSchema
);

export {ScheduledInterviewModel}  