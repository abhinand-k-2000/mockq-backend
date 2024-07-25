"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewSlotModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ScheduleSchema = new mongoose_1.default.Schema({
    description: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ["open", "booked"], required: true },
    price: { type: Number, required: true },
    technologies: { type: [String], required: true } // Ensure technologies is an array of strings
});
const SlotSchema = new mongoose_1.default.Schema({
    date: { type: Date, required: true },
    schedule: { type: [ScheduleSchema], required: true }
});
const InterviewSlotSchema = new mongoose_1.default.Schema({
    interviewerId: { type: String, required: true },
    slots: { type: [SlotSchema], required: true }
});
const InterviewSlotModel = mongoose_1.default.model("InterviewSlot", InterviewSlotSchema);
exports.InterviewSlotModel = InterviewSlotModel;
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
