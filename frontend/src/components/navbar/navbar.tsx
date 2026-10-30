import styles from './Navbar.module.css'
import { Text } from '../text/text'
import profile from '../../assets/profileIcon.webp'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
    const navigate = useNavigate();
    const navigateToProfile = () => {
        navigate('/profile');
    };


    return (
        <nav>
            <div className={styles.nav}>
                <Text varient={'h1'} style={{ margin: 0 }}>NESTOVA</Text>
                <img onClick={navigateToProfile} src={profile} alt='profile' className={styles.profileImg} />

            </div>
        </nav>
    )
}
