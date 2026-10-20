
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { Hotel } from "../types";

interface HotelsState {
    hotels: Hotel[];
    isLoading: boolean;
    error: string | null;
}

const initialState: HotelsState = {
    hotels: [],
    isLoading: false,
    error: null,
};

// GET thunk
export const fetchHotels = createAsyncThunk(
    "hotels/fetchHotels",
    async (_, api) => {
        try {
            const results = await axios.get<Hotel[]>("/api/hotels");
            return results.data;
        } catch (error: any) {
            const serverMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to load hotels";

            return api.rejectWithValue(serverMessage);
        }
    }
);

export const hotelsSlice = createSlice({
    name: "hotels",
    initialState,

    reducers: {},

    extraReducers: (build) => {
        build
            .addCase(fetchHotels.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })

            .addCase(fetchHotels.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hotels = action.payload;
            })

            .addCase(fetchHotels.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    (action.payload as string) ||
                    "Failed to load hotels";
            });
    },
});

export default hotelsSlice.reducer;
