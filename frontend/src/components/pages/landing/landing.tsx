import styles from './Landing.module.css'
import { useNavigate } from 'react-router-dom'

export const Landing = () => {

    const navigate = useNavigate();
    const handleStart = () => {
        navigate('/login')
    }
    return (
        <div className={styles.landing}>

            <h1>Welcome to the Hotel</h1>
            <p>Thank you for believing in us!!!</p>

            {/* <button className={styles.startBtn} onClick={handleStart}>
                Get Started
            </button> */}
        </div>
    )
}

export default Landing