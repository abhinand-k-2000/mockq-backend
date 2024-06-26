interface ScheduledInterview {
    date: Date;
    fromTime: Date;
    toTime: Date;
    description: string;
    title: string;
    price: number;
    interviewerId: string;
    candidateId: string
    status: string
}



export default ScheduledInterview