import { Router } from "express";
import {
    addFavourite,
    getMyFavourites,
    removeFavourite
} from "../controllers/favouritesController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/:hotelId", protect, addFavourite);
router.get("/", protect, getMyFavourites);
router.delete("/:hotelId", protect, removeFavourite);

export default router;