import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from './myBookings.module.css'

interface Booking {
    id: number
    user_id: number
    room_type_id: number
    hotel_name: string
    hotel_location: string
    room_name: string
    check_in: string
    check_out: string
    rooms_booked: number
    guest_count: number
    price_per_night: number
    total_price: number
    status: 'Pending' | 'Confirmed' | 'Rejected' | 'Cancelled' | 'Completed'
    special_requests?: string | null
    created_at: string
}

interface BookingsResponse {
    bookings: Booking[]
}

const MyBookings = () => {
    const navigate = useNavigate()

    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [cancellingId, setCancellingId] = useState<number | null>(null)
    const [message, setMessage] = useState('')

    const loadBookings = async () => {
        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        try {
            setLoading(true)
            setError('')

            const response = await axios.get<BookingsResponse>(
                '/api/bookings/my-bookings',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setBookings(response.data.bookings ?? [])
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    localStorage.removeItem('token')
                    navigate('/login')
                    return
                }

                setError(
                    err.response?.data?.message ||
                    'Could not load your bookings. Please try again.'
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

    const handleCancel = async (bookingId: number) => {
        const confirmed = window.confirm(
            'Are you sure you want to cancel this booking?'
        )

        if (!confirmed) return

        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        try {
            setCancellingId(bookingId)
            setError('')
            setMessage('')

            const response = await axios.patch(
                `/api/bookings/${bookingId}/cancel`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setMessage(
                response.data.message || 'Booking cancelled successfully.'
            )

            // Refresh the list to show the latest booking status.
            await loadBookings()
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ||
                    'Could not cancel this booking. Please try again.'
                )
            } else {
                setError('An unexpected error occurred while cancelling.')
            }
        } finally {
            setCancellingId(null)
        }
    }

    const formatDate = (date: string) => {
        if (!date) return 'Not provided'

        // Avoid timezone shifts when displaying date-only values.
        const datePart = date.split('T')[0]
        const [year, month, day] = datePart.split('-')

        if (!year || !month || !day) return date

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

    const formatPrice = (amount: number | string | null | undefined) => {
        const value = Number(amount)

        if (!Number.isFinite(value)) return 'Price unavailable'

        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(value)
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.stateCard}>
                    Loading your bookings...
                </div>
            </div>
        )
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate('/home')}
                >
                    ← Back to hotels
                </button>

                <header className={styles.header}>
                    <p className={styles.eyebrow}>YOUR NESTOVA ACCOUNT</p>
                    <h1>My Bookings</h1>
                    <p>
                        View your reservations and manage your upcoming stays.
                    </p>
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

                {!error && bookings.length === 0 ? (
                    <section className={styles.emptyState}>
                        <div className={styles.emptyIcon}>⌂</div>
                        <h2>No bookings yet</h2>
                        <p>
                            Your reservations will appear here once you make
                            your first booking.
                        </p>
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={() => navigate('/home')}
                        >
                            Explore hotels
                        </button>
                    </section>
                ) : (
                    <section className={styles.bookingList}>
                        {bookings.map((booking) => {
                            const canCancel =
                                booking.status === 'Pending' ||
                                booking.status === 'Confirmed'

                            return (
                                <article
                                    className={styles.bookingCard}
                                    key={booking.id}
                                >
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <p className={styles.bookingNumber}>
                                                BOOKING #{booking.id}
                                            </p>
                                            <h2>
                                                {booking.hotel_name ||
                                                    'Hotel reservation'}
                                            </h2>
                                            <p className={styles.location}>
                                                {booking.hotel_location ||
                                                    'Location unavailable'}
                                            </p>
                                        </div>

                                        <span
                                            className={`${styles.status} ${styles[
                                                `status${booking.status}`
                                                ]
                                                }`}
                                        >
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className={styles.roomInfo}>
                                        <span className={styles.roomIcon}>
                                            ⌂
                                        </span>
                                        <div>
                                            <h3>
                                                {booking.room_name ||
                                                    'Room details unavailable'}
                                            </h3>
                                            <p>
                                                {booking.rooms_booked} room(s)
                                                {' · '}
                                                {booking.guest_count} guest(s)
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.detailsGrid}>
                                        <div className={styles.detailItem}>
                                            <span>CHECK-IN</span>
                                            <strong>
                                                {formatDate(booking.check_in)}
                                            </strong>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span>CHECK-OUT</span>
                                            <strong>
                                                {formatDate(booking.check_out)}
                                            </strong>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span>PRICE PER NIGHT</span>
                                            <strong>
                                                {formatPrice(
                                                    booking.price_per_night
                                                )}
                                            </strong>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span>TOTAL PRICE</span>
                                            <strong className={styles.totalPrice}>
                                                {formatPrice(
                                                    booking.total_price
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    {booking.special_requests && (
                                        <div className={styles.requests}>
                                            <strong>Special requests</strong>
                                            <p>{booking.special_requests}</p>
                                        </div>
                                    )}

                                    <div className={styles.cardFooter}>
                                        <span className={styles.footerNote}>
                                            {canCancel
                                                ? 'Need to change your plans?'
                                                : `This booking is ${booking.status.toLowerCase()}.`}
                                        </span>

                                        {canCancel && (
                                            <button
                                                type="button"
                                                className={styles.cancelButton}
                                                disabled={
                                                    cancellingId === booking.id
                                                }
                                                onClick={() =>
                                                    void handleCancel(booking.id)
                                                }
                                            >
                                                {cancellingId === booking.id
                                                    ? 'Cancelling...'
                                                    : 'Cancel booking'}
                                            </button>
                                        )}
                                    </div>
                                </article>
                            )
                        })}
                    </section>
                )}
            </div>
        </main>
    )
}

export default MyBookings
