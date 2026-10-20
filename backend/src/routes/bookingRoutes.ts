import { Router } from "express";
import {
    createBooking,
    getAllBookings,
    getMyBookings,
    getBookingById,
    updateBooking,
    updateBookingStatus,
    cancelMyBooking,
    deleteBooking
} from "../controllers/bookingController";
import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/hotelsMiddleware";

const router = Router();

router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.patch("/:id/cancel", protect, cancelMyBooking);
router.get("/", protect, isAdmin, getAllBookings);
router.put("/:id", protect, isAdmin, updateBooking);
router.patch("/:id/status", protect, isAdmin, updateBookingStatus);
router.delete("/:id", protect, isAdmin, deleteBooking);

// Guests can view their own booking; admins can view any booking.
router.get("/:id", protect, getBookingById);

export default router;