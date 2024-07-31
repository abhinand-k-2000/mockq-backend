
interface Candidate {
    _id: string;
    name: string;
    email: string;
    mobile: number;
    password: string;
    profilePic?: string;
    isBlocked: boolean;
    isPremium: boolean;
    subscriptionType: string;
    subscriptionExpiry: Date;
}


export default Candidate