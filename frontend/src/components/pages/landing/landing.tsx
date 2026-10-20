import styles from './landing.module.css'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../navbar/navbar'
import Hotel_Inspo from '../../../assets/Hotel_Inspo.png'

export const Landing = () => {

    const navigate = useNavigate();
    const handleLogin = () => {
        navigate('/login')
    }
    const handleRegister = () => {
        navigate('/register')
    }
    return (
        <div className={styles.landing}>
            <Navbar />

            <div className={styles.imageContainer}>
                <img src={Hotel_Inspo} alt='shoppingIcon' className={styles.hotelImg} />

                <div className={styles.buttonGroup}>
                    <button className={styles.loginBtn} onClick={handleLogin}>
                        Login
                    </button>
                    <button className={styles.registerBtn} onClick={handleRegister}>
                        Register
                    </button>
                </div>
            </div>

            <h1>Welcome to our NESTOVA Hotel site</h1>
            <p>Thank you for believing in us!!!</p>
        </div>
    )
}

export default Landing