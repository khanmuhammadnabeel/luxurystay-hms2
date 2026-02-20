// src/data/homepageData.js
// Mock data for the homepage sections. Replace image paths with real assets when available.
import { Waves, Wine, Utensils, Dumbbell, Sparkles, Car, Wifi, Coffee } from 'lucide-react';

export const featuredRooms = [
    {
        id: 1,
        name: 'Royal Presidential Suite',
        description: 'An opulent retreat spanning 200 sqm, featuring a private terrace, butler service, and panoramic city views from the 30th floor.',
        price: 1200,
        images: [
            '/images/rooms/Royal Presidential Suite.jpg',
            '/images/rooms/Royal Presidential Suite.jpg',
            '/images/rooms/Royal Presidential Suite.jpg',
        ],
        amenities: ['Private Terrace', 'Butler Service', 'City View', 'Jacuzzi', 'VIP Lounge Access'],
    },
    {
        id: 2,
        name: 'Grand Deluxe King',
        description: 'Sophisticated elegance in 85 sqm of refined luxury. A king-size bed draped in Egyptian cotton welcomes you after a perfect evening.',
        price: 450,
        images: [
            '/images/rooms/Grand Deluxe King.jpg',
            '/images/rooms/Grand Deluxe King.jpg',
            '/images/rooms/Grand Deluxe King.jpg',
        ],
        amenities: ['King Bed', 'Soaking Tub', 'City View', 'Premium Minibar', 'Nespresso Machine'],
    },
    {
        id: 3,
        name: 'Garden Pool Villa',
        description: 'A secluded sanctuary with your own private plunge pool set amid lush tropical gardens, offering complete privacy and tranquility.',
        price: 780,
        images: [
            '/images/rooms/Garden Pool Villa.jpg',
            '/images/rooms/Garden Pool Villa.jpg',
            '/images/rooms/Garden Pool Villa.jpg',
        ],
        amenities: ['Private Pool', 'Garden View', 'Outdoor Shower', 'Kitchenette', 'Sunloungers'],
    },
    {
        id: 4,
        name: 'Classic Heritage Room',
        description: "Timeless charm meets modern comfort in a warmly furnished 45 sqm room that captures the spirit of the hotel's storied history.",
        price: 220,
        images: [
            '/images/rooms/Classic Heritage Room.jpg',
            '/images/rooms/Classic Heritage Room.jpg',
            '/images/rooms/Classic Heritage Room.jpg',
        ],
        amenities: ['Queen Bed', 'Courtyard View', 'Rain Shower', 'Vintage Decor', 'Free Wi-Fi'],
    },
    {
        id: 5,
        name: 'Skyline Penthouse',
        description: 'The pinnacle of luxury — a two-level private penthouse crowning the hotel, with a wrap-around terrace and 360° skyline views.',
        price: 2800,
        images: [
            '/images/rooms/Skyline Penthouse.jpg',
            '/images/rooms/Skyline Penthouse.jpg',
            '/images/rooms/Skyline Penthouse.jpg',
        ],
        amenities: ['360° Views', 'Private Rooftop', 'Home Theatre', "Chef's Kitchen", 'Helipad Access'],
    },
    {
        id: 6,
        name: 'Oceanfront Infinity Suite',
        description: 'Wake up to an endless horizon — this breathtaking suite opens directly onto a private infinity pool overlooking the sea.',
        price: 950,
        images: [
            '/images/rooms/Oceanfront Infinity Suite.jpg',
            '/images/rooms/Oceanfront Infinity Suite.jpg',
            '/images/rooms/Oceanfront Infinity Suite.jpg',
        ],
        amenities: ['Ocean View', 'Infinity Pool', 'Private Deck', 'Spa Bath', 'Sunset Dining'],
    },
];

// Approximate exchange rates relative to USD base price
export const exchangeRates = {
    USD: 1,
    PKR: 278,
    EUR: 0.92,
    GBP: 0.79,
};

export const amenities = [
    {
        id: 1,
        icon: Waves,
        title: 'Infinity Pool',
        description: 'Dive into our rooftop infinity pool overlooking the city skyline, open sunrise to midnight.',
    },
    {
        id: 2,
        icon: Sparkles,
        title: 'Luxury Spa',
        description: 'Rejuvenate with bespoke treatments curated by world-renowned wellness therapists.',
    },
    {
        id: 3,
        icon: Utensils,
        title: 'Fine Dining',
        description: 'Michelin-starred cuisine crafted from seasonal ingredients by our executive chef.',
    },
    {
        id: 4,
        icon: Dumbbell,
        title: 'Fitness Centre',
        description: 'State-of-the-art equipment and personal trainers available around the clock.',
    },
    {
        id: 5,
        icon: Wine,
        title: 'Private Bar',
        description: 'An expertly curated selection of rare vintages and hand-crafted cocktails awaits.',
    },
    {
        id: 6,
        icon: Car,
        title: 'Valet Service',
        description: 'Complimentary valet parking and luxury airport transfers for every guest.',
    },
    {
        id: 7,
        icon: Wifi,
        title: 'Ultra-Fast Wi-Fi',
        description: 'Gigabit-speed connectivity throughout the entire property — work or stream seamlessly.',
    },
    {
        id: 8,
        icon: Coffee,
        title: 'Butler Service',
        description: 'Your dedicated butler ensures every preference is anticipated and every wish fulfilled.',
    },
];

export const testimonials = [
    {
        id: 1,
        name: 'Sophia Harrington',
        avatar: 'https://i.pravatar.cc/150?img=1',
        rating: 5,
        review: 'An absolutely transcendent experience. The butler service was impeccable — every detail anticipated before I even thought to ask. LuxuryStay has redefined what hospitality means to me.',
    },
    {
        id: 2,
        name: 'James Whitfield',
        avatar: 'https://i.pravatar.cc/150?img=2',
        rating: 5,
        review: 'The Royal Presidential Suite left me truly speechless. Waking up to panoramic city views while the butler prepared a bespoke breakfast — this is the pinnacle of luxury travel.',
    },
    {
        id: 3,
        name: 'Isabelle Fontaine',
        avatar: 'https://i.pravatar.cc/150?img=3',
        rating: 5,
        review: 'The spa treatments were so exquisitely crafted that I extended my stay by three days. The Michelin-starred dining and the infinity pool at sunset made every moment unforgettable.',
    },
    {
        id: 4,
        name: 'Oliver Ashworth',
        avatar: 'https://i.pravatar.cc/150?img=4',
        rating: 5,
        review: 'From the moment the valet greeted us to the final champagne farewell, the level of attention was extraordinary. The Garden Pool Villa felt like our own private paradise.',
    },
    {
        id: 5,
        name: 'Amara Osei',
        avatar: 'https://i.pravatar.cc/150?img=5',
        rating: 5,
        review: "I have stayed at some of the world's finest properties, and LuxuryStay stands apart. The Oceanfront Infinity Suite, the wine selection, the staff — everything was simply flawless.",
    },
    {
        id: 6,
        name: 'Charlotte Voss',
        avatar: 'https://i.pravatar.cc/150?img=6',
        rating: 5,
        review: 'The Skyline Penthouse is a masterpiece. Watching the sunrise over the city from the private rooftop with a glass of champagne is an experience I will never forget. Pure perfection.',
    },
];
