
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

// Review returned by the backend
export interface Review {
    id: number
    user_id: number
    hotel_id: number
    rating: number
    comment: string | null
    created_at: string
    updated_at: string
    reviewer_name?: string
}

interface ReviewsResponse {
    hotel_id: number
    total_reviews: number
    average_rating: number
    reviews: Review[]
}

interface CreateReviewInput {
    hotel_id: number
    rating: number
    comment?: string
}

interface UpdateReviewInput {
    id: number
    rating?: number
    comment?: string | null
}

interface ReviewsState {
    reviews: Review[]
    totalReviews: number
    averageRating: number
    isLoading: boolean
    error: string | null
    message: string | null
}

const initialState: ReviewsState = {
    reviews: [],
    totalReviews: 0,
    averageRating: 0,
    isLoading: false,
    error: null,
    message: null
}

// Get the saved login token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token')

    if (!token || token === 'null' || token === 'undefined') {
        throw new Error('No login token found. Please log in again.')
    }

    return {
        Authorization: `Bearer ${token}`
    }
}

// 1. Fetch reviews for a hotel (public endpoint)
export const fetchReviews = createAsyncThunk<
    ReviewsResponse,
    number,
    { rejectValue: string }
>(
    'reviews/fetchReviews',
    async (hotelId, { rejectWithValue }) => {
        try {
            const response = await axios.get<ReviewsResponse>(
                `http://localhost:5000/api/reviews/hotel/${hotelId}`
            )

            return response.data
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message ?? 'Failed to load reviews.'
                )
            }

            return rejectWithValue('Failed to load reviews.')
        }
    }
)

// 2. Create a review (requires authentication)
export const createReview = createAsyncThunk<
    Review,
    CreateReviewInput,
    { rejectValue: string }
>(
    'reviews/createReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const headers = getAuthHeaders()

            const response = await axios.post<{ review: Review }>(
                'http://localhost:5000/api/reviews',
                reviewData,
                { headers }
            )

            return response.data.review
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message ??
                    'Failed to submit review.'
                )
            }

            return rejectWithValue(
                error instanceof Error
                    ? error.message
                    : 'Failed to submit review.'
            )
        }
    }
)

// 3. Update your review (requires authentication)
export const updateReview = createAsyncThunk<
    Review,
    UpdateReviewInput,
    { rejectValue: string }
>(
    'reviews/updateReview',
    async ({ id, ...reviewData }, { rejectWithValue }) => {
        try {
            const headers = getAuthHeaders()

            const response = await axios.put<{ review: Review }>(
                `http://localhost:5000/api/reviews/${id}`,
                reviewData,
                { headers }
            )

            return response.data.review
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message ??
                    'Failed to update review.'
                )
            }

            return rejectWithValue(
                error instanceof Error
                    ? error.message
                    : 'Failed to update review.'
            )
        }
    }
)

// 4. Delete your review (requires authentication)
export const deleteReview = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>(
    'reviews/deleteReview',
    async (reviewId, { rejectWithValue }) => {
        try {
            const headers = getAuthHeaders()

            await axios.delete(
                `http://localhost:5000/api/reviews/${reviewId}`,
                { headers }
            )

            return reviewId
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message ??
                    'Failed to delete review.'
                )
            }

            return rejectWithValue(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete review.'
            )
        }
    }
)

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        clearReviewMessage: (state) => {
            state.message = null
            state.error = null
        },
        setReviews: (state, action: PayloadAction<Review[]>) => {
            state.reviews = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch reviews
            .addCase(fetchReviews.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.isLoading = false
                state.reviews = action.payload.reviews
                state.totalReviews = action.payload.total_reviews
                state.averageRating = action.payload.average_rating
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload ?? 'Failed to load reviews.'
            })

            // Create review
            .addCase(createReview.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.message = null
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.isLoading = false
                state.reviews = [
                    action.payload,
                    ...state.reviews.filter(
                        (review) => review.id !== action.payload.id
                    )
                ]
                state.totalReviews = state.reviews.length
                state.message = 'Review submitted successfully.'
            })
            .addCase(createReview.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload ?? 'Failed to submit review.'
            })

            // Update review
            .addCase(updateReview.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.message = null
            })
            .addCase(updateReview.fulfilled, (state, action) => {
                state.isLoading = false
                state.reviews = state.reviews.map((review) =>
                    review.id === action.payload.id
                        ? { ...review, ...action.payload }
                        : review
                )
                state.message = 'Review updated successfully.'
            })
            .addCase(updateReview.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload ?? 'Failed to update review.'
            })

            // Delete review
            .addCase(deleteReview.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.message = null
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.isLoading = false
                state.reviews = state.reviews.filter(
                    (review) => review.id !== action.payload
                )
                state.totalReviews = state.reviews.length
                state.message = 'Review deleted successfully.'
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload ?? 'Failed to delete review.'
            })
    }
})

export const { clearReviewMessage, setReviews } = reviewsSlice.actions

export default reviewsSlice.reducer
