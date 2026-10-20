import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import type { User } from './register'



export interface loginState {
    user: User | null
    isloading: boolean
    error: string | null
}

const initialState: loginState = {
    user: null,
    isloading: false,
    error: null,
}

// post thunk

export const loginThunk = createAsyncThunk(
    'auth/loginUser',
    async (userDetail: { email: string; password: Required<User>['password'] }, api) => {
        try {
            const results = await axios.post<User[]>
                ('api/login', userDetail)
            if (results.data.length === 0) {
                return api.rejectWithValue("invalid info")
            }
            return results.data[0]
        }
        catch (error: any) {
            return api.rejectWithValue(error.message || 'error ocurred')
        }
    }
)

export const loginSlice = createSlice({
    name: 'login',
    initialState,

    reducers: {

    },

    extraReducers: (build) => {
        build
            .addCase(loginThunk.pending, (state) => {
                state.isloading = true
                state.error = null
            })

            .addCase(loginThunk.fulfilled, (state, action) => {
                state.isloading = false
                state.user = action.payload
            })


            .addCase(loginThunk.rejected, (state, action) => {
                state.isloading = false
                state.error = action.payload as string
            })
    }


})

export const { } = loginSlice.actions
export default loginSlice.reducer
