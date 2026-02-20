// src/hooks/useRoom.js
import { useState, useEffect, useMemo } from 'react';
import { roomDetailData } from '../data/roomDetailData';
import { roomsData } from '../data/roomsData';

/**
 * Custom hook to fetch a single room's detail.
 * Currently uses mock data, will be updated to fetch from API later.
 */
export const useRoom = (id) => {
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoom = () => {
            setLoading(true);
            try {
                const roomId = parseInt(id, 10);

                // 1. Try to find in detailed data first
                let foundRoom = roomDetailData.find(r => r.id === roomId);

                // 2. Fallback to basic roomsData if not found in detailed
                if (!foundRoom) {
                    const basicRoom = roomsData.find(r => r.id === roomId);
                    if (basicRoom) {
                        foundRoom = {
                            ...basicRoom,
                            location: 'Main Building',
                            sleeps: basicRoom.maxGuests || 2,
                            fullDescription: basicRoom.description,
                            amenities: basicRoom.amenities.map(a => ({ icon: 'Circle', label: a })),
                            reviews: [],
                            reviewsCount: basicRoom.reviews
                        };
                    }
                }

                if (foundRoom) {
                    setRoom(foundRoom);
                } else {
                    setError('Room not found');
                }
            } catch (err) {
                setError('Failed to fetch room details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRoom();
        }
    }, [id]);

    return { room, loading, error };
};
