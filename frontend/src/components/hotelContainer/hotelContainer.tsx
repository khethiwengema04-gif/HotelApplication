
import React from 'react'
import { HotelCard } from '../hotelCards/hotelCards'
import styles from './hotelContainer.module.css'
import type { Hotel } from '../../types'

type HotelContainerProps = {
    hotels: Hotel[],
    viewHotel: (id: number) => void
}

export const HotelContainer: React.FC<HotelContainerProps> = ({
    hotels,
    viewHotel
}) => {
    return (
        <div id={styles['hotel-container']}>
            {hotels && hotels.length > 0 && hotels.map(hotel => (
                <HotelCard
                    key={hotel.id}
                    name={hotel.name}
                    description={hotel.description}
                    price={hotel.price}
                    imglink={hotel.imglink}
                    rating={hotel.rating}
                    id={hotel.id}
                    viewHotel={viewHotel}
                />
            ))}
        </div>
    )
}

export default HotelContainer
