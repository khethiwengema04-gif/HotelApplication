import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../store'
import { fetchReviews } from '../../features/reviews'
import styles from './reviewsList.module.css'

interface ReviewListProps {
    hotelId: number
}

const ReviewList: React.FC<ReviewListProps> = ({ hotelId }) => {
    const dispatch = useDispatch<AppDispatch>()

    const {
        reviews,
        totalReviews,
        averageRating,
        isLoading,
        error
    } = useSelector((state: RootState) => state.reviews)

    useEffect(() => {
        dispatch(fetchReviews(hotelId))
    }, [dispatch, hotelId])

    if (isLoading) {
        return <p className={styles.message}>Loading reviews...</p>
    }

    if (error) {
        return <p className={styles.error}>{error}</p>
    }

    return (
        <section className={styles.reviewSection}>
            <h2>Guest Reviews</h2>

            <div className={styles.ratingSummary}>
                <span className={styles.averageRating}>
                    ⭐ {averageRating.toFixed(1)} / 5
                </span>
                <span className={styles.totalReviews}>
                    {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </span>
            </div>

            {reviews.length === 0 ? (
                <p className={styles.message}>
                    No reviews yet. Be the first to share your experience!
                </p>
            ) : (
                <div className={styles.reviewList}>
                    {reviews.map((review) => (
                        <article className={styles.reviewCard} key={review.id}>
                            <div className={styles.reviewHeader}>
                                <h3>
                                    {review.reviewer_name ?? 'Guest'}
                                </h3>
                                <span className={styles.reviewDate}>
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <p className={styles.stars}>
                                {'★'.repeat(review.rating)}
                                <span className={styles.emptyStars}>
                                    {'☆'.repeat(5 - review.rating)}
                                </span>
                            </p>

                            {review.comment ? (
                                <p className={styles.comment}>
                                    {review.comment}
                                </p>
                            ) : (
                                <p className={styles.comment}>
                                    No written comment provided.
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

export default ReviewList
