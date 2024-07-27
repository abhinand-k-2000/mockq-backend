import Notification from "../../domain/entitites/notification";


interface INotificationRepository {
    send(notification: Notification): Promise<void>;
    fetchAll(userId: string): Promise<Notification[]>;
}

export default INotificationRepository