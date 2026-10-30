
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./notifications.module.css";

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    booking_id: number | null;
    created_at: string;
}

const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const fetchNotifications = async () => {
        try {
            const response = await axios.get("/api/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(response.data.notifications);
        } catch (error) {
            console.error(error);
            setError("Could not load notifications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await axios.patch(
                `/api/notifications/${id}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === id
                        ? { ...notification, is_read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.patch(
                "/api/notifications/read-all",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setNotifications(prev =>
                prev.map(notification => ({ ...notification, is_read: true }))
            );
        } catch (error) {
            console.error(error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await axios.delete(`/api/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNotifications(prev =>
                prev.filter(notification => notification.id !== id)
            );
        } catch (error) {
            console.error(error);
        }
    };

    const unreadCount = notifications.filter(item => !item.is_read).length;

    if (loading) return <p>Loading notifications...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Notifications</h1>
                    <p>You have {unreadCount} unread notifications.</p>
                </div>

                {unreadCount > 0 && (
                    <button onClick={markAllAsRead}>
                        Mark all as read
                    </button>
                )}
            </div>

            {error && <p>{error}</p>}

            {notifications.length === 0 ? (
                <p className={styles.empty}>You have no notifications yet.</p>
            ) : (
                <div className={styles.notificationList}>
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`${styles.notificationCard} ${!notification.is_read ? styles.unread : ""
                                }`}
                        >
                            <div>
                                <h3>{notification.title}</h3>
                                <p>{notification.message}</p>

                                <small>
                                    {new Date(notification.created_at).toLocaleString()}
                                </small>
                            </div>

                            <div className={styles.actions}>
                                {!notification.is_read && (
                                    <button onClick={() => markAsRead(notification.id)}>
                                        Mark as read
                                    </button>
                                )}

                                <button
                                    onClick={() => deleteNotification(notification.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
