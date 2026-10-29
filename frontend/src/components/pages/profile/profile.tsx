
import React, { useEffect, useState } from 'react';
import styles from './profile.module.css';
import { Link } from 'react-router-dom';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

const Profile = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser) as User);
            } catch {
                console.error('Saved user details are invalid.');
            }
        }
    }, []);

    if (!user) {
        return (
            <div className={styles.page}>
                <div className={styles.profileCard}>
                    <div className={styles.header}>
                        <h1>My Profile</h1>
                        <p>Please log in to view your profile.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.profileCard}>
                <div className={styles.header}>
                    <div className={styles.avatar}>
                        {user.name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    <h1>My Profile</h1>
                    <p>Welcome to your NESTOVA account</p>
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
                        <strong className={styles.role}>
                            {user.role}
                        </strong>
                    </div>
                </div>


                <div className={styles.bookingsLink}>
                    <Link to="/my-bookings">
                        My Bookings
                    </Link>
                </div>


                <div className={styles.bookingsLink}>
                    <Link to="/favourites">
                        My Favourites ♡
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Profile;
