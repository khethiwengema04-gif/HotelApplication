import { query } from "../config/database";

// Create a hotel listing (Admin Only)
export const createHotelService = async (
    name: string,
    location: string,
    description: string,
    facilities: string[],
    policies: string,
    price: number,
    images: string[],
    star_rating: number
) => {
    const result = await query(
        `INSERT INTO hotels 
        (name, location, description, facilities, policies, price, images, star_rating)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
            name,
            location,
            description,
            facilities,
            policies,
            price,
            images,
            star_rating
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
export const findHotelByIdService = async (id: number) => {
    const result = await query(
        `SELECT *
         FROM hotels
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
};

// Update hotel details 
export const updateHotelService = async (
    id: number,
    name: string,
    location: string,
    description: string,
    facilities: string[],
    policies: string,
    price: number,
    images: string[],
    star_rating: number
) => {
    const result = await query(
        `UPDATE hotels
         SET name = $1,
             location = $2,
             description = $3,
             facilities = $4,
             policies = $5,
             price = $6,
             images = $7,
             star_rating = $8
         WHERE id = $9
         RETURNING *`,
        [
            name,
            location,
            description,
            facilities,
            policies,
            price,
            images,
            star_rating,
            id
        ]
    );

    return result.rows[0] || null;
};

export const deleteHotelService = async (id: number) => {
    const result = await query(
        `DELETE FROM hotels 
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return result.rows[0] || null;
};
