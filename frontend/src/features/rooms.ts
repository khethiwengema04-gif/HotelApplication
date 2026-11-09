
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface Room {
    id: number;
    hotel_id: number;
    name: string;
    description: string;
    capacity: number;
    price_per_night: number;
    total_rooms: number;
}

interface RoomInput {
    name: string;
    description: string;
    capacity: number;
    price_per_night: number;
    total_rooms: number;
}

interface RoomsState {
    rooms: Room[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
}

const initialState: RoomsState = {
    rooms: [],
    isLoading: false,
    isSaving: false,
    error: null,
};

// GET rooms belonging to a hotel
export const fetchRooms = createAsyncThunk<
    Room[],
    string,
    { rejectValue: string }
>(
    "rooms/fetchRooms",
    async (hotelId, api) => {
        try {
            const results = await axios.get(
                `/api/rooms/hotels/${hotelId}/rooms`
            );

            const data = Array.isArray(results.data)
                ? results.data
                : results.data.rooms ?? [];

            return data as Room[];

        } catch (error: unknown) {
            const serverMessage = axios.isAxiosError(error)
                ? error.response?.data?.message ||
                error.message ||
                "Failed to load rooms"
                : "Failed to load rooms";

            return api.rejectWithValue(serverMessage);
        }
    }
);

// POST create room
export const createRoom = createAsyncThunk<
    void,
    { hotelId: string; roomData: RoomInput },
    { rejectValue: string }
>(
    "rooms/createRoom",
    async ({ hotelId, roomData }, api) => {
        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `/api/rooms/hotels/${hotelId}/rooms`,
                roomData,
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
                "Failed to create room"
                : "Failed to create room";

            return api.rejectWithValue(serverMessage);
        }
    }
);

// PUT update room
export const updateRoom = createAsyncThunk<
    void,
    { roomId: number; roomData: RoomInput },
    { rejectValue: string }
>(
    "rooms/updateRoom",
    async ({ roomId, roomData }, api) => {
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `/api/rooms/${roomId}`,
                roomData,
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
                "Failed to update room"
                : "Failed to update room";

            return api.rejectWithValue(serverMessage);
        }
    }
);

// DELETE room
export const deleteRoom = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>(
    "rooms/deleteRoom",
    async (roomId, api) => {
        try {
            const token = localStorage.getItem("token");

            await axios.delete(
                `/api/rooms/${roomId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return roomId;

        } catch (error: unknown) {
            const serverMessage = axios.isAxiosError(error)
                ? error.response?.data?.message ||
                error.message ||
                "Failed to delete room"
                : "Failed to delete room";

            return api.rejectWithValue(serverMessage);
        }
    }
);

export const roomsSlice = createSlice({
    name: "rooms",
    initialState,

    reducers: {},

    extraReducers: (build) => {
        build
            // Fetch rooms
            .addCase(fetchRooms.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })

            .addCase(fetchRooms.fulfilled, (state, action) => {
                state.isLoading = false;
                state.rooms = action.payload;
            })

            .addCase(fetchRooms.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload || "Failed to load rooms";
            })

            // Create room
            .addCase(createRoom.pending, (state) => {
                state.isSaving = true;
                state.error = null;
            })

            .addCase(createRoom.fulfilled, (state) => {
                state.isSaving = false;
            })

            .addCase(createRoom.rejected, (state, action) => {
                state.isSaving = false;
                state.error =
                    action.payload || "Failed to create room";
            })

            // Update room
            .addCase(updateRoom.pending, (state) => {
                state.isSaving = true;
                state.error = null;
            })

            .addCase(updateRoom.fulfilled, (state) => {
                state.isSaving = false;
            })

            .addCase(updateRoom.rejected, (state, action) => {
                state.isSaving = false;
                state.error =
                    action.payload || "Failed to update room";
            })

            // Delete room
            .addCase(deleteRoom.pending, (state) => {
                state.isSaving = true;
                state.error = null;
            })

            .addCase(deleteRoom.fulfilled, (state, action) => {
                state.isSaving = false;
                state.rooms = state.rooms.filter(
                    room => room.id !== action.payload
                );
            })

            .addCase(deleteRoom.rejected, (state, action) => {
                state.isSaving = false;
                state.error =
                    action.payload || "Failed to delete room";
            });
    },
});

export default roomsSlice.reducer;
