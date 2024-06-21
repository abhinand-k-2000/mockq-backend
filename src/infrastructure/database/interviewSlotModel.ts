import mongoose from "mongoose";
import InterviewSlot, { Slot, Schedule} from "../../domain/entitites/interviewSlot";

const ScheduleSchema = new mongoose.Schema<Schedule>({
  description: { type: String, required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ["open", "booked"], required: true },
  price: { type: Number, required: true },
  technologies: { type: [String], required: true } // Ensure technologies is an array of strings
});

const SlotSchema = new mongoose.Schema<Slot>({
  date: { type: Date, required: true },
  schedule: { type: [ScheduleSchema], required: true }
});

const InterviewSlotSchema = new mongoose.Schema<InterviewSlot>({
  interviewerId: { type: String, required: true },
  slots: { type: [SlotSchema], required: true }
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
