import React from 'react'
import Navbar from '../../navbar/navbar'
import { HotelContainer } from '../../hotelContainer.tsx/hotelContainer'
import { fetchHotels } from '../../../features/hotels'


const Home = () => {
    return (
        <div>
            <Navbar />
            {/* <HotelContainer
                hotels={hotels}
                viewHotel={viewHotel}
                addToFavourites={addToFavourites}
                shareHotel={shareHotel}
            /> */}

        </div>
    )
}

export default Home