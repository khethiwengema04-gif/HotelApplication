export type user_role = 'Admin | User'

export interface hotels {
    id: number,
    name: string,
    location: string,
    description: string,
    price: number,
    image_url: string,
    star_rating: number,
    role: user_role,
    facilities: string[],
    policies: string,
    created_at?: Date
}