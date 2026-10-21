
import React from 'react'
import styles from './hotelCards.module.css'
import { Text } from '../text/text'


export type HotelCardProps =
    {

        name: string,
        description: string,
        location: string,
        imglink: string,
        price: number,
        rating: number,
        // facilities: string[],
        // policies: string,
        id: number,
        viewHotel: (id: number) => void,
        addToFavourites: (id: number) => void,
        shareHotel: (id: number) => void
    }

export const HotelCard: React.FC<HotelCardProps> = ({ name, description, imglink, location,
    price, rating, id, viewHotel, addToFavourites, shareHotel
}) => {
    return (
        <div className={styles['hotel-card']}>

            <img
                className={styles['hotel-image']}
                src={imglink}
                alt={name}
            />

            <div className={styles['hotel-details']}>

                <Text varient={'span'} style={{ fontWeight: 600 }}>
                    {name}
                </Text>

                <Text varient={'span'}>
                    📍 {location}
                </Text>

                <Text varient={'span'}>
                    {description}
                </Text>

                <Text varient={'span'} style={{ fontWeight: 600 }}>
                    ⭐ {rating} / 5
                </Text>

                <Text varient={'span'} style={{ fontWeight: 600 }}>
                    R{price.toLocaleString('en-ZA')} per night
                </Text>

                <Text varient={'span'} style={{ fontWeight: 600 }}>
                    Hotel Facilities
                </Text>

                {/* <Text varient={'span'}>
                    {facilities.join(' • ')}
                </Text> */}

                <Text varient={'span'} style={{ fontWeight: 600 }}>
                    Hotel Policies
                </Text>

                {/* <Text varient={'span'}>
                    {policies}
                </Text> */}


                <div className={styles['hotel-actions']}>
                    <button
                        className={`${styles['hotel-button']} ${styles['view-button']}`}
                        onClick={() => viewHotel(id)}
                    >
                        View details
                    </button>

                    <button
                        className={`${styles['hotel-button']} ${styles['favourite-button']}`}
                        onClick={() => addToFavourites(id)}
                    >
                        ♡ Favourite
                    </button>

                    <button
                        className={`${styles['hotel-button']} ${styles['share-button']}`}
                        onClick={() => shareHotel(id)}
                    >
                        ↗ Share
                    </button>
                </div>

            </div>
        </div>
    )
}

export default HotelCard
