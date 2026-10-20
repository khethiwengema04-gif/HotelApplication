import { Request, Response } from "express";
import {
    createHotelService,
    findAllHotelsService,
    findHotelByIdService,
    updateHotelService,
    deleteHotelService
} from "../service/hotelsService";

// CREATE HOTEL (Admin Only)
export const createHotel = async (req: Request, res: Response) => {
    try {
        const {
            name,
            location,
            description,
            facilities,
            policies,
            price,
            images,
            star_rating
        } = req.body;

        if (!name || !location) {
            return res.status(400).json({
                message: "Hotel name, address, price, and rooms are required"
            });
        }

        const hotel = await createHotelService(
            name,
            location,
            description,
            facilities,
            policies,
            price,
            images,
            star_rating
        );

        return res.status(201).json({
            message: "Hotel added successfully",
            hotel
        });
    } catch (error) {
        console.error("Create hotel error:", error);
        return res.status(500).json({
            message: "Failed to create hotel listing"
        });
    }
};

// GET ALL HOTELS (Public View)
export const getAllHotels = async (req: Request, res: Response) => {
    try {
        const hotels = await findAllHotelsService();
        return res.status(200).json(hotels);
    } catch (error) {
        console.error("Error fetching hotels:", error);
        return res.status(500).json({
            message: "Internal server error mapping hotel indices"
        });
    }
};

// GET HOTEL BY ID 
export const getHotelById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: "Valid Hotel ID parameter reference required"
            });
        }

        const hotel = await findHotelByIdService(id);

        if (!hotel) {
            return res.status(404).json({
                message: "Hotel listing profile match not found"
            });
        }

        return res.status(200).json(hotel);
    } catch (error) {
        console.error("Error fetching hotel profile by id:", error);
        return res.status(500).json({
            message: "Failed to retrieve specific accommodation profile details"
        });
    }
};

// UPDATE HOTEL (Admin Only)

export const updateHotel = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const {
            name,
            description,
            location,
            star_rating,
            price,
            facilities,
            policies,
            images
        } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "A valid Hotel ID is required"
            });
        }

        const hotelExists = await findHotelByIdService(id);

        if (!hotelExists) {
            return res.status(404).json({
                message: "Hotel not found"
            });
        }

        const updatedHotel = await updateHotelService(
            id,
            name,
            location,
            description,
            facilities,
            policies,
            price,
            images,
            star_rating
        );

        return res.status(200).json({
            message: "Hotel updated successfully",
            hotel: updatedHotel
        });

    } catch (error) {
        console.error("Update hotel error:", error);

        return res.status(500).json({
            message: "Failed to modify hotel configurations data profile"
        });
    }
};


// DELETE HOTEL (Admin Only)
export const deleteHotel = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                message: "Target Hotel ID execution parameter required"
            });
        }

        const deletedHotel = await deleteHotelService(id);

        if (!deletedHotel) {
            return res.status(404).json({
                message: "Target accommodation match not found in catalog"
            });
        }

        return res.status(200).json({
            message: "Hotel listing completely pruned from registration directories successfully"
        });
    } catch (error) {
        console.error("Delete hotel compilation failure error tracing:", error);
        return res.status(500).json({
            message: "Failed to strip accommodation row entity out from systems records"
        });
    }
};
