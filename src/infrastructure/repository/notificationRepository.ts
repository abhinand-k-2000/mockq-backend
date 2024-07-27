import Notification from "../../domain/entitites/notification";
import INotification from "../../interface/repositories/INotificationRepository";
import { NotificationModel } from "../database/notificationModel";



class NotificationRepository implements INotification {

    async send(notification: Notification): Promise<void> {
        await  NotificationModel.create(notification)
    }

    async fetchAll(userId: string): Promise<Notification[]> {
        const notifications = await NotificationModel.find({userId})
        return notifications
    }
}

export default NotificationRepository