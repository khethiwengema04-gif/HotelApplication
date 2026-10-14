import { Router } from "express";
import {
    createHotel,
    getAllHotels,
    getHotelById,
    updateHotel,
    deleteHotel
} from "../controllers/hotelsController"
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/hotelsMiddleware"

const router = Router();

router.post("/", protect, isAdmin, createHotel);
router.get("/", getAllHotels);
router.get("/:id", getHotelById);
router.put("/:id", protect, isAdmin, updateHotel);
router.delete("/:id", protect, isAdmin, deleteHotel);

export default router;
