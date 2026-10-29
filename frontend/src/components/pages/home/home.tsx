import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../../store'

import Navbar from '../../navbar/navbar'
import { HotelContainer } from '../../hotelContainer/hotelContainer'
import { fetchHotels } from '../../../features/hotels'
import { Search } from '../../Search/Search'
import styles from './home.module.css'

const Home = () => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()

    const hotelsState = useSelector((state: RootState) => state.hotels)

    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        dispatch(fetchHotels())
    }, [dispatch])

    const hotels = useMemo(() => {
        const allHotels = hotelsState.hotels ?? []
        const search = searchTerm.trim().toLowerCase()

        if (!search) return allHotels

        return allHotels.filter((hotel) =>
            [hotel.name, hotel.location, hotel.description]
                .some((value) => value?.toLowerCase().includes(search))
        )
    }, [hotelsState.hotels, searchTerm])

    const viewHotel = (hotelId: number) => {
        navigate(`/hotels/${hotelId}`)
    }

    const addToFavourites = (hotelId: number) => {
        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        navigate(`/hotels/${hotelId}`)
        // We can connect this to your favourites API next.
    }

    const shareHotel = async (hotelId: number) => {
        const hotelUrl = `${window.location.origin}/hotels/${hotelId}`

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Discover NESTOVA',
                    url: hotelUrl
                })
            } else {
                await navigator.clipboard.writeText(hotelUrl)
                alert('Hotel link copied!')
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                alert('Unable to share this hotel. Please try again.')
            }
        }
    }

    return (
        <div className={styles.homePage}>
            <Navbar />

            <main className={styles.homeContent}>
                <section className={styles.welcome}>
                    <p className={styles.eyebrow}>WELCOME TO NESTOVA</p>
                    <h1>Find your perfect stay</h1>
                    <p>
                        Explore our hotels, discover comfortable rooms,
                        and plan your next getaway.
                    </p>

                    <Search onSearch={(value: string) => setSearchTerm(value)} />
                </section>

                <section className={styles.hotelsSection}>
                    <div className={styles.sectionHeading}>
                        <div>
                            <p className={styles.eyebrow}>EXPLORE OUR COLLECTION</p>
                            <h2>Hotels for your next stay</h2>
                        </div>

                        {!hotelsState.isLoading && (
                            <span>
                                {hotels.length} hotel{hotels.length === 1 ? '' : 's'}
                            </span>
                        )}
                    </div>

                    {hotelsState.isLoading ? (
                        <p className={styles.message}>Loading hotels...</p>
                    ) : hotelsState.error ? (
                        <p className={styles.error}>
                            {String(hotelsState.error)}
                        </p>
                    ) : hotels.length === 0 ? (
                        <p className={styles.message}>
                            No hotels found. Try another search.
                        </p>
                    ) : (
                        <HotelContainer
                            hotels={hotels}
                            favouriteHotelIds={[]}
                            viewHotel={viewHotel}
                            addToFavourites={addToFavourites}
                            shareHotel={shareHotel}
                        />
                    )}
                </section>
            </main>
        </div>
    )
}

export default Home
