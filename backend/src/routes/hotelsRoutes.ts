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
import { uploadImage } from "../middleware/hotelsMiddleware";
const router = Router();

router.post("/", protect, isAdmin, createHotel);
router.get("/", getAllHotels);
router.get("/:id", getHotelById);
router.put("/:id", protect, isAdmin, updateHotel);
router.delete("/:id", protect, isAdmin, deleteHotel);
router.post(
    "/",
    protect,
    isAdmin,
    uploadImage.array("images", 5),
    createHotel
);

router.put(
    "/:id",
    protect,
    isAdmin,
    uploadImage.array("images", 5),
    updateHotel
);
export default router;
