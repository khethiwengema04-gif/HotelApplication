export type user_role = 'Admin | User'

export interface hotels {
    id: number;
    name: string;
    location: string;
    description: string;
    price: number;
    images: string[];
    star_rating: number;
    facilities: string[];
    policies: string;
    created_at?: Date;
}