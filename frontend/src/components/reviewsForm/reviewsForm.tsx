import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../store'
import {
    createReview,
    clearReviewMessage,
    fetchReviews
} from '../../features/reviews'
import styles from './ReviewsForm.module.css'

interface ReviewFormProps {
    hotelId: number
}

const ReviewForm: React.FC<ReviewFormProps> = ({ hotelId }) => {
    const dispatch = useDispatch<AppDispatch>()

    const { isLoading, error, message } = useSelector(
        (state: RootState) => state.reviews
    )

    const [rating, setRating] = useState<number>(5)
    const [comment, setComment] = useState('')

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        dispatch(clearReviewMessage())

        const result = await dispatch(
            createReview({
                hotel_id: hotelId,
                rating,
                comment: comment.trim() || undefined
            })
        )

        if (createReview.fulfilled.match(result)) {
            setRating(5)
            setComment('')
            dispatch(fetchReviews(hotelId))
        }
    }

    return (
        <section className={styles.formSection}>
            <h2>Share Your Experience</h2>
            <p>Tell other guests about your stay at this hotel.</p>

            <form onSubmit={handleSubmit} className={styles.reviewForm}>
                <label htmlFor="rating">Your rating</label>

                <select
                    id="rating"
                    value={rating}
                    onChange={(event) => setRating(Number(event.target.value))}
                    required
                >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Very good</option>
                    <option value={3}>3 - Good</option>
                    <option value={2}>2 - Fair</option>
                    <option value={1}>1 - Poor</option>
                </select>

                <label htmlFor="comment">Your comment (optional)</label>

                <textarea
                    id="comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="How was your experience?"
                    rows={4}
                />

                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>

            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.success}>{message}</p>}
        </section>
    )
}

export default ReviewForm
