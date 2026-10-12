import styles from './Registering.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import {
    registerThunk,
    setName,
    setEmail,
    setpassword,
} from '../../../features/register'



const Register = () => {
    const { name, email, password } = useSelector(
        (state: RootState) => state.register
    );
    const navigate = useNavigate();
    const navigateToHome = () => {
        navigate("/home")
    }

    const dispatch = useDispatch()
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const registerUser = await dispatch(registerThunk({ name, email, password }) as any)
        if (registerThunk.fulfilled.match(registerUser)) {
            alert('succesfully registered')
            navigate('/home')
        }
    }

    return (
        <div className={styles.container}>

            <div className="header">
                <h1 className="text">Register</h1>
                <div className="underline"></div>
            </div>
            <form onSubmit={handleFormSubmit}>
                <div className="inputs" >
                    <div className="name">
                        <p>Full Names</p>
                        <input type="text" value={name} onChange={(e) => dispatch(setName(e.target.value))} />
                    </div>


                    <div className="email">
                        <p>Email</p>
                        <input type="text" value={email} onChange={(e) => dispatch(setEmail(e.target.value))} />
                    </div>

                    <div className="password">
                        <p>Password</p>
                        <input type="text" value={password} onChange={(e) => dispatch(setpassword(e.target.value))} />
                    </div>

                    <button className={styles.registerBtn} type="submit">
                        REGISTER
                    </button>

                </div>
            </form>

        </div>
    )
}

export default Register