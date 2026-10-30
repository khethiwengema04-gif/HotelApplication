
import React from 'react'
import { HotelCard } from '../cards/cards'
import styles from './hotelContainer.module.css'
import type { Hotel } from '../../types'

type HotelContainerProps = {
    hotels: Hotel[]
    favouriteHotelIds: number[]
    viewHotel: (id: number) => void
    addToFavourites: (id: number) => void
    shareHotel: (id: number) => void
}

export const HotelContainer: React.FC<HotelContainerProps> = ({
    hotels,
    favouriteHotelIds,
    viewHotel,
    addToFavourites,
    shareHotel
}) => {
    return (
        <div id={styles['hotel-container']}>
            {hotels && hotels.length > 0 && hotels.map(hotel => (
                <HotelCard
                    key={hotel.id}
                    name={hotel.name}
                    description={hotel.description}
                    price={hotel.price}
                    imglink={hotel.image_url}
                    rating={hotel.rating}
                    id={hotel.id}
                    location={hotel.location}
                    isFavourite={favouriteHotelIds.includes(hotel.id)}
                    viewHotel={viewHotel}
                    addToFavourites={addToFavourites}
                    shareHotel={shareHotel}
                />
            ))}
        </div>
    )
}

export default HotelContainer
