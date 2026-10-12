import React from 'react'
import styles from './LogIn.module.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { loginThunk } from '../../../features/login'
import {
    setEmail,
    setpassword
} from '../../../features/register'


const login = () => {

    const email = useSelector((state: RootState) => state.register.email)
    const password = useSelector((state: RootState) => state.register.password)


    // export const Log = () => {
    const navigate = useNavigate();

    const dispatch = useDispatch()
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const loginUser = await dispatch(loginThunk({ email, password }) as any)
        if (loginThunk.fulfilled.match(loginUser)) {
            alert('Log In')
            navigate('/home')
        }
        if (loginThunk.rejected.match(loginUser)) {
            alert(loginUser.payload as string || "Invalid password")

        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.loginForm}>
                <h1 className={styles.tittle}>LOG IN</h1>

                <form onSubmit={handleSubmit}>

                    <div className={styles.email}>
                        <label>Email Adress:</label>
                        <input type="email" className={styles.emailInput}
                            value={email}
                            onChange={(e) => dispatch(setEmail(e.target.value))} />
                    </div>


                    <div className={styles.password}>
                        <label>Password:</label>
                        <input type="password" className={styles.passwordInput}
                            value={password}
                            onChange={(e) => dispatch(setpassword(e.target.value))} />
                    </div>

                    <button className={styles.loginBtn}>
                        LOGIN
                    </button>
                </form>
            </div>

        </div >
    )
}

export default login