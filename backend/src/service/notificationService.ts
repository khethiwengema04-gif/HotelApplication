
import { query } from "../config/database";
import {
    Notification,
    CreateNotificationInput
} from "../types/notificationTypes";

export const createNotificationService = async (
    data: CreateNotificationInput
): Promise<Notification> => {
    const {
        user_id,
        title,
        message,
        type = "general",
        booking_id = null
    } = data;

    const result = await query(
        `INSERT INTO notifications
            (user_id, title, message, type, booking_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [user_id, title, message, type, booking_id]
    );

    return result.rows[0] as Notification;
};

export const findMyNotificationsService = async (
    userId: number
): Promise<Notification[]> => {
    const result = await query(
        `SELECT *
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );

    return result.rows as Notification[];
};

export const markNotificationAsReadService = async (
    notificationId: number,
    userId: number
): Promise<Notification | null> => {
    const result = await query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [notificationId, userId]
    );

    return (result.rows[0] as Notification) || null;
};

export const markAllNotificationsAsReadService = async (
    userId: number
): Promise<number> => {
    const result = await query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
    );

    return result.rowCount ?? 0;
};

export const deleteNotificationService = async (
    notificationId: number,
    userId: number
): Promise<Notification | null> => {
    const result = await query(
        `DELETE FROM notifications
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [notificationId, userId]
    );

    return (result.rows[0] as Notification) || null;
};
