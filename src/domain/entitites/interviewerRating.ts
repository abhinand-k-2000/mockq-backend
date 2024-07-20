

interface InterviewerRating {
    _id?: string
    interviewerId: string;
    candidateId: string;
    interviewId: string;
    rating: number;
    comment: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export default InterviewerRating