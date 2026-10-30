import styles from './landing.module.css'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../../../store'
import { fetchHotels } from '../../../features/hotels'
import Navbar from '../../navbar/navbar'
import Hotel_Inspo from '../../../assets/Hotel_Inspo.png'
import { HotelContainer } from '../../hotelContainer/hotelContainer'

type Favourite = {
    hotel_id: number
}

export const Landing = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const { hotels, isLoading, error } = useSelector(
        (state: RootState) => state.hotels
    )

    const [favouriteHotelIds, setFavouriteHotelIds] = useState<number[]>([])
    const [favouriteError, setFavouriteError] = useState('')

    useEffect(() => {
        dispatch(fetchHotels())
    }, [dispatch])

    useEffect(() => {
        const token = localStorage.getItem('token')

        // Guests can browse hotels without logging in.
        if (!token) {
            setFavouriteHotelIds([])
            return
        }

        const loadFavourites = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:5000/api/favourites',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                const favourites: Favourite[] =
                    response.data.favourites ?? []

                setFavouriteHotelIds(
                    favourites
                        .map((favourite) => Number(favourite.hotel_id))
                        .filter((id) => Number.isSafeInteger(id) && id > 0)
                )
            } catch (error) {
                console.error('Failed to load favourites:', error)
                setFavouriteError('Could not load your favourites.')
            }
        }

        loadFavourites()
    }, [])

    const handleLogin = () => navigate('/login')
    const handleRegister = () => navigate('/register')

    const viewHotel = (id: number) => {
        navigate(`/hotels/${id}`)
    }

    const addToFavourites = async (hotelId: number) => {
        const token = localStorage.getItem('token')

        if (!token) {
            navigate('/login')
            return
        }

        setFavouriteError('')

        const alreadyFavourite = favouriteHotelIds.includes(hotelId)

        try {
            if (alreadyFavourite) {
                await axios.delete(
                    `http://localhost:5000/api/favourites/${hotelId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                setFavouriteHotelIds((previous) =>
                    previous.filter((id) => id !== hotelId)
                )
            } else {
                await axios.post(
                    `http://localhost:5000/api/favourites/${hotelId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                setFavouriteHotelIds((previous) =>
                    previous.includes(hotelId)
                        ? previous
                        : [...previous, hotelId]
                )
            }
        } catch (error) {
            console.error('Favourite action failed:', error)

            if (axios.isAxiosError(error)) {
                setFavouriteError(
                    error.response?.data?.message ??
                    'Could not update favourites. Please try again.'
                )
            } else {
                setFavouriteError(
                    'Could not update favourites. Please try again.'
                )
            }
        }
    }

    const shareHotel = async (id: number) => {
        const url = `${window.location.origin}/hotels/${id}`

        try {
            await navigator.clipboard.writeText(url)
            alert('Hotel link copied!')
        } catch {
            navigate(`/hotels/${id}`)
        }
    }

    return (
        <>
            <div className={styles.landing}>
                <Navbar />

                <div className={styles.imageContainer}>
                    <img
                        src={Hotel_Inspo}
                        alt="Hotel inspiration"
                        className={styles.hotelImg}
                    />

                    <div className={styles.buttonGroup}>
                        <button
                            className={styles.loginBtn}
                            onClick={handleLogin}
                        >
                            Login
                        </button>

                        <button
                            className={styles.registerBtn}
                            onClick={handleRegister}
                        >
                            Register
                        </button>
                    </div>
                </div>

                <h1>Welcome to our NESTOVA Hotel site</h1>
                <p>Thank you for believing in us!!!</p>
                <h2>Explore Our Hotels</h2>
            </div>

            {isLoading && <p>Loading hotels...</p>}
            {error && <p>Error: {error}</p>}
            {favouriteError && <p role="alert">{favouriteError}</p>}

            {!isLoading && !error && (
                <HotelContainer
                    hotels={hotels}
                    favouriteHotelIds={favouriteHotelIds}
                    viewHotel={viewHotel}
                    addToFavourites={addToFavourites}
                    shareHotel={shareHotel}
                />
            )}
        </>
    )
}

export default Landing
