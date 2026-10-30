import { query } from "../config/database";
import type {
    Review,
    ReviewWithUser,
    CreateReviewInput,
    UpdateReviewInput
} from "../types/reviewTypes";

export const createReviewService = async (
    userId: number,
    data: CreateReviewInput
): Promise<Review> => {
    // It is only users with a completed booking at this hotel can review it.
    const booking = await query(
        `SELECT 1
         FROM bookings b
         JOIN room_types rt ON rt.id = b.room_type_id
         WHERE b.user_id = $1
           AND rt.hotel_id = $2
           AND b.status = 'Completed'
         LIMIT 1`,
        [userId, data.hotel_id]
    );

    if (booking.rows.length === 0) {
        throw new Error("REVIEW_REQUIRES_COMPLETED_STAY");
    }

    const result = await query(
        `INSERT INTO reviews (user_id, hotel_id, rating, comment)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, data.hotel_id, data.rating, data.comment ?? null]
    );

    return result.rows[0] as Review;
};

export const findReviewsByHotelService = async (
    hotelId: number
): Promise<ReviewWithUser[]> => {
    const result = await query(
        `SELECT r.*, u.name AS reviewer_name
         FROM reviews r
         JOIN users u ON u.id = r.user_id
         WHERE r.hotel_id = $1
         ORDER BY r.created_at DESC`,
        [hotelId]
    );

    return result.rows as ReviewWithUser[];
};

export const findReviewByIdService = async (
    id: number
): Promise<Review | null> => {
    const result = await query(
        "SELECT * FROM reviews WHERE id = $1",
        [id]
    );

    return result.rows[0] ?? null;
};

export const updateReviewService = async (
    id: number,
    userId: number,
    data: UpdateReviewInput
): Promise<Review | null> => {
    const result = await query(
        `UPDATE reviews
         SET rating = COALESCE($1, rating),
             comment = CASE
                 WHEN $2::boolean THEN $3::text
                 ELSE comment
             END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 AND user_id = $5
         RETURNING *`,
        [
            data.rating ?? null,
            Object.prototype.hasOwnProperty.call(data, "comment"),
            data.comment ?? null,
            id,
            userId
        ]
    );

    return result.rows[0] ?? null;
};

export const deleteReviewService = async (
    id: number,
    userId: number
): Promise<boolean> => {
    const result = await query(
        `DELETE FROM reviews
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, userId]
    );

    return result.rowCount !== null && result.rowCount > 0;
};