import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { User } from './register'

interface ProfileState {
    user: User | null
    isLoading: boolean
    error: string | null
    message: string | null
}

const getSavedUser = (): User | null => {
    try {
        const savedUser = localStorage.getItem('user')

        if (!savedUser) {
            return null
        }

        return JSON.parse(savedUser) as User
    } catch {
        return null
    }
}

const initialState: ProfileState = {
    user: getSavedUser(),
    isLoading: false,
    error: null,
    message: null
}

// Load the currently logged-in user's saved details
export const fetchProfile = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>(
    'profile/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token')
            const savedUser = getSavedUser()

            if (!token) {
                return rejectWithValue('Please log in to view your profile.')
            }

            if (!savedUser) {
                return rejectWithValue(
                    'User details were not found. Please log in again.'
                )
            }

            return savedUser
        } catch {
            return rejectWithValue('Could not load your profile.')
        }
    }
)

// Clear profile data when the user logs out
const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        clearProfile: (state) => {
            state.user = null
            state.error = null
            state.message = null
        },

        setProfile: (state, action: PayloadAction<User>) => {
            state.user = action.payload
            localStorage.setItem('user', JSON.stringify(action.payload))
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.isLoading = false
                state.error =
                    action.payload ?? 'Could not load your profile.'
            })
    }
})

export const { clearProfile, setProfile } = profileSlice.actions

export default profileSlice.reducer
