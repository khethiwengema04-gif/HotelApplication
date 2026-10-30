
export type NotificationType =
    | 'booking_pending'
    | 'booking_confirmed'
    | 'booking_rejected'
    | 'booking_cancelled'
    | 'booking_completed'
    | 'general';

export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: NotificationType | string;
    is_read: boolean;
    booking_id: number | null;
    created_at: Date;
}

export interface CreateNotificationInput {
    user_id: number;
    title: string;
    message: string;
    type?: NotificationType;
    booking_id?: number | null;
}
