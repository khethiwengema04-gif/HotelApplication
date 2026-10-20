import { query } from "../config/database";
import type {
    CreateRoomTypeInput, UpdateRoomTypeInput
} from "../types/roomTypes"

// Create a room type for a hotel
export const createRoomService = async (
    hotelId: number,
    data: CreateRoomTypeInput
) => {
    const result = await query(
        `INSERT INTO room_types
         (hotel_id, name, description, capacity,
          price_per_night, total_rooms)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
            hotelId,
            data.name,
            data.description ?? null,
            data.capacity,
            data.price_per_night,
            data.total_rooms
        ]
    );

    return result.rows[0];
};

// Get all room types for a hotel
export const findRoomsByHotelService = async (
    hotelId: number
) => {
    const result = await query(
        `SELECT *
         FROM room_types
         WHERE hotel_id = $1
         ORDER BY created_at DESC`,
        [hotelId]
    );

    return result.rows;
};

// Get one room type
export const findRoomByIdService = async (
    id: number
) => {
    const result = await query(
        `SELECT *
         FROM room_types
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
};

// Update a room type
export const updateRoomService = async (
    id: number,
    data: UpdateRoomTypeInput
) => {
    const fields: string[] = [];
    const values: unknown[] = [];

    const allowedFields = ["name", "description", "capacity",
        "price_per_night", "total_rooms"] as const;

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            values.push(data[field]);
            fields.push(`${field} = $${values.length}`);
        }
    }

    if (fields.length === 0) {
        return findRoomByIdService(id);
    }

    values.push(id);

    const result = await query(
        `UPDATE room_types
         SET ${fields.join(", ")}
         WHERE id = $${values.length}
         RETURNING *`,
        values
    );

    return result.rows[0] || null;
};

// Delete a room type
export const deleteRoomService = async (
    id: number
) => {
    const result = await query(
        `DELETE FROM room_types
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return result.rows[0] || null;
};
