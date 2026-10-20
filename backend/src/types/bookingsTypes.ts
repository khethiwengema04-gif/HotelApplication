export type BookingStatus = "Pending" | "Confirmed" | "Rejected" | "Cancelled" | "Completed";

export interface Booking {
    id: number;
    user_id: number;
    room_type_id: number;
    check_in: string;
    check_out: string;
    rooms_booked: number;
    guest_count: number;
    price_per_night: number | string;
    total_price: number | string;
    status: BookingStatus;
    special_requests: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface CreateBookingInput {
    room_type_id: number;
    check_in: string;
    check_out: string;
    rooms_booked: number;
    guest_count: number;
    special_requests?: string | null;
}

export interface UpdateBookingInput {
    room_type_id?: number;
    check_in?: string;
    check_out?: string;
    rooms_booked?: number;
    guest_count?: number;
    special_requests?: string | null;
}