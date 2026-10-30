import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './favourites.module.css'

interface FavouriteHotel {
    id: number;
    user_id: number;
    hotel_id: number;
    created_at: string;
    name: string;
    location: string;
    description: string;
    price: number | string;
    images: string[] | null;
    star_rating: number;
}

interface FavouritesResponse {
    favourites: FavouriteHotel[];
    message?: string;
}

const Favourites = () => {
    const [favourites, setFavourites] = useState<FavouriteHotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [removingId, setRemovingId] = useState<number | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavourites = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please log in to view your favourites.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get<FavouritesResponse>(
                    '/api/favourites',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setFavourites(response.data.favourites);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(
                        err.response?.data?.message ||
                        'Failed to load your favourite hotels.'
                    );
                } else {
                    setError('Something went wrong. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, []);

    const removeFavourite = async (hotelId: number) => {
        const token = localStorage.getItem('token');

        if (!token) {
            setError('Please log in to manage your favourites.');
            return;
        }

        setRemovingId(hotelId);
        setError('');

        try {
            await axios.delete(`/api/favourites/${hotelId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setFavourites((current) =>
                current.filter((hotel) => hotel.hotel_id !== hotelId)
            );
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.message ||
                    'Failed to remove this hotel from favourites.'
                );
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <p className={styles.status}>Loading your favourite hotels...</p>
            </div>
        );
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>YOUR NESTOVA COLLECTION</p>
                    <h1>My Favourites ♡</h1>
                    <p className={styles.subtitle}>
                        Your saved hotels, all in one place.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate('/home')}
                >
                    Back to Hotels
                </button>
            </header>

            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}

            {!error && favourites.length === 0 ? (
                <section className={styles.emptyState}>
                    <div className={styles.heart}>♡</div>
                    <h2>No favourites yet</h2>
                    <p>
                        Save hotels you love, and they will appear here.
                    </p>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => navigate('/home')}
                    >
                        Explore Hotels
                    </button>
                </section>
            ) : (
                <section className={styles.hotelGrid}>
                    {favourites.map((hotel) => {
                        const image = hotel.images?.[0];

                        return (
                            <article
                                className={styles.hotelCard}
                                key={hotel.hotel_id}
                            >
                                {image ? (
                                    <img
                                        className={styles.hotelImage}
                                        src={image}
                                        alt={hotel.name}
                                    />
                                ) : (
                                    <div className={styles.imagePlaceholder}>
                                        No image available
                                    </div>
                                )}

                                <div className={styles.hotelContent}>
                                    <div className={styles.hotelHeading}>
                                        <h2>{hotel.name}</h2>
                                        <span className={styles.rating}>
                                            ★ {hotel.star_rating}/5
                                        </span>
                                    </div>

                                    <p className={styles.location}>
                                        📍 {hotel.location}
                                    </p>

                                    <p className={styles.description}>
                                        {hotel.description ||
                                            'Discover this NESTOVA accommodation.'}
                                    </p>

                                    <p className={styles.price}>
                                        R{Number(hotel.price).toLocaleString(
                                            'en-ZA',
                                            { minimumFractionDigits: 2 }
                                        )}
                                        <span> / night</span>
                                    </p>

                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        onClick={() =>
                                            navigate(`/hotels/${hotel.hotel_id}`)
                                        }
                                    >
                                        View Details
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        disabled={removingId === hotel.hotel_id}
                                        onClick={() =>
                                            removeFavourite(hotel.hotel_id)
                                        }
                                    >
                                        {removingId === hotel.hotel_id
                                            ? 'Removing...'
                                            : 'Remove from Favourites'}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}
        </main>
    );
};

export default Favourites;