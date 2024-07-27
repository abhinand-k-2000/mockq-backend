"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notificationModel_1 = require("../database/notificationModel");
class NotificationRepository {
    async send(notification) {
        await notificationModel_1.NotificationModel.create(notification);
    }
    async fetchAll(userId) {
        const notifications = await notificationModel_1.NotificationModel.find({ userId });
        return notifications;
    }
}
exports.default = NotificationRepository;
