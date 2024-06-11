import mongoose from "mongoose";
import InterviewSlot, { Slot, Schedule} from "../../domain/entitites/interviewSlot";

const ScheduleSchema = new mongoose.Schema<Schedule>({
  description: String,
  from: Date,
  to: Date,
  title: String,
  status: { type: String, enum: ["open", "booked"] },
  price: Number,
});

const SlotSchema = new mongoose.Schema<Slot>({
  date: Date,
  schedule: [ScheduleSchema],
});

const InterviewSlotSchema = new mongoose.Schema<InterviewSlot>({
  interviewerId: String,
  slots: [SlotSchema],
});

const InterviewSlotModel = mongoose.model<InterviewSlot>(
  "InterviewSlot",
  InterviewSlotSchema
);
export { InterviewSlotModel };

// const interviewSlotSchema: Schema<InterviewSlot> = new Schema({
//   interviewerId: {
//     // type: Schema.Types.ObjectId,
//     type: String,
//     required: true,
//   },
//   slots: [
//     {
//       date: { type: Date },
//       schedule: [
//         {
//           description: { type: String },
//           from: { type: Date },
//           to: { type: Date },
//           title: { type: String },
//           status: { type: String, enum: ["open", "booked"] },
//           price: { type: Number },
//         },
//       ],
//     },
//   ],
// });

// const InterviewSlotModel: Model<InterviewSlot> = mongoose.model("InterviewSlot", interviewSlotSchema);

// export { InterviewSlotModel };
