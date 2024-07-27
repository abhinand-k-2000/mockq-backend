
interface Notification {
    _id?: string;
    userId: string;
    heading: string;
    message: string;
    read: boolean;
    feedbackId?: string;
}

export default Notification