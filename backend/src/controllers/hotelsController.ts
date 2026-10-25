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
            star_rating
        } = req.body;

        if (!name || !location || price === undefined || price === "") {
            return res.status(400).json({
                message: "Hotel name, location and price are required"
            });
        }

        // Get the image URLs returned by Cloudinary
        const uploadedFiles = (req.files || []) as
            (Express.Multer.File & { path: string })[];

        const images = uploadedFiles.map(file => file.path);

        // Convert facilities from form-data text into an array
        const facilitiesArray: string[] = Array.isArray(facilities)
            ? facilities
            : typeof facilities === "string"
                ? facilities.split(",").map((item: string) => item.trim()).filter(Boolean)
                : [];

        const hotel = await createHotelService(
            name,
            location,
            description || "",
            facilitiesArray,
            policies || "",
            Number(price),
            images,
            Number(star_rating || 3)
        );

        return res.status(201).json({
            message: "Hotel added successfully",
            hotel
        });
    } catch (error) {
        console.error("Create hotel error:", error);

        return res.status(500).json({
            message: "Failed to create hotel listing",
            error: error instanceof Error ? error.message : String(error)
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

        const {
            name,
            location,
            description,
            facilities,
            policies,
            price,
            star_rating
        } = req.body;

        const uploadedFiles = (req.files || []) as
            (Express.Multer.File & { path: string })[];

        // Preserve existing images if no new files are uploaded
        const images = uploadedFiles.length > 0
            ? uploadedFiles.map(file => file.path)
            : hotelExists.images;

        const facilitiesArray: string[] = Array.isArray(facilities)
            ? facilities
            : typeof facilities === "string"
                ? facilities.split(",").map((item: string) => item.trim()).filter(Boolean)
                : hotelExists.facilities;

        const updatedHotel = await updateHotelService(
            id,
            name ?? hotelExists.name,
            location ?? hotelExists.location,
            description ?? hotelExists.description,
            facilitiesArray,
            policies ?? hotelExists.policies,
            price !== undefined && price !== ""
                ? Number(price)
                : Number(hotelExists.price),
            images,
            star_rating !== undefined && star_rating !== ""
                ? Number(star_rating)
                : hotelExists.star_rating
        );

        return res.status(200).json({
            message: "Hotel updated successfully",
            hotel: updatedHotel
        });
    } catch (error) {
        console.error("Update hotel error:", error);

        return res.status(500).json({
            message: "Failed to update hotel",
            error: error instanceof Error ? error.message : String(error)
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
