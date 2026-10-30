export interface RoomType {
    id: number;
    hotel_id: number;
    name: string;
    description: string | null;
    capacity: number;
    price_per_night: number;
    total_rooms: number;
    created_at: Date;
}

export interface CreateRoomTypeInput {
    name: string;
    description?: string | null;
    capacity: number;
    price_per_night: number;
    total_rooms: number;
}

export type UpdateRoomTypeInput = Partial<CreateRoomTypeInput>;


export interface bookings {
    id: number,
    userId: number,
    room_id: number,
    check_in_date: Date,
    check_out_date: Date,
    total_guest: number,
    status: string,
    payment_status: string
}
