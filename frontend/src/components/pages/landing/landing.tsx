
import styles from './landing.module.css'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../../../store'
import { fetchHotels } from '../../../features/hotels'
import Navbar from '../../navbar/navbar'
import Hotel_Inspo from '../../../assets/Hotel_Inspo.png'
import { HotelContainer } from '../../hotelContainer.tsx/hotelContainer'
import HotelCard from '../../cards/cards'

export const Landing = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const { hotels, isLoading, error } = useSelector(
        (state: RootState) => state.hotels
    )

    useEffect(() => {
        dispatch(fetchHotels())
    }, [dispatch])

    const handleLogin = () => {
        navigate('/login')
    }

    const handleRegister = () => {
        navigate('/register')
    }

    const viewHotel = (id: number) => {
        navigate(`/hotels/${id}`)
    }

    const addToFavourites = (id: number) => {
        navigate(`/hotels/${id}`)
    }

    const shareHotel = (id: number) => {
        navigate(`/hotels/${id}`)
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

            {!isLoading && !error && (
                <HotelContainer
                    hotels={hotels}
                    viewHotel={viewHotel}
                    addToFavourites={addToFavourites}
                    shareHotel={shareHotel}
                />
            )}

        </>

    )
}

export default Landing
