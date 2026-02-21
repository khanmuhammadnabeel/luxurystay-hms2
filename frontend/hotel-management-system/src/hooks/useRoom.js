// src/hooks/useRoom.js
import { useState, useEffect } from 'react';
import { getRoomById } from '../services/roomService';
import { roomDetailData } from '../data/roomDetailData';
import { roomsData } from '../data/roomsData';

/**
 * Custom hook to fetch a single room's detail.
 * Now tries to fetch from API, with fallback to mock data.
 */
export const useRoom = (id) => {
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoom = async () => {
            setLoading(true);
            try {
                // 1. Try to fetch from API first
                try {
                    const result = await getRoomById(id);
                    if (result.data) {
                        setRoom(result.data);
                        return;
                    }
                } catch (apiErr) {
                    console.warn('API fetch failed, falling back to mock data', apiErr);
                }

                // 2. Fallback to mock data
                const roomId = parseInt(id, 10);
                let foundRoom = roomDetailData.find(r => r.id === roomId);

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
