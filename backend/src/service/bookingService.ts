import { query, withTransaction } from "../config/database";
import type {
    CreateBookingInput,
    UpdateBookingInput,
    BookingStatus
} from "../types/bookingsTypes";

const validDate = (value: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
};

const getBookingDays = (
    checkIn: string,
    checkOut: string
): number => {
    const start = new Date(`${checkIn}T00:00:00.000Z`).getTime();
    const end = new Date(`${checkOut}T00:00:00.000Z`).getTime();

    return (end - start) / 86_400_000;
};

const validateDates = (
    checkIn: string,
    checkOut: string
) => {
    if (
        !validDate(checkIn) ||
        !validDate(checkOut) ||
        checkOut <= checkIn
    ) {
        throw new Error("INVALID_BOOKING_DATES");
    }
};

const checkAvailability = async (
    client: import("pg").PoolClient,
    roomTypeId: number,
    checkIn: string,
    checkOut: string,
    roomsRequested: number,
    totalRooms: number,
    excludeBookingId?: number
) => {
    // A booking occupies each night from check-in up to, but not
    // including, check-out.
    for (
        let time = new Date(`${checkIn}T00:00:00.000Z`).getTime();
        time < new Date(`${checkOut}T00:00:00.000Z`).getTime();
        time += 86_400_000
    ) {
        const day = new Date(time).toISOString().slice(0, 10);

        const result = await client.query(
            `SELECT COALESCE(SUM(rooms_booked), 0)::int AS reserved
             FROM bookings
             WHERE room_type_id = $1
               AND status IN ('Pending', 'Confirmed')
               AND check_in <= $2::date
               AND check_out > $2::date
               AND ($3::int IS NULL OR id <> $3)`,
            [roomTypeId, day, excludeBookingId ?? null]
        );

        const reserved = Number(result.rows[0].reserved);

        if (reserved + roomsRequested > totalRooms) {
            throw new Error("ROOMS_NOT_AVAILABLE");
        }
    }
};

export const createBookingService = async (
    userId: number,
    data: CreateBookingInput
) => {
    validateDates(data.check_in, data.check_out);

    if (
        !Number.isSafeInteger(data.rooms_booked) ||
        data.rooms_booked <= 0 ||
        !Number.isSafeInteger(data.guest_count) ||
        data.guest_count <= 0
    ) {
        throw new Error("INVALID_BOOKING_DETAILS");
    }

    return withTransaction(async (client) => {
        // Lock this room type so concurrent booking requests for it
        // cannot both pass the availability check at the same time.
        const roomResult = await client.query(
            `SELECT id, hotel_id, capacity, price_per_night, total_rooms
             FROM room_types
             WHERE id = $1
             FOR UPDATE`,
            [data.room_type_id]
        );

        const room = roomResult.rows[0];

        if (!room) {
            throw new Error("ROOM_NOT_FOUND");
        }

        if (data.guest_count > Number(room.capacity) * data.rooms_booked) {
            throw new Error("GUEST_CAPACITY_EXCEEDED");
        }

        if (data.rooms_booked > Number(room.total_rooms)) {
            throw new Error("ROOMS_NOT_AVAILABLE");
        }

        await checkAvailability(
            client,
            data.room_type_id,
            data.check_in,
            data.check_out,
            data.rooms_booked,
            Number(room.total_rooms)
        );

        const nights = getBookingDays(data.check_in, data.check_out);
        const pricePerNight = Number(room.price_per_night);
        const totalPrice = Number(
            (pricePerNight * nights * data.rooms_booked).toFixed(2)
        );

        const result = await client.query(
            `INSERT INTO bookings (
                user_id,
                room_type_id,
                check_in,
                check_out,
                rooms_booked,
                guest_count,
                price_per_night,
                total_price,
                special_requests
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                userId,
                data.room_type_id,
                data.check_in,
                data.check_out,
                data.rooms_booked,
                data.guest_count,
                pricePerNight,
                totalPrice,
                data.special_requests?.trim() || null
            ]
        );

        return result.rows[0];
    });
};

export const findAllBookingsService = async () => {
    const result = await query(
        `SELECT
            b.*,
            u.name AS guest_name,
            u.email AS guest_email,
            rt.name AS room_name,
            h.name AS hotel_name
         FROM bookings b
         JOIN users u ON u.id = b.user_id
         JOIN room_types rt ON rt.id = b.room_type_id
         JOIN hotels h ON h.id = rt.hotel_id
         ORDER BY b.created_at DESC`
    );

    return result.rows;
};

export const findBookingsByUserService = async (
    userId: number
) => {
    const result = await query(
        `SELECT
            b.*,
            rt.name AS room_name,
            h.name AS hotel_name,
            h.location AS hotel_location
         FROM bookings b
         JOIN room_types rt ON rt.id = b.room_type_id
         JOIN hotels h ON h.id = rt.hotel_id
         WHERE b.user_id = $1
         ORDER BY b.created_at DESC`,
        [userId]
    );

    return result.rows;
};

export const findBookingByIdService = async (id: number) => {
    const result = await query(
        `SELECT
            b.*,
            u.name AS guest_name,
            u.email AS guest_email,
            rt.name AS room_name,
            h.name AS hotel_name
         FROM bookings b
         JOIN users u ON u.id = b.user_id
         JOIN room_types rt ON rt.id = b.room_type_id
         JOIN hotels h ON h.id = rt.hotel_id
         WHERE b.id = $1`,
        [id]
    );

    return result.rows[0] ?? null;
};

export const updateBookingService = async (
    id: number,
    data: UpdateBookingInput
) => {
    return withTransaction(async (client) => {
        const bookingResult = await client.query(
            `SELECT *
             FROM bookings
             WHERE id = $1
             FOR UPDATE`,
            [id]
        );

        const booking = bookingResult.rows[0];

        if (!booking) {
            return null;
        }

        if (
            ["Cancelled", "Rejected", "Completed"].includes(booking.status)
        ) {
            throw new Error("BOOKING_NOT_EDITABLE");
        }

        const roomTypeId = data.room_type_id ?? Number(booking.room_type_id);
        const checkIn = data.check_in ?? booking.check_in;
        const checkOut = data.check_out ?? booking.check_out;
        const roomsBooked = data.rooms_booked ?? Number(booking.rooms_booked);
        const guestCount = data.guest_count ?? Number(booking.guest_count);
        const specialRequests =
            data.special_requests === undefined
                ? booking.special_requests
                : data.special_requests?.trim() || null;

        validateDates(checkIn, checkOut);

        if (
            !Number.isSafeInteger(roomsBooked) ||
            roomsBooked <= 0 ||
            !Number.isSafeInteger(guestCount) ||
            guestCount <= 0
        ) {
            throw new Error("INVALID_BOOKING_DETAILS");
        }

        const roomResult = await client.query(
            `SELECT id, capacity, price_per_night, total_rooms
             FROM room_types
             WHERE id = $1
             FOR UPDATE`,
            [roomTypeId]
        );

        const room = roomResult.rows[0];

        if (!room) {
            throw new Error("ROOM_NOT_FOUND");
        }

        if (guestCount > Number(room.capacity) * roomsBooked) {
            throw new Error("GUEST_CAPACITY_EXCEEDED");
        }

        if (roomsBooked > Number(room.total_rooms)) {
            throw new Error("ROOMS_NOT_AVAILABLE");
        }

        await checkAvailability(
            client,
            roomTypeId,
            checkIn,
            checkOut,
            roomsBooked,
            Number(room.total_rooms),
            id
        );

        const nights = getBookingDays(checkIn, checkOut);
        const pricePerNight = Number(room.price_per_night);
        const totalPrice = Number(
            (pricePerNight * nights * roomsBooked).toFixed(2)
        );

        const result = await client.query(
            `UPDATE bookings
             SET room_type_id = $1,
                 check_in = $2,
                 check_out = $3,
                 rooms_booked = $4,
                 guest_count = $5,
                 special_requests = $6,
                 price_per_night = $7,
                 total_price = $8,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $9
             RETURNING *`,
            [
                roomTypeId,
                checkIn,
                checkOut,
                roomsBooked,
                guestCount,
                specialRequests,
                pricePerNight,
                totalPrice,
                id
            ]
        );

        return result.rows[0];
    });
};

export const updateBookingStatusService = async (
    id: number,
    status: BookingStatus
) => {
    return withTransaction(async (client) => {
        const bookingResult = await client.query(
            `SELECT *
             FROM bookings
             WHERE id = $1
             FOR UPDATE`,
            [id]
        );

        const booking = bookingResult.rows[0];

        if (!booking) {
            return null;
        }

        const allowedTransitions: Record<string, BookingStatus[]> = {
            Pending: ["Confirmed", "Rejected", "Cancelled"],
            Confirmed: ["Cancelled", "Completed"],
            Rejected: [],
            Cancelled: [],
            Completed: []
        };

        if (!allowedTransitions[booking.status]?.includes(status)) {
            throw new Error("INVALID_BOOKING_STATUS_TRANSITION");
        }

        const result = await client.query(
            `UPDATE bookings
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        return result.rows[0];
    });
};

export const cancelBookingService = async (
    id: number,
    userId: number
) => {
    const result = await query(
        `UPDATE bookings
         SET status = 'Cancelled',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
           AND user_id = $2
           AND status IN ('Pending', 'Confirmed')
         RETURNING *`,
        [id, userId]
    );

    return result.rows[0] ?? null;
};

export const deleteBookingService = async (id: number) => {
    const result = await query(
        `DELETE FROM bookings
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return result.rows[0] ?? null;
};