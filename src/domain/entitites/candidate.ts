
interface Candidate {
    _id: string;
    name: string;
    email: string;
    mobile: number;
    password: string;
    isBlocked: boolean;
    isPremium: boolean;
    subscriptionType: string;
    subscriptionExpiry: Date;
}


export default Candidate