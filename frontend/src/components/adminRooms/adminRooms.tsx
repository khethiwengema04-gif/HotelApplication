import React, { useEffect, useState } from 'react'
import axios from 'axios'
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
    const [hotels, setHotels] = useState<Hotel[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [hotelId, setHotelId] = useState('')
    const [form, setForm] = useState<RoomForm>(emptyForm)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const token = () => localStorage.getItem('token')

    const getErrorMessage = (err: unknown) => {
        if (axios.isAxiosError(err)) {
            return err.response?.data?.message || 'Request failed. Please try again.'
        }
        return 'An unexpected error occurred.'
    }

    const loadHotels = async () => {
        try {
            const response = await axios.get('/api/hotels')
            const data: Hotel[] = Array.isArray(response.data)
                ? response.data
                : response.data.hotels ?? []

            setHotels(data)

            if (data.length > 0) {
                setHotelId(current =>
                    current || String(data[0].id)
                )
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err))
        }
    }

    const loadRooms = async (selectedHotelId: string) => {
        if (!selectedHotelId) {
            setRooms([])
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await axios.get(
                `/api/rooms/hotels/${selectedHotelId}/rooms`
            )

            const data: Room[] = Array.isArray(response.data)
                ? response.data
                : response.data.rooms ?? []

            setRooms(data)
        } catch (err: unknown) {
            setError(getErrorMessage(err))
            setRooms([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadHotels()
    }, [])

    useEffect(() => {
        void loadRooms(hotelId)
    }, [hotelId])

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
            setError('Enter a room name, valid capacity, positive price, and number of rooms.')
            return
        }

        const roomData = {
            name: form.name.trim(),
            description: form.description.trim(),
            capacity,
            price_per_night: price,
            total_rooms: totalRooms,
        }

        setSaving(true)

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token()}`,
                },
            }

            if (editingId === null) {
                await axios.post(
                    `/api/rooms/hotels/${hotelId}/rooms`,
                    roomData,
                    config
                )
                setMessage('Room added successfully.')
            } else {
                await axios.put(
                    `/api/rooms/${editingId}`,
                    roomData,
                    config
                )
                setMessage('Room updated successfully.')
            }

            resetForm()
            await loadRooms(hotelId)
        } catch (err: unknown) {
            setError(getErrorMessage(err))
        } finally {
            setSaving(false)
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
            await axios.delete(`/api/rooms/${room.id}`, {
                headers: {
                    Authorization: `Bearer ${token()}`,
                },
            })

            if (editingId === room.id) resetForm()

            setMessage('Room deleted successfully.')
            await loadRooms(hotelId)
        } catch (err: unknown) {
            setError(getErrorMessage(err))
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

            {error && (
                <p className={styles.error} role="alert">{error}</p>
            )}
            {message && (
                <p className={styles.success} role="status">{message}</p>
            )}

            <section className={styles.formCard}>
                <h2>{editingId === null ? 'Add Room Type' : 'Edit Room Type'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <label className={styles.fullWidth}>
                            Select Hotel *
                            <select
                                value={hotelId}
                                onChange={event => {
                                    setHotelId(event.target.value)
                                    resetForm()
                                }}
                                required
                            >
                                <option value="">Choose a hotel</option>
                                {hotels.map(hotel => (
                                    <option key={hotel.id} value={hotel.id}>
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
                                    <p>{room.description || 'No description provided.'}</p>
                                    <p>Capacity: {room.capacity} guests</p>
                                    <p>Available room inventory: {room.total_rooms}</p>
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
