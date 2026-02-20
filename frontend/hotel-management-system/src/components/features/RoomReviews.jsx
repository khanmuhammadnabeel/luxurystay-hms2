// src/components/features/RoomReviews.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';
import { useLocalization } from '../../contexts';
import { Rating } from '../ui';
import styles from './RoomReviews.module.css';

/**
 * RoomReviews Component
 * Displays guest reviews and a rating summary.
 */
const RoomReviews = ({ reviews = [], rating = 0, totalReviews = 0 }) => {
    const { language, t } = useLocalization();
    const isUrdu = language === 'Urdu';

    return (
        <div className={styles.container}>
            {/* Summary Box */}
            <div className={styles.summary}>
                <div className={styles.ratingBig}>{rating.toFixed(1)}</div>
                <div className={styles.ratingStars}>
                    <Rating value={rating} size={14} />
                    <span className={styles.reviewCount}>
                        {totalReviews} {t('ui.reviews')}
                    </span>
                </div>
            </div>

            {/* Reviews List */}
            <div className={styles.reviewList}>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className={styles.reviewItem}>
                            <img
                                src={review.avatar || 'https://i.pravatar.cc/150'}
                                alt={review.author}
                                className={styles.avatar}
                                onError={(e) => { e.target.src = 'https://i.pravatar.cc/150'; }}
                            />
                            <div className={styles.reviewContent}>
                                <div className={styles.reviewHeader}>
                                    <div>
                                        <span className={styles.authorName}>{review.author}</span>
                                        <span className={styles.reviewDate}>{review.date}</span>
                                    </div>
                                    <Rating value={review.rating} size={14} />
                                </div>
                                <p className={styles.comment}>
                                    {isUrdu ? review.commentUr || review.comment : review.comment}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-[var(--color-text-secondary)] italic">
                        {isUrdu ? 'ابھی تک کوئی جائزہ نہیں ہے۔' : 'No reviews yet for this room.'}
                    </p>
                )}
            </div>
        </div>
    );
};

RoomReviews.propTypes = {
    reviews: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        author: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        rating: PropTypes.number.isRequired,
        comment: PropTypes.string.isRequired,
        commentUr: PropTypes.string,
        avatar: PropTypes.string
    })),
    rating: PropTypes.number,
    totalReviews: PropTypes.number
};

export default RoomReviews;
