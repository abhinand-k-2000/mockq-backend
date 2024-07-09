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
}     



export default ScheduledInterview