
import { Request, Response } from "express";
import {
    createRoomService, findRoomsByHotelService,
    findRoomByIdService, updateRoomService, deleteRoomService
} from "../service/roomService";

// CREATE ROOM 
export const createRoom = async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.hotelId);
        const {
            name,
            description,
            capacity,
            price_per_night,
            total_rooms
        } = req.body;

        if (!Number.isSafeInteger(hotelId) || hotelId <= 0) {
            return res.status(400).json({
                message: "A valid Hotel ID is required"
            });
        }

        if (
            !name ||
            !Number.isInteger(capacity) ||
            capacity <= 0 ||
            typeof price_per_night !== "number" ||
            !Number.isFinite(price_per_night) ||
            price_per_night < 0 ||
            !Number.isInteger(total_rooms) ||
            total_rooms < 0
        ) {
            return res.status(400).json({
                message: "Room name, valid capacity, price per night, and total rooms are required"
            });
        }

        const room = await createRoomService(hotelId, {
            name,
            description,
            capacity,
            price_per_night,
            total_rooms
        });

        return res.status(201).json({
            message: "Room type added successfully",
            room
        });
    } catch (error) {
        console.error("Create room error:", error);
        return res.status(500).json({
            message: "Failed to create room type"
        });
    }
};

// GET ALL ROOMS FOR A HOTEL 
export const getRoomsByHotel = async (req: Request, res: Response) => {
    try {
        const hotelId = Number(req.params.hotelId);

        if (!Number.isSafeInteger(hotelId) || hotelId <= 0) {
            return res.status(400).json({
                message: "A valid Hotel ID is required"
            });
        }

        const rooms = await findRoomsByHotelService(hotelId);

        return res.status(200).json(rooms);
    } catch (error) {
        console.error("Error fetching hotel rooms:", error);
        return res.status(500).json({
            message: "Failed to retrieve room types"
        });
    }
};

// GET ROOM BY ID 
export const getRoomById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "A valid Room ID is required"
            });
        }
        const room = await findRoomByIdService(id);

        if (!room) {
            return res.status(404).json({
                message: "Room type not found"
            });
        }

        return res.status(200).json(room);
    } catch (error) {
        console.error("Error fetching room by ID:", error);
        return res.status(500).json({
            message: "Failed to retrieve room details"
        });
    }
};

// UPDATE ROOM 
export const updateRoom = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const {
            name,
            description,
            capacity,
            price_per_night,
            total_rooms
        } = req.body;

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "A valid Room ID is required"
            });
        }

        const roomExists = await findRoomByIdService(id);

        if (!roomExists) {
            return res.status(404).json({
                message: "Room type not found"
            });
        }

        const allowedFields = [
            "name",
            "description",
            "capacity",
            "price_per_night",
            "total_rooms"
        ];

        const suppliedFields = Object.keys(req.body);

        if (
            suppliedFields.length === 0 ||
            suppliedFields.some(
                field => !allowedFields.includes(field)
            )
        ) {
            return res.status(400).json({
                message: "Provide valid room fields to update"
            });
        }

        if (
            (name !== undefined &&
                (typeof name !== "string" || !name.trim())) ||
            (description !== undefined &&
                description !== null &&
                typeof description !== "string") ||
            (capacity !== undefined &&
                (!Number.isInteger(capacity) || capacity <= 0)) ||
            (price_per_night !== undefined &&
                (typeof price_per_night !== "number" ||
                    !Number.isFinite(price_per_night) ||
                    price_per_night < 0)) ||
            (total_rooms !== undefined &&
                (!Number.isInteger(total_rooms) || total_rooms < 0))
        ) {
            return res.status(400).json({
                message: "One or more room fields are invalid"
            });
        }

        const updatedRoom = await updateRoomService(id, {
            name, description, capacity, price_per_night, total_rooms
        });

        return res.status(200).json({
            message: "Room type updated successfully",
            room: updatedRoom
        });
    } catch (error) {
        console.error("Update room error:", error);
        return res.status(500).json({
            message: "Failed to update room type"
        });
    }
};

// DELETE ROOM
export const deleteRoom = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "A valid Room ID is required"
            });
        }

        const deletedRoom = await deleteRoomService(id);

        if (!deletedRoom) {
            return res.status(404).json({
                message: "Room type not found"
            });
        }

        return res.status(200).json({
            message: "Room type deleted successfully"
        });
    } catch (error) {
        console.error("Delete room error:", error);
        return res.status(500).json({
            message: "Failed to delete room type"
        });
    }
};
