export interface Schedule {
  description: string;
  from: Date;
  to: Date;
  title: string;
  status: "open" | "booked";
  price: number;
  technologies: string[]
}

export interface Slot {
  date: Date | null;
  schedule: Schedule[];
}

interface InterviewSlot {
  interviewerId: string;
  slots: Slot[];
}

export default InterviewSlot;


// interface Schedule {
//   description: string;
//   timeFrom: Date;
//   timeTo: Date;
//   title: string;
//   status: "open" | "booked";
//   price: number;
// } 

// interface Slot {
//   date: Date | null;
//   schedule: Schedule[];
// }

// interface InterviewSlot {
//   interviewerId: string;
//   slots: Slot[];
// }

// export default InterviewSlot;



















// interface InterviewSlot {
//   interviewerId: string;
//   slots: {
//     date: Date;
//     schedule: {
//       description: string;
//       timeFrom: Date;
//       timeTo: Date;
//       title: string;
//       status: "open" | "booked";
//       price: number;
//     }[];
//   }[];
// }


// interface InterviewSlot {
//   date: string;
//   slots: []
//   description: string;
//   price: number;
//   timeFrom: string;
//   timeTo: string;
//   title: string;
//   schedule: []
//   interviewerId: string;
// }

// export default InterviewSlot;
