
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../store'
import { fetchHotels } from '../../features/hotels'
import {
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
} from '../../features/rooms'
import styles from './adminRooms.module.css'

interface Hotel {
    id: number
    name: string
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

interface RoomForm {
    name: string
    description: string
    capacity: string
    price_per_night: string
    total_rooms: string
}

const emptyForm: RoomForm = {
    name: '',
    description: '',
    capacity: '2',
    price_per_night: '',
    total_rooms: '1',
}

const AdminRooms = () => {
    const dispatch = useDispatch<AppDispatch>()

    // Redux state
    const hotels = useSelector(
        (state: RootState) => state.hotels.hotels
    ) as Hotel[]

    const rooms = useSelector(
        (state: RootState) => state.rooms.rooms
    ) as Room[]

    const loading = useSelector(
        (state: RootState) => state.rooms.isLoading
    )

    const saving = useSelector(
        (state: RootState) => state.rooms.isSaving
    )

    const roomsError = useSelector(
        (state: RootState) => state.rooms.error
    )

    const hotelsError = useSelector(
        (state: RootState) => state.hotels.error
    )

    // Local form state
    const [hotelId, setHotelId] = useState('')
    const [form, setForm] = useState<RoomForm>(emptyForm)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const token = () => localStorage.getItem('token')

    // Fetch hotels from Redux
    useEffect(() => {
        void dispatch(fetchHotels())
    }, [dispatch])

    // Select the first hotel automatically
    useEffect(() => {
        if (hotels.length > 0 && !hotelId) {
            setHotelId(String(hotels[0].id))
        }
    }, [hotels, hotelId])

    // Fetch rooms whenever the selected hotel changes
    useEffect(() => {
        if (hotelId) {
            void dispatch(fetchRooms(hotelId))
        }
    }, [hotelId, dispatch])

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target
        setForm(previous => ({ ...previous, [name]: value }))
    }

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
    }

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()
        setError('')
        setMessage('')

        if (!token()) {
            setError('Please log in as an administrator.')
            return
        }

        const capacity = Number(form.capacity)
        const price = Number(form.price_per_night)
        const totalRooms = Number(form.total_rooms)

        if (
            !hotelId ||
            !form.name.trim() ||
            !Number.isInteger(capacity) ||
            capacity < 1 ||
            !Number.isFinite(price) ||
            price <= 0 ||
            !Number.isInteger(totalRooms) ||
            totalRooms < 1
        ) {
            setError(
                'Enter a room name, valid capacity, positive price, and number of rooms.'
            )
            return
        }

        const roomData = {
            name: form.name.trim(),
            description: form.description.trim(),
            capacity,
            price_per_night: price,
            total_rooms: totalRooms,
        }

        try {
            if (editingId === null) {
                await dispatch(
                    createRoom({
                        hotelId,
                        roomData,
                    })
                ).unwrap()

                setMessage('Room added successfully.')
            } else {
                await dispatch(
                    updateRoom({
                        roomId: editingId,
                        roomData,
                    })
                ).unwrap()

                setMessage('Room updated successfully.')
            }

            resetForm()

            // Refresh the room list
            await dispatch(fetchRooms(hotelId)).unwrap()

        } catch (err: unknown) {
            setError(
                typeof err === 'string'
                    ? err
                    : 'Request failed. Please try again.'
            )
        }
    }

    const handleEdit = (room: Room) => {
        setEditingId(room.id)

        setForm({
            name: room.name,
            description: room.description ?? '',
            capacity: String(room.capacity),
            price_per_night: String(room.price_per_night),
            total_rooms: String(room.total_rooms),
        })

        setError('')
        setMessage('')
    }

    const handleDelete = async (room: Room) => {
        if (!window.confirm(`Delete the ${room.name} room type?`)) {
            return
        }

        if (!token()) {
            setError('Please log in as an administrator.')
            return
        }

        setError('')
        setMessage('')

        try {
            await dispatch(deleteRoom(room.id)).unwrap()

            if (editingId === room.id) {
                resetForm()
            }

            setMessage('Room deleted successfully.')

        } catch (err: unknown) {
            setError(
                typeof err === 'string'
                    ? err
                    : 'Failed to delete room. Please try again.'
            )
        }
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Manage Rooms</h1>
                    <p>Add and manage room types for each hotel.</p>
                </div>
            </header>

            {(error || roomsError || hotelsError) && (
                <p className={styles.error} role="alert">
                    {error || roomsError || hotelsError}
                </p>
            )}

            {message && (
                <p className={styles.success} role="status">
                    {message}
                </p>
            )}

            <section className={styles.formCard}>
                <h2>
                    {editingId === null ? 'Add Room Type' : 'Edit Room Type'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <label className={styles.fullWidth}>
                            Select Hotel *
                            <select
                                value={hotelId}
                                onChange={event => {
                                    setHotelId(event.target.value)
                                    resetForm()
                                    setError('')
                                    setMessage('')
                                }}
                                required
                            >
                                <option value="">Choose a hotel</option>

                                {hotels.map(hotel => (
                                    <option
                                        key={hotel.id}
                                        value={hotel.id}
                                    >
                                        {hotel.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Room Name *
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Deluxe Room"
                                required
                            />
                        </label>

                        <label>
                            Maximum Guests *
                            <input
                                type="number"
                                name="capacity"
                                min="1"
                                step="1"
                                value={form.capacity}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Price Per Night (R) *
                            <input
                                type="number"
                                name="price_per_night"
                                min="0.01"
                                step="0.01"
                                value={form.price_per_night}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            Number of Rooms *
                            <input
                                type="number"
                                name="total_rooms"
                                min="1"
                                step="1"
                                value={form.total_rooms}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className={styles.fullWidth}>
                            Description
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Describe the room and its facilities"
                            />
                        </label>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={saving || !hotelId}
                        >
                            {saving
                                ? 'Saving...'
                                : editingId === null
                                    ? 'Add Room'
                                    : 'Save Changes'}
                        </button>

                        {editingId !== null && (
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={resetForm}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className={styles.listSection}>
                <h2>Rooms for Selected Hotel</h2>

                {loading ? (
                    <p>Loading rooms...</p>
                ) : rooms.length === 0 ? (
                    <p>No room types found for this hotel yet.</p>
                ) : (
                    <div className={styles.hotelGrid}>
                        {rooms.map(room => (
                            <article
                                className={styles.hotelCard}
                                key={room.id}
                            >
                                <div className={styles.hotelDetails}>
                                    <h3>{room.name}</h3>

                                    <p>
                                        {room.description ||
                                            'No description provided.'}
                                    </p>

                                    <p>
                                        Capacity: {room.capacity} guests
                                    </p>

                                    <p>
                                        Available room inventory: {room.total_rooms}
                                    </p>

                                    <strong>
                                        R{Number(room.price_per_night).toFixed(2)} / night
                                    </strong>

                                    <div className={styles.cardActions}>
                                        <button
                                            type="button"
                                            className={styles.secondaryButton}
                                            onClick={() => handleEdit(room)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className={styles.deleteButton}
                                            onClick={() => void handleDelete(room)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}

export default AdminRooms
