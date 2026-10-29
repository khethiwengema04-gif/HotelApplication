import React from 'react';
import axios from 'axios';
import styles from './LogIn.module.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import type { RootState } from '../../../store';
import { loginThunk } from '../../../features/login';
import { setEmail, setpassword, setRole } from '../../../features/register';

interface AuthResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: 'Admin' | 'User';
    };
    message?: string;
}

const Login = () => {
    const email = useSelector(
        (state: RootState) => state.register.email
    );

    const password = useSelector(
        (state: RootState) => state.register.password
    );

    const role = useSelector(
        (state: RootState) => state.register.role
    );

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const goToUserPage = (userRole: string) => {
        if (userRole === 'Admin') {
            navigate('/admin');
        } else if (userRole === 'User') {
            navigate('/home');
        } else {
            alert('Invalid user role.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const loginUser = await dispatch(
            loginThunk({ email, password }) as any
        );

        if (loginThunk.fulfilled.match(loginUser)) {
            const userRole = loginUser.payload.user.role;

            if (role !== userRole) {
                alert('The selected role does not match your account.');
                return;
            }

            goToUserPage(userRole);
        } else if (loginThunk.rejected.match(loginUser)) {
            alert(
                (loginUser.payload as string) ||
                'Invalid email or password'
            );
        }
    };

    const handleGoogleSuccess = async (
        credentialResponse: CredentialResponse
    ) => {
        if (!credentialResponse.credential) {
            alert('Google did not return a credential. Please try again.');
            return;
        }

        try {
            const response = await axios.post<AuthResponse>(
                '/api/users/google',
                {
                    credential: credentialResponse.credential
                }
            );

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            goToUserPage(user.role);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(
                    error.response?.data?.message ||
                    'Google login failed. Please try again.'
                );
            } else {
                alert('Something went wrong during Google login.');
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginForm}>
                <h1 className={styles.tittle}>LOG IN</h1>

                <form onSubmit={handleSubmit}>
                    <div className={styles.email}>
                        <label>Email Address:</label>
                        <input
                            type="email"
                            className={styles.emailInput}
                            value={email}
                            onChange={(e) =>
                                dispatch(setEmail(e.target.value))
                            }
                            required
                        />
                    </div>

                    <div className={styles.password}>
                        <label>Password:</label>
                        <input
                            type="password"
                            className={styles.passwordInput}
                            value={password}
                            onChange={(e) =>
                                dispatch(setpassword(e.target.value))
                            }
                            required
                        />
                    </div>

                    <div className={styles.email}>
                        <label>Choose Role:</label>
                        <select
                            value={role}
                            onChange={(e) =>
                                dispatch(
                                    setRole(e.target.value as 'Admin' | 'User')
                                )
                            }
                            required
                        >
                            <option value="User">User</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className={styles.loginBtn}
                    >
                        LOGIN
                    </button>
                </form>

                <div className={styles.googleSection}>
                    <p>Or continue with</p>

                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() =>
                            alert('Google sign-in was unsuccessful.')
                        }
                        text="continue_with"
                        shape="rectangular"
                        theme="outline"
                        width="280"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;