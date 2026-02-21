const mongoose = require('mongoose');
require('dotenv').config();
const Room = require('./src/models/Room');

const roomsData = [
    {
        id: 1,
        name: 'Deluxe Suite',
        nameUr: 'ڈی لکس سوئٹ',
        description: 'Ocean view with king bed, marble bathroom, and private balcony.',
        descriptionUr: 'کنگ بیڈ، ماربل باتھ روم اور نجی بالکونی کے ساتھ سمندر کا مسحور کن منظر۔',
        price: 280,
        type: 'Deluxe',
        maxGuests: 2,
        images: ['/images/rooms/Grand Deluxe King.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Mini-bar', 'Ocean View', 'King Bed'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'منی بار', 'سمندر کا منظر', 'کنگ بیڈ']
    },
    {
        id: 2,
        name: 'Executive Suite',
        nameUr: 'ایگزیکٹو سوئٹ',
        description: 'Separate living area, work desk, and premium amenities for business travelers.',
        descriptionUr: 'کاروباری مسافروں کے لیے علیحدہ لونگ ایریا، ورک ڈیسک اور پریمیم سہولیات۔',
        price: 399,
        type: 'Executive',
        maxGuests: 2,
        images: ['/images/rooms/pexels-artbovich-8082235.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Mini-bar', 'Living Area', 'Work Desk'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'منی بار', 'لونگ ایریا', 'ورک ڈیسک']
    },
    {
        id: 3,
        name: 'Presidential Suite',
        nameUr: 'صدارتی سوئٹ',
        description: 'Ultimate luxury with private terrace, butler service, and panoramic views.',
        descriptionUr: 'نجی ٹیرس، بٹلر سروس اور شہر کے دلکش نظاروں کے ساتھ حتمی لگژری۔',
        price: 899,
        type: 'Presidential',
        maxGuests: 3,
        images: ['/images/rooms/Royal Presidential Suite.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Mini-bar', 'Private Terrace', 'Butler Service'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'منی بار', 'نجی ٹیرس', 'بٹلر سروس']
    },
    {
        id: 4,
        name: 'Pool Villa',
        nameUr: 'پول ولا',
        description: 'Private pool surrounded by tropical gardens with outdoor shower and sunloungers.',
        descriptionUr: 'اشجار سے گھرا نجی پول، آؤٹ ڈور شاور اور دھوپ سینکنے کے مقامات کے ساتھ۔',
        price: 699,
        type: 'Villa',
        maxGuests: 2,
        images: ['/images/rooms/Garden Pool Villa.jpg'],
        amenities: ['Private Pool', 'WiFi', 'Air Conditioning', 'Garden View', 'Outdoor Shower'],
        amenitiesUr: ['نجی پول', 'وائی فائی', 'ایئر کنڈیشننگ', 'باغ کا منظر', 'آؤٹ ڈور شاور']
    },
    {
        id: 5,
        name: 'Classic Heritage Room',
        nameUr: 'کلاسک ہیریٹیج روم',
        description: 'Timeless elegance with antique furnishings, courtyard view, and rain shower.',
        descriptionUr: 'قدیم فرنیچر، صحن کے منظر اور بارش کے شاور کے ساتھ لازوال خوبصورتی۔',
        price: 189,
        type: 'Classic',
        maxGuests: 2,
        images: ['/images/rooms/Classic Heritage Room.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Courtyard View', 'Rain Shower', 'Vintage Decor'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'صحن کا منظر', 'رین شاور', 'ونٹیج سجاوٹ']
    },
    {
        id: 6,
        name: 'Garden Bungalow',
        nameUr: 'گارڈن بنگلہ',
        description: 'Private bungalow nestled in lush gardens with a four-poster bed and hammock terrace.',
        descriptionUr: 'سرسبز باغات میں گھرا نجی بنگلہ، جس میں چارپائی والا بستر اور ہیمک ٹیرس موجود ہے۔',
        price: 349,
        type: 'Bungalow',
        maxGuests: 2,
        images: ['/images/rooms/pexels-amelia-hallsworth-5461604.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Garden View', 'Private Terrace', 'Mini-bar'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'باغ کا منظر', 'نجی ٹیرس', 'منی بار']
    },
    {
        id: 7,
        name: 'Skyline Penthouse',
        nameUr: 'اسکائی لائن پینٹ ہاؤس',
        description: 'Two-level penthouse crowning the hotel with 360° city views and private rooftop.',
        descriptionUr: 'شہر کے ۳۶۰ ڈگری نظاروں اور نجی چھت کے ساتھ ہوٹل کی سب سے اونچی پینٹ ہاؤس۔',
        price: 1299,
        type: 'Penthouse',
        maxGuests: 4,
        images: ['/images/rooms/Skyline Penthouse.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Private Rooftop', 'City View', 'Butler Service', 'Home Theatre'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'نجی چھت', 'شہر کا منظر', 'بٹلر سروس', 'ہوم تھیٹر']
    },
    {
        id: 8,
        name: 'Oceanfront Suite',
        nameUr: 'سمندر کے سامنے والا سوئٹ',
        description: 'Wake up to an endless horizon — opens directly onto a private infinity pool.',
        descriptionUr: ' لامتناہی افق کی دید کے ساتھ بیدار ہوں — جو براہ راست نجی انفینٹی پول میں کھلتا ہے۔',
        price: 549,
        type: 'Deluxe',
        maxGuests: 2,
        images: ['/images/rooms/Oceanfront Infinity Suite.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Ocean View', 'Infinity Pool', 'Spa Bath'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'سمندر کا منظر', 'انفینٹی پول', 'سپا غسل']
    },
    {
        id: 9,
        name: 'Family Grand Suite',
        nameUr: 'فیملی گرانڈ سوئٹ',
        description: 'Spacious suite with interconnected rooms, bunk beds, and dedicated kids\' play area.',
        descriptionUr: 'بچوں کے کھیلنے کی مخصوص جگہ اور جڑے ہوئے کمروں کے ساتھ کشادہ فیملی سوئٹ۔',
        price: 479,
        type: 'Family',
        maxGuests: 5,
        images: ['/images/rooms/pexels-pixabay-164595.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Mini-bar', 'Living Area', 'Kids Area'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'منی بار', 'لونگ ایریا', 'بچوں کا علاقہ']
    },
    {
        id: 10,
        name: 'Honeymoon Villa',
        nameUr: 'ہنی مون ولا',
        description: 'Romantic hideaway with rose petal turndown, Jacuzzi, and private candlelit terrace.',
        descriptionUr: 'گلاب کی پتیوں، جیکوزی اور شمع روشن نجی ٹیرس کے ساتھ ایک رومانوی جائے پناہ۔',
        price: 799,
        type: 'Villa',
        maxGuests: 2,
        images: ['/images/rooms/Garden Pool Villa.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Jacuzzi', 'Private Terrace', 'Ocean View', 'Mini-bar'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'جیکوزی', 'نجی ٹیرس', 'سمندر کا منظر', 'منی بار']
    },
    {
        id: 11,
        name: 'Junior Suite',
        nameUr: 'جونیئر سوئٹ',
        description: 'Elegant junior suite with city views, soaking tub, and premium toiletries.',
        descriptionUr: 'شہر کے نظاروں، باتھ ٹب اور پریمیم سہولیات کے ساتھ ایک خوبصورت جونیئر سوئٹ۔',
        price: 239,
        type: 'Classic',
        maxGuests: 2,
        images: ['/images/rooms/Grand Deluxe King.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'City View', 'Soaking Tub', 'Mini-bar'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'شہر کا منظر', ' باتھ ٹب', 'منی بار']
    },
    {
        id: 12,
        name: 'Royal Ambassador Suite',
        nameUr: 'رائل ایمبیسیڈر سوئٹ',
        description: 'Exclusive floor access, private dining room, and dedicated concierge service.',
        descriptionUr: 'خصوصی فلور تک رسائی، نجی ڈائننگ روم اور مخصوص دربان کی خدمت۔',
        price: 1099,
        type: 'Presidential',
        maxGuests: 3,
        images: ['/images/rooms/Royal Presidential Suite.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Butler Service', 'Private Dining', 'City View', 'Work Desk'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'بٹلر سروس', 'نجی ڈائننگ', 'شہر کا منظر', 'ورک ڈیسک']
    },
    {
        id: 13,
        name: 'Spa Retreat Suite',
        nameUr: 'سپا ریٹریٹ سوئٹ',
        description: 'In-room steam room, aromatherapy bath, and direct access to the wellness floor.',
        descriptionUr: 'کمرے میں اسٹیم روم، اروما تھراپی غسل اور تندرستی کے فلور تک براہ راست رسائی۔',
        price: 459,
        type: 'Executive',
        maxGuests: 2,
        images: ['/images/rooms/pexels-artbovich-8082235.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Steam Room', 'Spa Bath', 'Garden View'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'اسٹیم روم', 'سپا غسل', 'باغ کا منظر']
    },
    {
        id: 14,
        name: 'Twin Comfort Room',
        nameUr: 'ٹوین کمفرٹ روم',
        description: 'Ideal for colleagues or friends — two premium twin beds with shared lounge.',
        descriptionUr: 'دوستوں یا ساتھیوں کے لیے بہترین — مشترکہ لاؤنج کے ساتھ دو پریمیم ٹوئن بیڈز۔',
        price: 159,
        type: 'Classic',
        maxGuests: 2,
        images: ['/images/rooms/Classic Heritage Room.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Twin Beds', 'City View', 'Work Desk'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'ٹوئن بیڈز', 'شہر کا منظر', 'ورک ڈیسک']
    },
    {
        id: 15,
        name: 'Cliff Edge Villa',
        nameUr: 'کلف ایج ولا',
        description: 'Perched on the cliffside with dramatic sea views and a private plunge pool.',
        descriptionUr: 'ٹٹیان کے کنارے واقع ولا، جس میں سمندر کے دلکش نظارے اور نجی پول موجود ہے۔',
        price: 949,
        type: 'Villa',
        maxGuests: 2,
        images: ['/images/rooms/Oceanfront Infinity Suite.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Private Pool', 'Ocean View', 'Outdoor Shower', 'Mini-bar'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'نجی پول', 'سمندر کا منظر', 'آؤٹ ڈور شاور', 'منی بار']
    },
    {
        id: 16,
        name: 'Grand Family Bungalow',
        nameUr: 'گرانڈ فیملی بنگلہ',
        description: 'Two-bedroom bungalow with private garden, kids pool, and daily breakfast service.',
        descriptionUr: 'نجی باغ اور بچوں کے پول کے ساتھ دو بیڈ روم والا کشادہ خاندانی بنگلہ۔',
        price: 599,
        type: 'Bungalow',
        maxGuests: 6,
        images: ['/images/rooms/pexels-amelia-hallsworth-5461604.jpg'],
        amenities: ['WiFi', 'Air Conditioning', 'Garden View', 'Kids Area', 'Private Pool', 'Mini-bar'],
        amenitiesUr: ['وائی فائی', 'ایئر کنڈیشننگ', 'باغ کا منظر', 'بچوں کا علاقہ', 'نجی پول', 'منی بار']
    }
];

const seedRooms = roomsData.map(r => ({
    _id: r.id,
    name: r.name,
    nameUr: r.nameUr,
    roomNumber: (100 + r.id).toString(),
    type: r.type,
    price: r.price,
    status: 'Available',
    description: r.description,
    descriptionUr: r.descriptionUr,
    fullDescription: r.description, // fallback to short description
    fullDescriptionUr: r.descriptionUr,
    location: 'Main Building',
    locationUr: 'مین بلڈنگ',
    sleeps: r.maxGuests,
    rating: 4.5 + (Math.random() * 0.5),
    reviewsCount: Math.floor(Math.random() * 200) + 50,
    images: r.images,
    amenities: r.amenities.map((a, i) => ({
        icon: 'Circle',
        label: a,
        labelUr: r.amenitiesUr[i]
    })),
    reviews: []
}));

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Room.deleteMany({});
        console.log('Cleared existing rooms');

        await Room.insertMany(seedRooms);
        console.log(`Seeded ${seedRooms.length} rooms successfully`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding DB:', err);
        process.exit(1);
    }
};

seedDB();
