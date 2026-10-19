import { Request, Response } from "express";
import {
    createBookingService,
    findAllBookingsService,
    findBookingsByUserService,
    findBookingByIdService,
    updateBookingService,
    updateBookingStatusService,
    cancelBookingService,
    deleteBookingService
} from "../service/bookingService";
import type {
    CreateBookingInput,
    UpdateBookingInput,
    BookingStatus
} from "../types/bookingsTypes";

const validId = (
    value: string | string[] | undefined
): number | null => {
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
        return null;
    }

    const id = Number(value);
    return Number.isSafeInteger(id) ? id : null;
};

const bookingErrors: Record<
    string,
    { status: number; message: string }
> = {
    INVALID_BOOKING_DATES: {
        status: 400,
        message: "Check-out must be after check-in, and dates must be valid"
    },
    INVALID_BOOKING_DETAILS: {
        status: 400,
        message: "Room quantity and guest count must be positive integers"
    },
    ROOM_NOT_FOUND: {
        status: 404,
        message: "Room type not found"
    },
    ROOMS_NOT_AVAILABLE: {
        status: 409,
        message: "Not enough rooms are available for these dates"
    },
    GUEST_CAPACITY_EXCEEDED: {
        status: 400,
        message: "The selected rooms cannot accommodate this number of guests"
    },
    BOOKING_NOT_EDITABLE: {
        status: 409,
        message: "This booking can no longer be modified"
    },
    INVALID_BOOKING_STATUS_TRANSITION: {
        status: 409,
        message: "This booking status change is not allowed"
    }
};

const handleBookingError = (
    error: unknown,
    res: Response
) => {
    const message = error instanceof Error ? error.message : "";
    const knownError = bookingErrors[message];

    if (knownError) {
        return res.status(knownError.status).json({
            message: knownError.message
        });
    }

    console.error("Booking error:", error);

    return res.status(500).json({
        message: "An error occurred while processing the booking"
    });
};

const isPositiveInteger = (value: unknown): value is number =>
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0;

const validDateString = (value: unknown): value is string => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
};

export const createBooking = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const {
            room_type_id,
            check_in,
            check_out,
            rooms_booked,
            guest_count,
            special_requests
        } = req.body;

        if (
            !isPositiveInteger(room_type_id) ||
            !validDateString(check_in) ||
            !validDateString(check_out) ||
            !isPositiveInteger(rooms_booked) ||
            !isPositiveInteger(guest_count) ||
            (
                special_requests !== undefined &&
                special_requests !== null &&
                typeof special_requests !== "string"
            )
        ) {
            return res.status(400).json({
                message: "Please provide valid room, date, guest, and request details"
            });
        }

        const data: CreateBookingInput = {
            room_type_id,
            check_in,
            check_out,
            rooms_booked,
            guest_count,
            special_requests
        };

        const booking = await createBookingService(req.user.id, data);

        return res.status(201).json({
            message: "Booking created successfully",
            booking
        });
    } catch (error) {
        return handleBookingError(error, res);
    }
};

export const getAllBookings = async (
    req: Request,
    res: Response
) => {
    try {
        const bookings = await findAllBookingsService();

        return res.status(200).json({ bookings });
    } catch (error) {
        return handleBookingError(error, res);
    }
};

export const getMyBookings = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const bookings = await findBookingsByUserService(req.user.id);

        return res.status(200).json({ bookings });
    } catch (error) {
        return handleBookingError(error, res);
    }
};

export const getBookingById = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const id = validId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }

        const booking = await findBookingByIdService(id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (
            Number(booking.user_id) !== req.user.id &&
            req.user.role !== "Admin"
        ) {
            return res.status(403).json({
                message: "You cannot view another user's booking"
            });
        }

        return res.status(200).json({ booking });
    } catch (error) {
        return handleBookingError(error, res);
    }
};

export const updateBooking = async (
    req: Request,
    res: Response
) => {
    try {
        const id = validId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }

        const allowedFields = [
            "room_type_id",
            "check_in",
            "check_out",
            "rooms_booked",
            "guest_count",
            "special_requests"
        ];

        const suppliedFields = Object.keys(req.body);

        if (
            suppliedFields.length === 0 ||
            suppliedFields.some((field) => !allowedFields.includes(field))
        ) {
            return res.status(400).json({
                message: "Provide at least one valid booking field to update"
            });
        }

        const data = req.body as UpdateBookingInput;

        if (
            data.room_type_id !== undefined &&
            !isPositiveInteger(data.room_type_id)
        ) {
            return res.status(400).json({
                message: "room_type_id must be a positive integer"
            });
        }

        if (
            data.rooms_booked !== undefined &&
            !isPositiveInteger(data.rooms_booked)
        ) {
            return res.status(400).json({
                message: "rooms_booked must be a positive integer"
            });
        }

        if (
            data.guest_count !== undefined &&
            !isPositiveInteger(data.guest_count)
        ) {
            return res.status(400).json({
                message: "guest_count must be a positive integer"
            });
        }

        if (
            data.check_in !== undefined &&
            !validDateString(data.check_in)
        ) {
            return res.status(400).json({
                message: "check_in must be a valid YYYY-MM-DD date"
            });
        }

        if (
            data.check_out !== undefined &&
            !validDateString(data.check_out)
        ) {
            return res.status(400).json({
                message: "check_out must be a valid YYYY-MM-DD date"
            });
        }

        if (
            data.special_requests !== undefined &&
            data.special_requests !== null &&
            typeof data.special_requests !== "string"
        ) {
            return res.status(400).json({
                message: "special_requests must be a string or null"
            });
        }

        const booking = await updateBookingService(id, data);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        return res.status(200).json({
            message: "Booking updated successfully",
            booking
        });
    } catch (error) {
        return handleBookingError(error, res);
    }
};

export const updateBookingStatus = async (
    req: Request,
    res: Response
) => {
    try {
        const id = validId(req.params.id);
        const { status } = req.body;

        const allowedStatuses: BookingStatus[] = [
            "Pending",
            "Confirmed",
            "Rejected",
            "Cancelled",
            "Completed"
        ];

        if (id === null) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }

        if (
            typeof status !== "string" ||
            !allowedStatuses.includes(status as BookingStatus)
        ) {
            return res.status(400).json({
                message: "Invalid booking status"
            });
        }

        const booking = await updateBookingStatusService(
            id,
            status as BookingStatus
        );

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        return res.status(200).json({
            message: "Booking status updated successfully",
            booking
        });
    } catch (error) {
        return handleBookingError(error, res);
    }
};

export const cancelMyBooking = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const id = validId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }

        const booking = await cancelBookingService(id, req.user.id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found, or it cannot be cancelled"
            });
        }

        return res.status(200).json({
            message: "Booking cancelled successfully",
            booking
        });
    } catch (error) {
        return handleBookingError(error, res);
    }
};

export const deleteBooking = async (
    req: Request,
    res: Response
) => {
    try {
        const id = validId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                message: "Invalid booking ID"
            });
        }

        const booking = await deleteBookingService(id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        return res.status(200).json({
            message: "Booking deleted successfully"
        });
    } catch (error) {
        return handleBookingError(error, res);
    }
};