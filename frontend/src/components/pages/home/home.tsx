import React from 'react'
import Navbar from '../../navbar/navbar'
import { HotelContainer } from '../../hotelContainer.tsx/hotelContainer'
import { fetchHotels } from '../../../features/hotels'
import { Search } from '../../Search/Search'


const Home = () => {
    return (
        <div>
            <Navbar />
            {/* <Search onSearch={fetchHotels} /> */}

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