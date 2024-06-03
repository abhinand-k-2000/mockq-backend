export interface InterviewerRegistration {
    _id: string;
    name: string;
    email: string;
    mobile: number;
    password: string;
    isBlocked: boolean;
    isApproved: boolean;
    organisation?: string;
    currentDesignation?: string;
    yearsOfExperience?: string;
    collegeUniversity?: string;
    profilePicture?: string;
    salarySlip?: string;
    resume?: string;
    introduction?: string;
    hasCompletedDetails: boolean
    
}

export interface InterviewerProfile extends InterviewerRegistration {
    organisation?: string;
    currentDesignation?: string;
    yearsOfExperience?: string;
    collegeUniversity?: string;
    profilePicture?: string;
    salarySlip?: string;
    resume?: string;
    introduction?: string;
}   


