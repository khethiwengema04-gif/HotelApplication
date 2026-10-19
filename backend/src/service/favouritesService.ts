import { query } from "../config/database";

export const createFavouriteService = async (
    userId: number,
    hotelId: number
) => {
    const result = await query(
        `INSERT INTO favourites (user_id, hotel_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, hotel_id) DO NOTHING
         RETURNING *`,
        [userId, hotelId]
    );

    return result.rows[0] ?? null;
};

export const findMyFavouritesService = async (
    userId: number
) => {
    const result = await query(
        `SELECT
            f.id,
            f.user_id,
            f.hotel_id,
            f.created_at,
            h.name,
            h.location,
            h.description,
            h.price,
            h.images,
            h.star_rating
         FROM favourites f
         JOIN hotels h ON h.id = f.hotel_id
         WHERE f.user_id = $1
         ORDER BY f.created_at DESC`,
        [userId]
    );

    return result.rows;
};

export const deleteFavouriteService = async (
    userId: number,
    hotelId: number
) => {
    const result = await query(
        `DELETE FROM favourites
         WHERE user_id = $1 AND hotel_id = $2
         RETURNING *`,
        [userId, hotelId]
    );

    return result.rows[0] ?? null;
};