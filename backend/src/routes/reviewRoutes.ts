import { Router } from "express";
import {
    createReview,
    getHotelReviews,
    updateReview,
    deleteReview
} from "../controllers/reviewController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, createReview);
router.get("/hotel/:hotelId", getHotelReviews);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;