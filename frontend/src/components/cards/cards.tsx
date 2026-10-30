import React from 'react';
import styles from './cards.module.css';
import { Text } from '../text/text';

export type HotelCardProps = {
    name: string;
    description: string;
    location: string;
    imglink: string;
    price: number;
    rating: number;
    id: number;
    isFavourite?: boolean;
    viewHotel: (id: number) => void;
    addToFavourites: (id: number) => void;
    shareHotel: (id: number) => void;
};

export const HotelCard: React.FC<HotelCardProps> = ({
    name,
    description,
    imglink,
    location,
    price,
    rating,
    id,
    isFavourite = false,
    viewHotel,
    addToFavourites,
    shareHotel
}) => {
    const mapLocation = encodeURIComponent(`${name}, ${location}`);

    return (
        <div className={styles['hotel-card']}>

            <img
                className={styles['hotel-image']}
                src={imglink}
                alt={name}
            />

            <div className={styles['hotel-details']}>

                <Text varient="span" style={{ fontWeight: 600 }}>
                    {name}
                </Text>

                <Text varient="span">
                    📍 {location}
                </Text>

                <Text varient="span">
                    {description}
                </Text>

                <Text varient="span" style={{ fontWeight: 600 }}>
                    ⭐ {rating} / 5
                </Text>

                <Text varient="span" style={{ fontWeight: 600 }}>
                    R{price.toLocaleString('en-ZA')} per night
                </Text>

                {/* Google Map */}
                <div className={styles['hotel-map']}>
                    <iframe
                        title={`Map showing ${name}`}
                        src={`https://www.google.com/maps?q=${mapLocation}&output=embed`}
                        width="100%"
                        height="180"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>

                <div className={styles['hotel-actions']}>

                    <button
                        type="button"
                        className={`${styles['hotel-button']} ${styles['view-button']}`}
                        onClick={() => viewHotel(id)}
                    >
                        View details
                    </button>

                    <button
                        type="button"
                        aria-pressed={isFavourite}
                        className={`${styles['hotel-button']} ${styles['favourite-button']} ${isFavourite ? styles['favourite-active'] : ''}`}
                        onClick={() => addToFavourites(id)}
                    >
                        {isFavourite
                            ? '♥ Added to Favourites'
                            : '♡ Favourite'}
                    </button>

                    <button
                        type="button"
                        className={`${styles['hotel-button']} ${styles['share-button']}`}
                        onClick={() => shareHotel(id)}
                    >
                        ↗ Share
                    </button>

                </div>
            </div>
        </div>
    );
};

export default HotelCard;
