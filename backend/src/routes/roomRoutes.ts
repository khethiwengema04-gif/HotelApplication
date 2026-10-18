import { Router } from "express";
import {
    createRoom, getRoomsByHotel, getRoomById,
    updateRoom, deleteRoom
} from "../controllers/roomController";

import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/hotelsMiddleware";

const router = Router();

router.get("/hotels/:hotelId/rooms", getRoomsByHotel);
router.get("/rooms/:id", getRoomById);
router.post("/hotels/:hotelId/rooms", protect, isAdmin, createRoom);
router.put("/rooms/:id", protect, isAdmin, updateRoom);
router.delete("/rooms/:id", protect, isAdmin, deleteRoom);

export default router;
