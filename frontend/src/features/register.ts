import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

export interface User {
    id?: string
    name: string,
    email: string,
    password: string,
    role: 'Admin' | 'User'
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
            const results = await axios.post('/api/users/register', userInfo);
            return results.data;
        }
        catch (error: any) {
            const serverMessage = error.response?.data?.message || error.response?.data || error.message || 'error occurred';
            return api.rejectWithValue(serverMessage);
        }
    }
);


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

        setRole: (state, action: PayloadAction<'Admin' | 'User'>) => {
            state.role = action.payload
        }

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

export const { setName, setEmail, setpassword, setRole } = registerSlice.actions
export default registerSlice.reducer