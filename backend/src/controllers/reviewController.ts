import type { Request, Response } from "express";
import {
    createReviewService,
    findReviewsByHotelService,
    updateReviewService,
    deleteReviewService
} from "../service/reviewService";

const validId = (value: string | string[] | undefined): number | null => {
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
        return null;
    }

    const id = Number(value);
    return Number.isSafeInteger(id) ? id : null;
};

const handleError = (res: Response, error: unknown) => {
    if (error instanceof Error) {
        if (error.message === "REVIEW_REQUIRES_COMPLETED_STAY") {
            return res.status(403).json({
                message: "You can review a hotel only after a completed stay."
            });
        }
    }

    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error
    ) {
        const code = (error as { code: string }).code;

        if (code === "23505") {
            return res.status(409).json({
                message: "You have already reviewed this hotel."
            });
        }

        if (code === "23503") {
            return res.status(404).json({
                message: "The specified hotel or user was not found."
            });
        }
    }

    console.error("Review error:", error);

    return res.status(500).json({
        message: "An error occurred while processing the review."
    });
};

// POST /api/reviews
export const createReview = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { hotel_id, rating, comment } = req.body;

        if (
            !Number.isSafeInteger(hotel_id) ||
            hotel_id <= 0 ||
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5 ||
            (comment !== undefined &&
                comment !== null &&
                typeof comment !== "string")
        ) {
            return res.status(400).json({
                message: "Provide a valid hotel_id, rating from 1 to 5, and optional comment."
            });
        }

        const review = await createReviewService(req.user.id, {
            hotel_id,
            rating,
            comment
        });

        return res.status(201).json({
            message: "Review created successfully.",
            review
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/reviews/hotel/:hotelId
export const getHotelReviews = async (req: Request, res: Response) => {
    const hotelId = validId(req.params.hotelId);

    if (!hotelId) {
        return res.status(400).json({ message: "Invalid hotel ID." });
    }

    try {
        const reviews = await findReviewsByHotelService(hotelId);

        const averageRating = reviews.length
            ? Number(
                (
                    reviews.reduce((sum, review) => sum + review.rating, 0) /
                    reviews.length
                ).toFixed(1)
            )
            : 0;

        return res.status(200).json({
            hotel_id: hotelId,
            total_reviews: reviews.length,
            average_rating: averageRating,
            reviews
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// PUT /api/reviews/:id
export const updateReview = async (req: Request, res: Response) => {
    const id = validId(req.params.id);

    if (!id) {
        return res.status(400).json({ message: "Invalid review ID." });
    }

    if (!req.user) {
        return res.status(401).json({ message: "Authentication required." });
    }

    const { rating, comment } = req.body;
    const suppliedFields = Object.keys(req.body);

    if (
        suppliedFields.length === 0 ||
        suppliedFields.some((field) => !["rating", "comment"].includes(field)) ||
        (rating !== undefined &&
            (!Number.isInteger(rating) || rating < 1 || rating > 5)) ||
        (comment !== undefined &&
            comment !== null &&
            typeof comment !== "string")
    ) {
        return res.status(400).json({
            message: "Provide a rating from 1 to 5 and/or a valid comment."
        });
    }

    try {
        const review = await updateReviewService(id, req.user.id, {
            rating,
            comment
        });

        if (!review) {
            return res.status(404).json({
                message: "Review not found or you do not own this review."
            });
        }

        return res.status(200).json({
            message: "Review updated successfully.",
            review
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req: Request, res: Response) => {
    const id = validId(req.params.id);

    if (!id) {
        return res.status(400).json({ message: "Invalid review ID." });
    }

    if (!req.user) {
        return res.status(401).json({ message: "Authentication required." });
    }

    try {
        const deleted = await deleteReviewService(id, req.user.id);

        if (!deleted) {
            return res.status(404).json({
                message: "Review not found or you do not own this review."
            });
        }

        return res.status(200).json({
            message: "Review deleted successfully."
        });
    } catch (error) {
        return handleError(res, error);
    }
};