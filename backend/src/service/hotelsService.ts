import { query } from "../config/database";

// Create a hotel listing (Admin Only)
export const createHotelService = async (
    name: string,
    description: string,
    location: string,
    starRating: number,
    price: number,
    images: string[]
) => {
    const result = await query(
        `INSERT INTO hotels 
        (name, description, location, star_rating, image_url, price)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            name,
            description,
            location,
            starRating,
            price,
            JSON.stringify(images),

        ]
    );

    return result.rows[0];
};

// Find all hotels 
export const findAllHotelsService = async () => {
    const { rows } = await query(
        `SELECT *
         FROM hotels 
         ORDER BY created_at DESC`
    );

    return rows;
};

// Find hotel by ID
export const findHotelByIdService = async (hotelId: number) => {
    const result = await query(
        `SELECT *
         FROM hotels
         WHERE id = $1`,
        [hotelId]
    );

    return result.rows[0] || null;
};

// Update hotel details 
export const updateHotelService = async (
    hotelId: number,
    name: string,
    description: string,
    address: string,
    starRating: number,
    basePricePerNight: number,
    totalRooms: number,
    availableRooms: number,
    policies: object,
    images: string[]
) => {
    const result = await query(
        `UPDATE hotels 
         SET name = $1, description = $2, location = $3,  
             star_rating = $4, total_rooms = $5, available_rooms = $6,
             policies = $7, images = $8
         WHERE id = $10
         RETURNING *`,
        [
            name,
            description,
            address,
            starRating,
            totalRooms,
            availableRooms,
            JSON.stringify(policies),
            JSON.stringify(images),
            hotelId
        ]
    );

    return result.rows[0] || null;
};

export const deleteHotelService = async (hotelId: number) => {
    const result = await query(
        `DELETE FROM hotels 
         WHERE id = $1
         RETURNING *`,
        [hotelId]
    );

    return result.rows[0] || null;
};
