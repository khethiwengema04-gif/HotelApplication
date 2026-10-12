import styles from './Landing.module.css'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../navbar/navbar'
import Hotel_Inspo from '../../../assets/Hotel_Inspo.webp'

export const Landing = () => {

    const navigate = useNavigate();
    const handleStart = () => {
        navigate('/login')
    }
    return (
        <div className={styles.landing}>
            <Navbar />

            <img src={Hotel_Inspo} alt='shoppingIcon' className={styles.shoppingImg} />

            <h1>Welcome to the Hotel</h1>
            <p>Thank you for believing in us!!!</p>

            {/* <button className={styles.startBtn} onClick={handleStart}>
                Get Started
            </button> */}
        </div>
    )
}

export default Landing