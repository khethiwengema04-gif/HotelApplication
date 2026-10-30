import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import styles from './booking.module.css'

interface Room {
    id: number
    hotel_id: number
    name: string
    description: string
    capacity: number
    price_per_night: number
    total_rooms: number
}

const Booking = () => {
    const { id, roomId } = useParams()
    const navigate = useNavigate()

    const [room, setRoom] = useState<Room | null>(null)
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [roomsBooked, setRoomsBooked] = useState('1')
    const [guestCount, setGuestCount] = useState('1')
    const [specialRequests, setSpecialRequests] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const loadRoom = async () => {
            try {
                const response = await axios.get(`/api/rooms/rooms/${roomId}`)
                const data = response.data.room ?? response.data

                if (String(data.hotel_id) !== String(id)) {
                    setError('This room does not belong to the selected hotel.')
                    return
                }

                setRoom(data)
                setGuestCount('1')
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Could not load room details.')
                } else {
                    setError('Could not load room details.')
                }
            } finally {
                setLoading(false)
            }
        }

        if (id && roomId) {
            void loadRoom()
        } else {
            setError('Invalid hotel or room.')
            setLoading(false)
        }
    }, [id, roomId])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setMessage('')

        if (!room) return

        if (!localStorage.getItem('token')) {
            navigate('/login')
            return
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (new Date(`${checkIn}T00:00:00`) < today) {
            setError('Check-in cannot be in the past.')
            return
        }

        if (checkOut <= checkIn) {
            setError('Check-out must be after check-in.')
            return
        }

        const numberOfRooms = Number(roomsBooked)
        const numberOfGuests = Number(guestCount)

        if (
            !Number.isInteger(numberOfRooms) ||
            numberOfRooms < 1 ||
            numberOfRooms > room.total_rooms
        ) {
            setError(`Choose between 1 and ${room.total_rooms} rooms.`)
            return
        }

        if (
            !Number.isInteger(numberOfGuests) ||
            numberOfGuests < 1 ||
            numberOfGuests > room.capacity * numberOfRooms
        ) {
            setError(`This selection can accommodate up to ${room.capacity * numberOfRooms} guests.`)
            return
        }

        setSaving(true)

        try {
            await axios.post(
                '/api/bookings',
                {
                    room_type_id: room.id,
                    check_in: checkIn,
                    check_out: checkOut,
                    rooms_booked: numberOfRooms,
                    guest_count: numberOfGuests,
                    special_requests: specialRequests.trim() || undefined,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            )

            setMessage('Your booking was submitted successfully!')
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Booking failed. Please try again.')
            } else {
                setError('Booking failed. Please try again.')
            }
        } finally {
            setSaving(false)
        }
    }

    const nights =
        checkIn && checkOut && checkOut > checkIn
            ? Math.round(
                (new Date(`${checkOut}T00:00:00`).getTime() -
                    new Date(`${checkIn}T00:00:00`).getTime()) /
                (1000 * 60 * 60 * 24)
            )
            : 0

    const totalPrice = room
        ? nights * Number(room.price_per_night) * Number(roomsBooked || 0)
        : 0

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loadingCard}>Loading your room details...</div>
            </main>
        )
    }

    if (!room) {
        return (
            <main className={styles.page}>
                <div className={styles.errorCard}>
                    <h2>Room unavailable</h2>
                    <p>{error || 'Room not found.'}</p>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => navigate(`/hotels/${id}`)}
                    >
                        Back to hotel
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate(`/hotels/${id}`)}
                >
                    ← Back to hotel
                </button>

                <header className={styles.pageHeader}>
                    <p className={styles.eyebrow}>NESTOVA HOTEL EXPERIENCE</p>
                    <h1>Book Your Stay</h1>
                    <p>Complete your details below to request your reservation.</p>
                </header>

                <div className={styles.bookingLayout}>
                    <section className={styles.formCard}>
                        <div className={styles.cardHeading}>
                            <span className={styles.headingIcon}>01</span>
                            <div>
                                <h2>Your reservation</h2>
                                <p>Choose your dates and guest details.</p>
                            </div>
                        </div>

                        {error && (
                            <p className={styles.errorMessage} role="alert">
                                {error}
                            </p>
                        )}

                        {message && (
                            <div className={styles.successMessage} role="status">
                                <h3>Booking submitted!</h3>
                                <p>{message}</p>
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={() => navigate('/home')}
                                >
                                    Continue browsing
                                </button>
                            </div>
                        )}

                        {!message && (
                            <form onSubmit={handleSubmit}>
                                <div className={styles.formGrid}>
                                    <label className={styles.field}>
                                        <span>Check-in date *</span>
                                        <input
                                            type="date"
                                            value={checkIn}
                                            min={new Date().toLocaleDateString('en-CA')}
                                            onChange={event => setCheckIn(event.target.value)}
                                            required
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span>Check-out date *</span>
                                        <input
                                            type="date"
                                            value={checkOut}
                                            min={checkIn || new Date().toLocaleDateString('en-CA')}
                                            onChange={event => setCheckOut(event.target.value)}
                                            required
                                        />
                                    </label>

                                    <label className={styles.field}>
                                        <span>Number of rooms *</span>
                                        <select
                                            value={roomsBooked}
                                            onChange={event => setRoomsBooked(event.target.value)}
                                            required
                                        >
                                            {Array.from(
                                                { length: Math.max(0, Math.floor(Number(room.total_rooms))) },
                                                (_, index) => String(index + 1)
                                            ).map(count => (
                                                <option key={count} value={count}>
                                                    {count} {count === '1' ? 'room' : 'rooms'}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className={styles.field}>
                                        <span>Number of guests *</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max={room.capacity * Number(roomsBooked)}
                                            value={guestCount}
                                            onChange={event => setGuestCount(event.target.value)}
                                            required
                                        />
                                        <small>
                                            Up to {room.capacity * Number(roomsBooked)} guests
                                        </small>
                                    </label>

                                    <label className={`${styles.field} ${styles.fullWidth}`}>
                                        <span>Special requests</span>
                                        <textarea
                                            value={specialRequests}
                                            onChange={event => setSpecialRequests(event.target.value)}
                                            rows={4}
                                            placeholder="Any preferences or special arrangements?"
                                        />
                                        <small>Optional</small>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className={styles.primaryButton}
                                    disabled={saving || room.total_rooms < 1}
                                >
                                    {saving ? 'Submitting booking...' : 'Confirm Booking'}
                                    {!saving && <span> →</span>}
                                </button>

                                <p className={styles.formNote}>
                                    Your reservation will be submitted for processing.
                                </p>
                            </form>
                        )}
                    </section>

                    <aside className={styles.summaryCard}>
                        <div className={styles.summaryTop}>
                            <p className={styles.eyebrow}>YOUR SELECTION</p>
                            <h2>Room Summary</h2>
                        </div>

                        <div className={styles.roomIllustration}>
                            <span>⌂</span>
                        </div>

                        <h3>{room.name}</h3>
                        <p className={styles.roomDescription}>
                            {room.description || 'A comfortable room for your stay at NESTOVA.'}
                        </p>

                        <div className={styles.roomFeature}>
                            <span>♙</span>
                            <span>Up to {room.capacity} guests per room</span>
                        </div>

                        <div className={styles.roomFeature}>
                            <span>▦</span>
                            <span>{room.total_rooms} rooms in inventory</span>
                        </div>

                        <div className={styles.priceDivider} />

                        <div className={styles.priceRow}>
                            <span>Price per room / night</span>
                            <strong>R{Number(room.price_per_night).toFixed(2)}</strong>
                        </div>

                        <div className={styles.priceRow}>
                            <span>Number of nights</span>
                            <strong>{nights}</strong>
                        </div>

                        <div className={styles.priceRow}>
                            <span>Rooms selected</span>
                            <strong>{roomsBooked}</strong>
                        </div>

                        <div className={styles.totalRow}>
                            <span>Estimated total</span>
                            <strong>R{totalPrice.toFixed(2)}</strong>
                        </div>

                        <p className={styles.summaryNote}>
                            The final booking is subject to availability and confirmation.
                        </p>
                    </aside>
                </div>
            </div>
        </main>
    )
}

export default Booking