import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styles from './Admin.module.css'

interface Booking {
    id: number
    guest_name: string
    guest_email: string
    room_name: string
    hotel_name: string
    check_in: string
    check_out: string
    status: string
    total_price: number | string
}

const Admin = () => {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem('token')

            if (!token) {
                setError('Please log in to access the admin dashboard.')
                setIsLoading(false)
                return
            }

            try {
                const response = await axios.get('/api/bookings', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                setBookings(response.data.bookings || [])
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 401) {
                        setError('Your session has expired. Please log in again.')
                    } else if (err.response?.status === 403) {
                        setError('Access denied. An administrator account is required.')
                    } else {
                        setError(
                            err.response?.data?.message ||
                            'Could not load reservations. Please try again.'
                        )
                    }
                } else {
                    setError('An unexpected error occurred.')
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchBookings()
    }, [])

    const pendingBookings = bookings.filter(
        booking => booking.status === 'Pending'
    ).length

    const confirmedBookings = bookings.filter(
        booking => booking.status === 'Confirmed'
    ).length

    const formatDate = (date: string) => {
        if (!date) return '—'

        const datePart = date.substring(0, 10)
        const [year, month, day] = datePart.split('-')

        return `${day}/${month}/${year}`
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    return (
        <div className={styles.dashboard}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <h2 className={styles.logo}>LuxeStay</h2>
                <p className={styles.adminLabel}>ADMIN PANEL</p>

                <nav className={styles.navigation}>
                    <a href="#dashboard" className={styles.activeLink}>
                        <span>▦</span> Dashboard
                    </a>

                    <a href="#accommodations">
                        <span>▣</span> Accommodations
                    </a>

                    <a href="#reservations">
                        <span>▤</span> Reservations
                    </a>

                    <a href="#settings">
                        <span>⚙</span> Settings
                    </a>
                </nav>

                <button
                    className={styles.logoutButton}
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent} id="dashboard">
                <header className={styles.header}>
                    <div>
                        <h1>Dashboard Overview</h1>
                        <p>Welcome back, Administrator!</p>
                    </div>

                    <div className={styles.adminProfile}>
                        <div className={styles.avatar}>A</div>
                        <span>Administrator</span>
                    </div>
                </header>

                {error && (
                    <p role="alert" style={{ color: '#b42318', marginBottom: 16 }}>
                        {error}
                    </p>
                )}

                {/* Summary Cards */}
                <section className={styles.summaryCards}>
                    <article className={styles.card}>
                        <span className={styles.cardIcon}>▣</span>
                        <p>Total Accommodations</p>
                        <h2>—</h2>
                        <small>Hotels and listings</small>
                    </article>

                    <article className={styles.card}>
                        <span className={styles.cardIcon}>▤</span>
                        <p>Total Reservations</p>
                        <h2>{isLoading ? '...' : bookings.length}</h2>
                        <small>All bookings</small>
                    </article>

                    <article className={styles.card}>
                        <span className={styles.cardIcon}>◷</span>
                        <p>Pending Reservations</p>
                        <h2>{isLoading ? '...' : pendingBookings}</h2>
                        <small>Awaiting approval</small>
                    </article>

                    <article className={styles.card}>
                        <span className={styles.cardIcon}>✓</span>
                        <p>Approved Reservations</p>
                        <h2>{isLoading ? '...' : confirmedBookings}</h2>
                        <small>Confirmed bookings</small>
                    </article>
                </section>

                {/* Quick Actions */}
                <section className={styles.section}>
                    <h2>Quick Actions</h2>

                    <div className={styles.actions}>
                        <button
                            className={styles.primaryButton}
                            onClick={() => {
                                window.location.hash = 'accommodations'
                            }}
                        >
                            + Add Accommodation
                        </button>

                        <button
                            className={styles.secondaryButton}
                            onClick={() => {
                                window.location.hash = 'reservations'
                            }}
                        >
                            View Reservations
                        </button>
                    </div>
                </section>

                {/* Recent Reservations */}
                <section className={styles.section} id="reservations">
                    <h2>Recent Reservations</h2>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Guest</th>
                                    <th>Room</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5}>Loading reservations...</td>
                                    </tr>
                                ) : bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={5}>
                                            {error
                                                ? 'Reservations could not be loaded.'
                                                : 'No reservations to display yet.'}
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.slice(0, 5).map(booking => (
                                        <tr key={booking.id}>
                                            <td>
                                                <strong>{booking.guest_name}</strong>
                                                <br />
                                                <small>{booking.guest_email}</small>
                                            </td>

                                            <td>
                                                {booking.room_name}
                                                <br />
                                                <small>{booking.hotel_name}</small>
                                            </td>

                                            <td>{formatDate(booking.check_in)}</td>
                                            <td>{formatDate(booking.check_out)}</td>
                                            <td>{booking.status}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default Admin
