// src/hooks/useRooms.js
// Custom hook — filtering, sorting, and pagination for the Rooms Listing page.
import { useState, useMemo, useEffect } from 'react';
import { roomsData } from '../data/roomsData';

const ITEMS_PER_PAGE = 12;

const useRooms = () => {
    const [filters, setFilters] = useState({
        dateRange: { checkIn: null, checkOut: null },
        guests: { adults: 2, children: 0, infants: 0 },
        priceRange: [50, 1500],
        roomTypes: [],
        amenities: [],
        bedTypes: [],
        rating: null,
    });

    const [sort, setSort] = useState('price-asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

    // ── Reset to page 1 whenever filters or sort order change ──────────────
    useEffect(() => {
        setPage(1);
    }, [filters, sort]);

    // ── Apply all filter criteria ───────────────────────────────────────────
    const filteredRooms = useMemo(() => {
        let result = [...roomsData];

        // Room type
        if (filters.roomTypes.length > 0) {
            result = result.filter((room) => filters.roomTypes.includes(room.type));
        }

        // Bed type
        if (filters.bedTypes.length > 0) {
            result = result.filter((room) => filters.bedTypes.includes(room.beds));
        }

        // Price range
        result = result.filter(
            (room) =>
                room.price >= filters.priceRange[0] &&
                room.price <= filters.priceRange[1]
        );

        // Amenities — room must have SOME of the selected amenities (OR logic)
        if (filters.amenities.length > 0) {
            result = result.filter((room) =>
                filters.amenities.some((a) => room.amenities.includes(a))
            );
        }

        // Minimum rating
        if (filters.rating !== null) {
            result = result.filter((room) => room.rating >= filters.rating);
        }

        // Guest capacity — room must accommodate adults + children
        const totalGuests = filters.guests.adults + filters.guests.children;
        result = result.filter((room) => room.maxGuests >= totalGuests);

        // ── Sorting ────────────────────────────────────────────────────────
        switch (sort) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'rating-desc':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'popularity':
                result.sort((a, b) => b.reviews - a.reviews);
                break;
            default:
                break;
        }

        return result;
    }, [filters, sort]);

    // ── Pagination ──────────────────────────────────────────────────────────
    const totalCount = filteredRooms.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    const paginatedRooms = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredRooms.slice(start, start + pageSize);
    }, [filteredRooms, page, pageSize]);

    // ── Convenience helpers ─────────────────────────────────────────────────

    /** Merge a partial filter object into existing filters */
    const updateFilter = (partial) =>
        setFilters((prev) => ({ ...prev, ...partial }));

    /** Toggle a value in an array-typed filter (roomTypes, bedTypes, amenities) */
    const toggleArrayFilter = (key, value) =>
        setFilters((prev) => {
            const current = prev[key];
            return {
                ...prev,
                [key]: current.includes(value)
                    ? current.filter((v) => v !== value)
                    : [...current, value],
            };
        });

    /** Reset all filters to their initial state */
    const clearFilters = () =>
        setFilters({
            dateRange: { checkIn: null, checkOut: null },
            guests: { adults: 2, children: 0, infants: 0 },
            priceRange: [50, 1500],
            roomTypes: [],
            amenities: [],
            bedTypes: [],
            rating: null,
        });

    return {
        // Data
        rooms: paginatedRooms,
        allRooms: filteredRooms,
        totalCount,

        // Filters
        filters,
        setFilters,
        updateFilter,
        toggleArrayFilter,
        clearFilters,

        // Sort
        sort,
        setSort,

        // Pagination
        pagination: {
            page,
            setPage,
            pageSize,
            setPageSize,
            totalPages,
            totalCount,
        },
    };
};

export default useRooms;
