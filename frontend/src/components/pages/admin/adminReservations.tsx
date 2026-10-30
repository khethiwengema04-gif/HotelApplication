import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import styles from './adminReservation.module.css'

type BookingStatus =
    | 'Pending'
    | 'Confirmed'
    | 'Rejected'
    | 'Cancelled'
    | 'Completed'

interface Booking {
    id: number
    user_id: number
    room_type_id: number
    guest_name: string
    guest_email: string
    hotel_name: string
    room_name: string
    check_in: string
    check_out: string
    rooms_booked: number
    guest_count: number
    price_per_night: number | string
    total_price: number | string
    special_requests?: string | null
    status: BookingStatus
    created_at: string
}

type FilterStatus = 'All' | BookingStatus

const adminReservations = () => {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [filter, setFilter] = useState<FilterStatus>('All')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [updatingId, setUpdatingId] = useState<number | null>(null)

    const loadBookings = async () => {
        const token = localStorage.getItem('token')

        if (!token) {
            setError('Please log in as an administrator.')
            setLoading(false)
            return
        }

        try {
            setError('')

            const response = await axios.get<{ bookings: Booking[] }>(
                '/api/bookings',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setBookings(response.data.bookings ?? [])
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ??
                    'Unable to load reservations.'
                )
            } else {
                setError('An unexpected error occurred.')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadBookings()
    }, [])

    const counts = useMemo(() => ({
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'Pending').length,
        confirmed: bookings.filter(b => b.status === 'Confirmed').length,
        cancelled: bookings.filter(b => b.status === 'Cancelled').length
    }), [bookings])

    const filteredBookings = useMemo(
        () => filter === 'All'
            ? bookings
            : bookings.filter(booking => booking.status === filter),
        [bookings, filter]
    )

    const updateStatus = async (
        booking: Booking,
        status: BookingStatus
    ) => {
        const prompts: Partial<Record<BookingStatus, string>> = {
            Confirmed: 'Confirm this reservation?',
            Rejected: 'Reject this reservation?',
            Cancelled: 'Cancel this reservation?'
        }

        if (prompts[status] && !window.confirm(prompts[status])) {
            return
        }

        const token = localStorage.getItem('token')

        if (!token) {
            setError('Your session has expired. Please log in again.')
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
                        Authorization: `Bearer ${token}`
                    }
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
                response.data.message ??
                `Reservation #${booking.id} updated successfully.`
            )
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ??
                    'Unable to update this reservation.'
                )
            } else {
                setError('An unexpected error occurred.')
            }
        } finally {
            setUpdatingId(null)
        }
    }

    const formatDate = (value: string) => {
        if (!value) return '—'

        const datePart = value.split('T')[0]
        const [year, month, day] = datePart.split('-')

        if (!year || !month || !day) return value

        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        ).toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatPrice = (value: number | string) =>
        new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(Number(value) || 0)

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>NESTOVA ADMIN PANEL</p>
                    <h1>Reservations</h1>
                    <p className={styles.subtitle}>
                        View and manage your hotel bookings.
                    </p>
                </div>

                <button
                    className={styles.refreshButton}
                    onClick={() => {
                        setLoading(true)
                        void loadBookings()
                    }}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>
            </header>

            {error && (
                <div className={styles.errorMessage} role="alert">
                    {error}
                </div>
            )}

            {message && (
                <div className={styles.successMessage} role="status">
                    {message}
                </div>
            )}

            <section className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <span>Total reservations</span>
                    <strong>{counts.total}</strong>
                </div>
                <div className={styles.summaryCard}>
                    <span>Pending</span>
                    <strong>{counts.pending}</strong>
                </div>
                <div className={styles.summaryCard}>
                    <span>Confirmed</span>
                    <strong>{counts.confirmed}</strong>
                </div>
                <div className={styles.summaryCard}>
                    <span>Cancelled</span>
                    <strong>{counts.cancelled}</strong>
                </div>
            </section>

            <section className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <div>
                        <h2>All reservations</h2>
                        <p>Review guest details and booking status.</p>
                    </div>

                    <select
                        value={filter}
                        onChange={event =>
                            setFilter(event.target.value as FilterStatus)
                        }
                        className={styles.filter}
                        aria-label="Filter reservations by status"
                    >
                        <option value="All">All statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                {loading ? (
                    <p className={styles.stateMessage}>
                        Loading reservations...
                    </p>
                ) : filteredBookings.length === 0 ? (
                    <p className={styles.stateMessage}>
                        No reservations found for this filter.
                    </p>
                ) : (
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Booking</th>
                                    <th>Customer</th>
                                    <th>Hotel / Room</th>
                                    <th>Stay dates</th>
                                    <th>Guests / Rooms</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td>#{booking.id}</td>

                                        <td>
                                            <strong>{booking.guest_name}</strong>
                                            <span className={styles.secondaryText}>
                                                {booking.guest_email}
                                            </span>
                                        </td>

                                        <td>
                                            <strong>{booking.hotel_name}</strong>
                                            <span className={styles.secondaryText}>
                                                {booking.room_name}
                                            </span>
                                        </td>

                                        <td>
                                            <span>{formatDate(booking.check_in)}</span>
                                            <span className={styles.secondaryText}>
                                                to {formatDate(booking.check_out)}
                                            </span>
                                        </td>

                                        <td>
                                            {booking.guest_count} guests
                                            <span className={styles.secondaryText}>
                                                {booking.rooms_booked} room(s)
                                            </span>
                                        </td>

                                        <td className={styles.price}>
                                            {formatPrice(booking.total_price)}
                                        </td>

                                        <td>
                                            <span className={`${styles.status} ${styles[`status${booking.status}`]}`}>
                                                {booking.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className={styles.actions}>
                                                {booking.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            className={styles.confirmButton}
                                                            disabled={updatingId === booking.id}
                                                            onClick={() => void updateStatus(booking, 'Confirmed')}
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            className={styles.rejectButton}
                                                            disabled={updatingId === booking.id}
                                                            onClick={() => void updateStatus(booking, 'Rejected')}
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {booking.status === 'Confirmed' && (
                                                    <button
                                                        className={styles.rejectButton}
                                                        disabled={updatingId === booking.id}
                                                        onClick={() => void updateStatus(booking, 'Cancelled')}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}

                                                {updatingId === booking.id && (
                                                    <span className={styles.secondaryText}>
                                                        Updating...
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    )
}

export default adminReservations
