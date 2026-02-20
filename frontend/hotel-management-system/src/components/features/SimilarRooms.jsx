// src/components/features/SimilarRooms.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { roomsData } from '../../data/roomsData';
import RoomCard from './RoomCard';
import { useLocalization } from '../../contexts';
import styles from './SimilarRooms.module.css';

/**
 * SimilarRooms Component
 * Recommends 3 rooms of the same type or similar price range to the user.
 */
const SimilarRooms = ({ currentRoomId, type }) => {
    const { t } = useLocalization();
    const navigate = useNavigate();

    const similar = useMemo(() => {
        // 1. Filter out current room
        let pool = roomsData.filter(r => r.id !== currentRoomId);

        // 2. Try to find rooms of same type
        let matches = pool.filter(r => r.type === type);

        // 3. Fallback to any rooms if not enough same-type matches
        if (matches.length < 3) {
            const remaining = pool.filter(r => !matches.find(m => m.id === r.id));
            matches = [...matches, ...remaining.slice(0, 3 - matches.length)];
        }

        return matches.slice(0, 3);
    }, [currentRoomId, type]);

    if (!similar || similar.length === 0) return null;

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>{t('roomDetail.similarRooms')}</h2>

            <div className={styles.grid}>
                {similar.map(room => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        onClick={() => {
                            navigate(`/rooms/${room.id}`);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    />
                ))}
            </div>
        </section>
    );
};

SimilarRooms.propTypes = {
    currentRoomId: PropTypes.number.isRequired,
    type: PropTypes.string
};

export default SimilarRooms;
