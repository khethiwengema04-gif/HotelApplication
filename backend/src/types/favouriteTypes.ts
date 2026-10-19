export interface Favourite {
    id: number;
    user_id: number;
    hotel_id: number;
    created_at: Date;
}

export interface FavouriteWithHotel extends Favourite {
    name: string;
    location: string;
    description: string | null;
    price: number;
    images: string[] | null;
    star_rating: number | null;
}