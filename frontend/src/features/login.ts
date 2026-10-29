import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import type { User } from './register'

interface LoginResponse {
    token: string
    user: User
}

export interface loginState {
    user: User | null
    token: string | null
    isloading: boolean
    error: string | null
}

const initialState: loginState = {
    user: null,
    token: localStorage.getItem('token'),
    isloading: false,
    error: null,
}

export const loginThunk = createAsyncThunk<
    LoginResponse,
    { email: string; password: string },
    { rejectValue: string }
>(
    'auth/loginUser',
    async (userDetail, api) => {
        try {
            const response = await axios.post<LoginResponse>(
                '/api/users/login',
                userDetail
            )

            const { token, user } = response.data

            if (!token || !user) {
                return api.rejectWithValue(
                    'Invalid login response from server'
                )
            }

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            return { token, user }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return api.rejectWithValue(
                    error.response?.data?.message ||
                    'Login failed. Please check your details.'
                )
            }

            return api.rejectWithValue('An unexpected error occurred')
        }
    }
)

const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null
            state.token = null
            state.error = null

            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.isloading = true
                state.error = null
            })
            .addCase(
                loginThunk.fulfilled,
                (state, action: PayloadAction<LoginResponse>) => {
                    state.isloading = false
                    state.user = action.payload.user
                    state.token = action.payload.token
                }
            )
            .addCase(loginThunk.rejected, (state, action) => {
                state.isloading = false
                state.error =
                    action.payload || action.error.message || 'Login failed'
            })
    },
})

export const { logout } = loginSlice.actions

export default loginSlice.reducer
