import { Request, Response } from "express";
import {
    findMyNotificationsService,
    markNotificationAsReadService,
    markAllNotificationsAsReadService,
    deleteNotificationService
} from "../service/notificationService";

const validId = (
    value: string | string[] | undefined
): number | null => {
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
        return null;
    }

    const id = Number(value);

    return Number.isSafeInteger(id) ? id : null;
};

// GET /api/notifications
export const getMyNotifications = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const notifications = await findMyNotificationsService(
            req.user.id
        );

        return res.status(200).json({
            message: "Notifications retrieved successfully",
            notifications,
            unreadCount: notifications.filter(
                notification => !notification.is_read
            ).length
        });
    } catch (error) {
        console.error("Get notifications error:", error);

        return res.status(500).json({
            message: "Failed to retrieve notifications"
        });
    }
};

// PATCH /api/notifications/:id/read
export const markNotificationAsRead = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const notificationId = validId(req.params.id);

        if (notificationId === null) {
            return res.status(400).json({
                message: "Invalid notification ID"
            });
        }

        const notification = await markNotificationAsReadService(
            notificationId,
            req.user.id
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error("Mark notification read error:", error);

        return res.status(500).json({
            message: "Failed to mark notification as read"
        });
    }
};

// PATCH /api/notifications/read-all
export const markAllNotificationsAsRead = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const updatedCount =
            await markAllNotificationsAsReadService(req.user.id);

        return res.status(200).json({
            message: "All notifications marked as read",
            updatedCount
        });
    } catch (error) {
        console.error("Mark all notifications read error:", error);

        return res.status(500).json({
            message: "Failed to mark notifications as read"
        });
    }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const notificationId = validId(req.params.id);

        if (notificationId === null) {
            return res.status(400).json({
                message: "Invalid notification ID"
            });
        }

        const notification = await deleteNotificationService(
            notificationId,
            req.user.id
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            message: "Notification deleted successfully"
        });
    } catch (error) {
        console.error("Delete notification error:", error);

        return res.status(500).json({
            message: "Failed to delete notification"
        });
    }
};
