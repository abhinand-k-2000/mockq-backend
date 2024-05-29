export interface InterviewerRegistration {
    _id: string;
    name: string;
    email: string;
    mobile: number;
    password: string;
    isBlocked: boolean;
    isApproved: boolean
}

export interface InterviewerProfile extends InterviewerRegistration {
    organisation?: string;
    currentDesignation?: string;
    yearsOfExperience?: string;
    college?: string;
    profilePhoto?: string;
    salarySlip?: string;
    resume?: string;
    introduction?: string;
}


