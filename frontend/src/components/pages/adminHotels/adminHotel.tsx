import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styles from './adminHotel.module.css'

interface Hotel {
    id: number
    name: string
    location: string
    description: string
    facilities: string[]
    policies: string
    price: number
    images: string[]
    star_rating: number
}

interface HotelForm {
    name: string
    location: string
    description: string
    facilities: string
    policies: string
    price: string
    images: string
    star_rating: string
}

const emptyForm: HotelForm = {
    name: '',
    location: '',
    description: '',
    facilities: '',
    policies: '',
    price: '',
    images: '',
    star_rating: '3',
}

const AdminHotels = () => {
    const [hotels, setHotels] = useState<Hotel[]>([])
    const [form, setForm] = useState<HotelForm>(emptyForm)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    const loadHotels = async () => {
        setLoading(true)
        setError('')

        try {
            // Public endpoint: GET /api/hotels
            const response = await axios.get<Hotel[]>('/api/hotels')
            setHotels(response.data)
        } catch {
            setError('Could not load hotels. Please check your backend connection.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadHotels()
    }, [])

    const handleInputChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = event.target
        setForm(previous => ({ ...previous, [name]: value }))
    }

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setMessage('')

        const price = Number(form.price)
        const rating = Number(form.star_rating)

        if (
            !form.name.trim() ||
            !form.location.trim() ||
            form.price.trim() === '' ||
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            setError('Enter a name, location, valid price, and star rating from 1 to 5.')
            return
        }

        const token = localStorage.getItem('token')

        if (!token) {
            setError('Please log in as an administrator before saving a hotel.')
            return
        }

        const hotelData = {
            name: form.name.trim(),
            location: form.location.trim(),
            description: form.description.trim(),
            facilities: form.facilities
                .split(',')
                .map(item => item.trim())
                .filter(Boolean),
            policies: form.policies.trim(),
            price,
            images: form.images
                .split(',')
                .map(item => item.trim())
                .filter(Boolean),
            star_rating: rating,
        }

        setSaving(true)

        try {
            if (editingId === null) {
                await axios.post('/api/hotels', hotelData, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setMessage('Hotel added successfully.')
            } else {
                await axios.put(`/api/hotels/${editingId}`, hotelData, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                setMessage('Hotel updated successfully.')
            }

            resetForm()
            await loadHotels()
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ||
                    'Could not save the hotel. Please try again.'
                )
            } else {
                setError('An unexpected error occurred.')
            }
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (hotel: Hotel) => {
        setEditingId(hotel.id)
        setForm({
            name: hotel.name ?? '',
            location: hotel.location ?? '',
            description: hotel.description ?? '',
            facilities: (hotel.facilities ?? []).join(', '),
            policies: hotel.policies ?? '',
            price: String(hotel.price ?? ''),
            images: (hotel.images ?? []).join(', '),
            star_rating: String(hotel.star_rating ?? 3),
        })

        setError('')
        setMessage('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (hotel: Hotel) => {
        if (!window.confirm(`Are you sure you want to delete "${hotel.name}"?`)) {
            return
        }

        const token = localStorage.getItem('token')

        if (!token) {
            setError('Please log in as an administrator to delete a hotel.')
            return
        }

        setError('')
        setMessage('')

        try {
            await axios.delete(`/api/hotels/${hotel.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (editingId === hotel.id) resetForm()

            setMessage('Hotel deleted successfully.')
            await loadHotels()
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ||
                    'Could not delete the hotel.'
                )
            } else {
                setError('An unexpected error occurred.')
            }
        }
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Manage Accommodations</h1>
                    <p>Add and manage the hotels shown on LuxeStay.</p>
                </div>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => void loadHotels()}
                >
                    Refresh Hotels
                </button>
            </header>

            {error && <p className={styles.error} role="alert">{error}</p>}
            {message && <p className={styles.success} role="status">{message}</p>}

            <section className={styles.formCard}>
                <h2>{editingId === null ? 'Add New Hotel' : 'Edit Hotel'}</h2>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <label>
                            Hotel name *
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleInputChange}
                                required
                            />
                        </label>

                        <label>
                            Location *
                            <input
                                name="location"
                                value={form.location}
                                onChange={handleInputChange}
                                required
                            />
                        </label>

                        <label>
                            Price per night (R) *
                            <input
                                type="number"
                                name="price"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={handleInputChange}
                                required
                            />
                        </label>

                        <label>
                            Star rating *
                            <select
                                name="star_rating"
                                value={form.star_rating}
                                onChange={handleInputChange}
                            >
                                {[1, 2, 3, 4, 5].map(rating => (
                                    <option key={rating} value={rating}>
                                        {rating} star{rating > 1 ? 's' : ''}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className={styles.fullWidth}>
                            Description
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleInputChange}
                                rows={3}
                            />
                        </label>

                        <label className={styles.fullWidth}>
                            Facilities
                            <input
                                name="facilities"
                                value={form.facilities}
                                onChange={handleInputChange}
                                placeholder="Wi-Fi, Pool, Breakfast"
                            />
                            <small>Separate facilities with commas.</small>
                        </label>

                        <label className={styles.fullWidth}>
                            Policies
                            <textarea
                                name="policies"
                                value={form.policies}
                                onChange={handleInputChange}
                                rows={2}
                                placeholder="Check-in rules, cancellation policy..."
                            />
                        </label>

                        <label className={styles.fullWidth}>
                            Image URLs
                            <textarea
                                name="images"
                                value={form.images}
                                onChange={handleInputChange}
                                rows={2}
                                placeholder="https://example.com/hotel.jpg"
                            />
                            <small>Separate multiple image URLs with commas.</small>
                        </label>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={saving}
                        >
                            {saving
                                ? 'Saving...'
                                : editingId === null
                                    ? 'Add Hotel'
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
                <h2>Existing Hotels ({hotels.length})</h2>

                {loading ? (
                    <p>Loading hotels...</p>
                ) : hotels.length === 0 ? (
                    <p>No hotels found in the database yet.</p>
                ) : (
                    <div className={styles.hotelGrid}>
                        {hotels.map(hotel => (
                            <article className={styles.hotelCard} key={hotel.id}>
                                {hotel.images?.[0] ? (
                                    <img
                                        src={hotel.images[0]}
                                        alt={hotel.name}
                                        className={styles.hotelImage}
                                    />
                                ) : (
                                    <div className={styles.imagePlaceholder}>
                                        No image available
                                    </div>
                                )}

                                <div className={styles.hotelDetails}>
                                    <div className={styles.hotelTitle}>
                                        <h3>{hotel.name}</h3>
                                        <span>{hotel.star_rating} ★</span>
                                    </div>

                                    <p>{hotel.location}</p>
                                    <strong>
                                        R{Number(hotel.price).toFixed(2)} / night
                                    </strong>

                                    <p className={styles.description}>
                                        {hotel.description || 'No description provided.'}
                                    </p>

                                    <div className={styles.cardActions}>
                                        <button
                                            type="button"
                                            className={styles.secondaryButton}
                                            onClick={() => handleEdit(hotel)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className={styles.deleteButton}
                                            onClick={() => void handleDelete(hotel)}
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

export default AdminHotels
