import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

export interface User {
    id?: string
    name: string,
    email: string,
    password: string,
    role?: 'Admin' | 'User'
}

export interface RegisterState extends User {
    isloading: boolean
    error: string | null
}

const initialState: RegisterState = {
    name: '',
    email: '',
    password: '',
    role: 'User',
    isloading: false,
    error: null,
}

//thunk
export const registerThunk = createAsyncThunk(
    'auth/registerUser',
    async (userInfo: Omit<User, 'id'>, api) => {
        try {
            const results = await axios.post('http://localhost:5000/users', userInfo)
            return results.data
        }
        catch (error: any) {
            return api.rejectWithValue(error.message || 'error ocurred')

        }
    }
)

export const registerSlice = createSlice({
    name: 'register',
    initialState,

    reducers: {

        setName: (state, action: PayloadAction<string>) => {
            state.name = action.payload
        },

        setEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload
        },

        setpassword: (state, action: PayloadAction<string>) => {
            state.password = action.payload
        },

    },

    extraReducers: (build) => {
        build
            .addCase(registerThunk.pending, (state) => {
                state.isloading = true
                state.error = null
            })

            .addCase(registerThunk.fulfilled, (state) => {
                state.isloading = false
            })


            .addCase(registerThunk.rejected, (state, action) => {
                state.isloading = false
                state.error = action.payload as string
            })

    }

})

export const { setName, setEmail, setpassword } = registerSlice.actions
export default registerSlice.reducer