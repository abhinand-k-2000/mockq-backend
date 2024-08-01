interface ScheduledInterview {
    _id: string;
    date: Date;
    fromTime: Date;
    toTime: Date;
    description: string;
    title: string;
    price: number;
    interviewerId: string;
    candidateId: string
    status: string;
    roomId: string;
    interviewerRatingAdded: boolean
    reminderSent: boolean
}     

interface candidate {
    name: string;
    email: string
}
export interface AggregatedScheduledInterview extends ScheduledInterview {
    candidate: candidate
}


export default ScheduledInterview