import { Request, Response } from "express";
import {
    createFavouriteService,
    findMyFavouritesService,
    deleteFavouriteService
} from "../service/favouritesService";

const validId = (
    value: string | string[] | undefined
): number | null => {
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
        return null;
    }

    const id = Number(value);

    return Number.isSafeInteger(id) ? id : null;
};

export const addFavourite = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const hotelId = validId(req.params.hotelId);

        if (hotelId === null) {
            return res.status(400).json({
                message: "Invalid hotel ID"
            });
        }

        const favourite = await createFavouriteService(
            req.user.id,
            hotelId
        );

        if (!favourite) {
            return res.status(409).json({
                message: "This hotel is already in your favourites"
            });
        }

        return res.status(201).json({
            message: "Hotel added to favourites successfully",
            favourite
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "";

        if (message.includes("favourites_hotel_id_fkey")) {
            return res.status(404).json({
                message: "Hotel not found"
            });
        }

        console.error("Add favourite error:", error);

        return res.status(500).json({
            message: "Failed to add hotel to favourites"
        });
    }
};

export const getMyFavourites = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const favourites = await findMyFavouritesService(
            req.user.id
        );

        return res.status(200).json({
            message: "Favourites retrieved successfully",
            favourites
        });
    } catch (error) {
        console.error("Get favourites error:", error);

        return res.status(500).json({
            message: "Failed to retrieve favourites"
        });
    }
};

export const removeFavourite = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const hotelId = validId(req.params.hotelId);

        if (hotelId === null) {
            return res.status(400).json({
                message: "Invalid hotel ID"
            });
        }

        const favourite = await deleteFavouriteService(
            req.user.id,
            hotelId
        );

        if (!favourite) {
            return res.status(404).json({
                message: "Favourite not found"
            });
        }

        return res.status(200).json({
            message: "Hotel removed from favourites successfully"
        });
    } catch (error) {
        console.error("Remove favourite error:", error);

        return res.status(500).json({
            message: "Failed to remove hotel from favourites"
        });
    }
};