export interface Review {
    id: number;
    user_id: number;
    hotel_id: number;
    rating: number;
    comment: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface CreateReviewInput {
    hotel_id: number;
    rating: number;
    comment?: string | null;
}

export interface UpdateReviewInput {
    rating?: number;
    comment?: string | null;
}

export interface ReviewWithUser extends Review {
    reviewer_name: string;
}