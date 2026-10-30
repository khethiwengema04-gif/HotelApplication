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
    const [message, setMessage] = useState('')
    const [updatingId, setUpdatingId] = useState<number | null>(null)

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

        void fetchBookings()
    }, [])

    // Approve or reject a reservation
    const handleUpdateStatus = async (
        booking: Booking,
        status: 'Confirmed' | 'Rejected'
    ) => {
        const action = status === 'Confirmed' ? 'approve' : 'reject'

        if (
            !window.confirm(
                `Are you sure you want to ${action} booking #${booking.id}?`
            )
        ) {
            return
        }

        const token = localStorage.getItem('token')

        if (!token) {
            setError('Please log in again.')
            return
        }

        try {
            setUpdatingId(booking.id)
            setError('')
            setMessage('')

            const response = await axios.patch(
                `/api/bookings/${booking.id}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            setBookings(previous =>
                previous.map(item =>
                    item.id === booking.id
                        ? { ...item, ...response.data.booking }
                        : item
                )
            )

            setMessage(
                response.data.message ||
                `Booking #${booking.id} updated successfully.`
            )
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ||
                    `Could not ${action} this booking.`
                )
            } else {
                setError('An unexpected error occurred.')
            }
        } finally {
            setUpdatingId(null)
        }
    }

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
                <h2 className={styles.logo}>NESTOVA</h2>
                <p className={styles.adminLabel}>ADMIN PANEL</p>

                <nav className={styles.navigation}>
                    <a href="/admin" className={styles.activeLink}>
                        <span>▦</span> Dashboard
                    </a>

                    <a href="/admin/hotels">
                        <span>▣</span> Manage Hotels
                    </a>

                    <a href="/admin/rooms">
                        <span>▤</span> Manage Rooms
                    </a>

                    <a href="/admin/reservations">
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

                    <div
                        className={styles.adminProfile}
                        onClick={() => {
                            window.location.href = '/admin/profile';
                        }}
                        role="button"
                        tabIndex={0}
                    >
                        <div className={styles.avatar}>
                            {JSON.parse(localStorage.getItem('user') || '{}').name
                                ?.charAt(0).toUpperCase() || 'A'}
                        </div>

                        <span>
                            {JSON.parse(localStorage.getItem('user') || '{}').name
                                || 'Administrator'}
                        </span>
                    </div>
                </header>

                {/* Error and success messages */}
                {error && (
                    <p
                        role="alert"
                        style={{ color: '#b42318', marginBottom: 16 }}
                    >
                        {error}
                    </p>
                )}

                {message && (
                    <p
                        role="status"
                        style={{ color: '#237547', marginBottom: 16 }}
                    >
                        {message}
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
                            type="button"
                            className={styles.primaryButton}
                            onClick={() => {
                                window.location.href = '/admin/hotels'
                            }}
                        >
                            + Add Accommodation
                        </button>

                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                                window.location.href = '/admin/hotels'
                            }}
                        >
                            Manage Accommodations
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
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6}>
                                            Loading reservations...
                                        </td>
                                    </tr>
                                ) : bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>
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

                                            {/* Approval and rejection buttons */}
                                            <td>
                                                {booking.status === 'Pending' ? (
                                                    <div className={styles.actions}>
                                                        <button
                                                            type="button"
                                                            className={styles.primaryButton}
                                                            disabled={updatingId !== null}
                                                            onClick={() =>
                                                                void handleUpdateStatus(
                                                                    booking,
                                                                    'Confirmed'
                                                                )
                                                            }
                                                        >
                                                            {updatingId === booking.id
                                                                ? 'Updating...'
                                                                : 'Approve'}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={styles.secondaryButton}
                                                            disabled={updatingId !== null}
                                                            onClick={() =>
                                                                void handleUpdateStatus(
                                                                    booking,
                                                                    'Rejected'
                                                                )
                                                            }
                                                        >
                                                            {updatingId === booking.id
                                                                ? 'Updating...'
                                                                : 'Reject'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span>—</span>
                                                )}
                                            </td>
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
