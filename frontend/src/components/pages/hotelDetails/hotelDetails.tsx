import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import styles from './hotelDetails.module.css'
import ReviewList from '../../reviewsList/reviewsList'
import ReviewForm from '../../../components/reviewsForm/reviewsForm'

interface Hotel {
    id: number
    name: string
    location: string
    description: string
    price: number
    images: string[]
    star_rating: number
    facilities: string[]
    policies: string
}

interface Room {
    id: number
    hotel_id: number
    name: string
    description: string
    capacity: number
    price_per_night: number
    total_rooms: number
}

const HotelDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [hotel, setHotel] = useState<Hotel | null>(null)
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadDetails = async () => {
            if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
                setError('Invalid hotel ID.')
                setLoading(false)
                return
            }

            try {
                const [hotelResponse, roomsResponse] = await Promise.all([
                    axios.get(`/api/hotels/${id}`),
                    axios.get(`/api/rooms/hotels/${id}/rooms`)
                ])

                const hotelData = hotelResponse.data.hotel ?? hotelResponse.data
                const roomData = roomsResponse.data

                setHotel(hotelData)
                setRooms(
                    Array.isArray(roomData) ? roomData : roomData.rooms ?? []
                )
            } catch (err: unknown) {
                if (axios.isAxiosError(err)) {
                    setError(
                        err.response?.data?.message ||
                        'Could not load hotel details. Please try again.'
                    )
                } else {
                    setError('An unexpected error occurred.')
                }
            } finally {
                setLoading(false)
            }
        }

        void loadDetails()
    }, [id])

    const handleBookNow = (room: Room) => {
        if (!localStorage.getItem('token')) {
            navigate('/login')
            return
        }

        navigate(`/hotels/${id}/book/${room.id}`)
    }

    if (loading) {
        return (
            <main className={styles.page}>
                <p>Loading hotel details...</p>
            </main>
        )
    }

    if (error || !hotel) {
        return (
            <main className={styles.page}>
                <p className={styles.error}>
                    {error || 'Hotel not found.'}
                </p>

                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => navigate('/')}
                >
                    Back to hotels
                </button>
            </main>
        )
    }

    const images = Array.isArray(hotel.images) ? hotel.images : []

    return (
        <main className={styles.page}>
            <button
                type="button"
                className={styles.backButton}
                onClick={() => navigate('/')}
            >
                ← Back to hotels
            </button>

            <section className={styles.hotelHeader}>
                {images[0] && (
                    <img
                        className={styles.hotelImage}
                        src={images[0]}
                        alt={hotel.name}
                    />
                )}

                <div className={styles.hotelInfo}>
                    <p className={styles.eyebrow}>DISCOVER NESTOVA</p>
                    <h1>{hotel.name}</h1>

                    <p className={styles.location}>
                        📍 {hotel.location}
                    </p>

                    <p className={styles.description}>
                        {hotel.description ||
                            'Discover a comfortable stay at this hotel.'}
                    </p>

                    <p className={styles.rating}>
                        ★ {hotel.star_rating} / 5
                    </p>

                    <p className={styles.price}>
                        From R{Number(hotel.price).toFixed(2)} per night
                    </p>

                    {hotel.facilities?.length > 0 && (
                        <div className={styles.facilities}>
                            <h3>Hotel facilities</h3>
                            <p>{hotel.facilities.join(' · ')}</p>
                        </div>
                    )}

                    {hotel.policies && (
                        <div className={styles.policies}>
                            <h3>Hotel policies</h3>
                            <p>{hotel.policies}</p>
                        </div>
                    )}
                </div>
            </section>

            <section className={styles.roomsSection}>
                <div className={styles.sectionHeading}>
                    <div>
                        <p className={styles.eyebrow}>FIND YOUR STAY</p>
                        <h2>Available Room Types</h2>
                    </div>

                    <span>
                        {rooms.length} room type
                        {rooms.length === 1 ? '' : 's'}
                    </span>
                </div>

                {rooms.length === 0 ? (
                    <p className={styles.empty}>
                        No room types have been added to this hotel yet.
                    </p>
                ) : (
                    <div className={styles.roomGrid}>
                        {rooms.map(room => (
                            <article
                                className={styles.roomCard}
                                key={room.id}
                            >
                                <div className={styles.roomIcon}>⌂</div>

                                <h3>{room.name}</h3>

                                <p className={styles.roomDescription}>
                                    {room.description ||
                                        'A comfortable room for your stay.'}
                                </p>

                                <div className={styles.roomMeta}>
                                    <span>
                                        ♙ Up to {room.capacity} guests
                                    </span>

                                    <span>
                                        {room.total_rooms} room(s) in inventory
                                    </span>
                                </div>

                                <p className={styles.roomPrice}>
                                    R{Number(room.price_per_night).toFixed(2)}
                                    <small> / night</small>
                                </p>

                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    disabled={room.total_rooms < 1}
                                    onClick={() => handleBookNow(room)}
                                >
                                    {room.total_rooms < 1
                                        ? 'Unavailable'
                                        : 'Book Now'}
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Guest reviews */}
            <section className={styles.roomsSection}>
                <ReviewList hotelId={hotel.id} />
                <ReviewForm hotelId={hotel.id} />
            </section>
        </main>
    )
}

export default HotelDetails
