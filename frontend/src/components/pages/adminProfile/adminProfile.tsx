
import React, { useEffect, useState } from 'react';
import styles from './adminProfile.module.css'
import { Link, useNavigate } from 'react-router-dom';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

const AdminProfile = () => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');

        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser) as User;

                if (parsedUser.role === 'Admin') {
                    setUser(parsedUser);
                }
            } catch {
                console.error('Saved admin details are invalid.');
            }
        }
    }, []);

    if (!user) {
        return (
            <div className={styles.page}>
                <div className={styles.profileCard}>
                    <div className={styles.header}>
                        <h1>Admin Profile</h1>
                        <p>Admin details not found. Please log in again.</p>
                    </div>
                    <button onClick={() => navigate('/login')}>
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.profileCard}>
                <div className={styles.header}>
                    <div className={styles.avatar}>
                        {user.name?.charAt(0).toUpperCase() || 'A'}
                    </div>

                    <h1>Admin Profile</h1>
                    <p>Welcome to your NESTOVA administration account</p>
                </div>

                <div className={styles.details}>
                    <div className={styles.detailItem}>
                        <span>Full Name</span>
                        <strong>{user.name}</strong>
                    </div>

                    <div className={styles.detailItem}>
                        <span>Email Address</span>
                        <strong>{user.email}</strong>
                    </div>

                    <div className={styles.detailItem}>
                        <span>Account Role</span>
                        <strong className={styles.role}>{user.role}</strong>
                    </div>
                </div>

                <div className={styles.bookingsLink}>
                    <Link to="/admin">Back to Dashboard</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
