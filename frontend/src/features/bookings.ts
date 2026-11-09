
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Booking information sent to the backend
interface BookingInput {
    room_type_id: number;
    check_in: string;
    check_out: string;
    rooms_booked: number;
    guest_count: number;
    special_requests?: string;
}

interface BookingsState {
    isLoading: boolean;
    error: string | null;
}

const initialState: BookingsState = {
    isLoading: false,
    error: null,
};

// CREATE booking thunk
export const createBooking = createAsyncThunk<
    void,
    BookingInput,
    { rejectValue: string }
>(
    "bookings/createBooking",
    async (bookingData, api) => {
        try {
            const token = localStorage.getItem("token");

            await axios.post(
                "/api/bookings",
                bookingData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

        } catch (error: unknown) {
            const serverMessage = axios.isAxiosError(error)
                ? error.response?.data?.message ||
                error.message ||
                "Booking failed. Please try again."
                : "Booking failed. Please try again.";

            return api.rejectWithValue(serverMessage);
        }
    }
);

export const bookingsSlice = createSlice({
    name: "bookings",
    initialState,

    reducers: {},

    extraReducers: (build) => {
        build
            .addCase(createBooking.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })

            .addCase(createBooking.fulfilled, (state) => {
                state.isLoading = false;
            })

            .addCase(createBooking.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload ||
                    "Booking failed. Please try again.";
            });
    },
});

export default bookingsSlice.reducer;
