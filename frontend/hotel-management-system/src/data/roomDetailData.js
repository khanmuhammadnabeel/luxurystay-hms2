// src/data/roomDetailData.js

export const roomDetailData = [
    {
        id: 1,
        name: 'Deluxe Suite',
        nameUr: 'ڈی لکس سوئٹ',
        location: 'East Wing, 15th Floor',
        locationUr: 'ایسٹ ونگ، 15ویں منزل',
        sleeps: 2,
        rating: 4.9,
        reviews: [
            {
                id: 101,
                author: 'Alexander Wright',
                date: 'Oct 2023',
                rating: 5,
                avatar: '/avatars/alexander.jpg',
                comment: 'An absolutely stunning experience. The ocean view from the terrace is unparalleled. The marble bathroom felt like a private spa.',
                commentUr: 'بالکل حیرت انگیز تجربہ۔ ٹیرس سے سمندر کا منظر بے مثال ہے۔ ماربل باتھ روم ایک نجی سپا کی طرح محسوس ہوتا ہے۔'
            },
            {
                id: 102,
                author: 'Sarah Jenkins',
                date: 'Sept 2023',
                rating: 4,
                avatar: '/avatars/sarah.jpg',
                comment: 'Very comfortable bed and excellent service. The breakfast delivered to the room was a highlight.',
                commentUr: 'بہت آرام دہ بستر اور بہترین سروس۔ کمرے میں پہنچایا گیا ناشتہ ایک خاص بات تھی۔'
            }
        ],
        reviewsCount: 128,
        price: 280,
        fullDescription: 'Experience the pinnacle of coastal luxury in our Deluxe Suite. Located on the 15th floor, this suite offers breathtaking panoramic views of the turquoise ocean. The interior features bespoke Italian furniture, a hand-carved mahogany king bed, and a spacious living area that flows seamlessly onto a private teak-wood balcony.',
        fullDescriptionUr: 'ہمارے ڈی لکس سوئٹ میں ساحلی لگژری کے عروج کا تجربہ کریں۔ 15ویں منزل پر واقع یہ سوئٹ فیروزی سمندر کے دلکش نظارے پیش کرتا ہے۔ اندرونی حصے میں اطالوی فرنیچر، ہاتھ سے تراشا ہوا مہوگنی کنگ بیڈ، اور ایک کشادہ لونگ ایریا ہے جو نجی ساگون کی لکڑی کی بالکونی کے ساتھ جڑا ہوا ہے۔',
        images: [
            '/images/rooms/Grand Deluxe King.jpg',
            '/images/rooms/pexels-artbovich-8082235.jpg',
            '/images/rooms/pexels-pixabay-164595.jpg',
            '/images/rooms/Classic Heritage Room.jpg',
            '/images/rooms/Oceanfront Infinity Suite.jpg'
        ],
        amenities: [
            { icon: 'WiFi', label: 'High-speed WiFi', labelUr: 'تیز رفتار وائی فائی' },
            { icon: 'AirVent', label: 'Climate Control', labelUr: 'کلائمیٹ کنٹرول' },
            { icon: 'Coffee', label: 'Nespresso Machine', labelUr: 'نیسپریسو مشین' },
            { icon: 'Refrigerator', label: 'Gourmet Mini-bar', labelUr: 'گورمے منی بار' },
            { icon: 'Tv', label: '65" Smart TV', labelUr: '65" اسمارٹ ٹی وی' },
            { icon: 'Waves', label: 'Ocean View', labelUr: 'سمندر کا منظر' },
            { icon: 'DoorClosed', label: 'Electronic Safe', labelUr: 'الیکٹرانک سیف' },
            { icon: 'Wind', label: 'Hair Dryer', labelUr: 'ہیئر ڈرائر' }
        ],
        type: 'Deluxe',
        beds: 'King',
        discount: null
    },
    {
        id: 3,
        name: 'Presidential Suite',
        nameUr: 'صدارتی سوئٹ',
        location: 'Penthouse Level, Private Access',
        locationUr: 'پینٹ ہاؤس لیول، نجی رسائی',
        sleeps: 3,
        rating: 5.0,
        reviews: [
            {
                id: 301,
                author: 'Prince Faisal Shah',
                date: 'Nov 2023',
                rating: 5,
                avatar: '/avatars/faisal.jpg',
                comment: 'The butler service was exceptional. They anticipated every need before I even asked. Truly a world-class stay.',
                commentUr: 'بٹلر سروس غیر معمولی تھی۔ انہوں نے میرے کہنے سے پہلے ہی ہر ضرورت کا اندازہ لگا لیا۔ واقعی ایک عالمی معیار کا قیام۔'
            }
        ],
        reviewsCount: 42,
        price: 899,
        fullDescription: 'The Presidential Suite is our most prestigious accommodation, designed for heads of state and discerning travelers seeking total privacy. This expansive suite features multiple living areas, a private dining room for six, and a sprawling terrace with an infinity-edge plunge pool overlooking the city skyline.',
        fullDescriptionUr: 'صدارتی سوئٹ ہماری سب سے باوقار رہائش گاہ ہے، جو سربراہان مملکت اور ان مسافروں کے لیے ڈیزائن کی گئی ہے جو مکمل رازداری چاہتے ہیں۔ اس وسیع سوئٹ میں رہنے کے متعدد حصے، چھ افراد کے لیے ڈائننگ روم، اور شہر کے افق پر نظر رکھنے والا ایک بڑا ٹیرس مع انفینٹی پول موجود ہے۔',
        images: [
            '/images/rooms/Royal Presidential Suite.jpg',
            '/images/rooms/Skyline Penthouse.jpg',
            '/images/rooms/Oceanfront Infinity Suite.jpg',
            '/images/rooms/Grand Deluxe King.jpg',
            '/images/rooms/Garden Pool Villa.jpg'
        ],
        amenities: [
            { icon: 'UserCheck', label: '24/7 Personal Butler', labelUr: '24/7 ذاتی بٹلر' },
            { icon: 'Utensils', label: 'Private Dining Room', labelUr: 'نجی ڈائننگ روم' },
            { icon: 'Waves', label: 'Infinity Plunge Pool', labelUr: 'انفینٹی پول' },
            { icon: 'ShieldCheck', label: 'Secured Floor access', labelUr: 'محفوظ رسائی' },
            { icon: 'Wine', label: 'Premium Wine Cellar', labelUr: 'پریمیم وائن سیلر' },
            { icon: 'Briefcase', label: 'Executive Workspace', labelUr: 'ایگزیکٹو ورک اسپیس' }
        ],
        type: 'Presidential',
        beds: 'King',
        discount: null
    },
    {
        id: 7,
        name: 'Skyline Penthouse',
        nameUr: 'اسکائی لائن پینٹ ہاؤس',
        location: 'North Tower, 42nd Floor',
        locationUr: 'نارتھ ٹاور، 42ویں منزل',
        sleeps: 4,
        rating: 5.0,
        reviewsCount: 29,
        price: 1299,
        fullDescription: 'Crowning the North Tower, the Skyline Penthouse offers a breathtaking 360-degree perspective of the city. Spanning two floors connected by a glass spiral staircase, this penthouse features floor-to-ceiling windows, a private rooftop helipad access, and a dedicated cinema room for ultimate entertainment.',
        fullDescriptionUr: 'نارتھ ٹاور کی زینت، اسکائی لائن پینٹ ہاؤس شہر کا ۳۶۰ ڈگری نظارہ پیش کرتا ہے۔ شیشے کی گھومتی سیڑھی سے جڑی دو منزلوں پر مشتمل اس پینٹ ہاؤس میں فرش سے چھت تک کھڑکیاں، نجی ہیلی پیڈ تک رسائی، اور تفریح کے لیے ایک مخصوص سینما روم ہے۔',
        images: [
            '/images/rooms/Skyline Penthouse.jpg',
            '/images/rooms/Royal Presidential Suite.jpg',
            '/images/rooms/Grand Deluxe King.jpg',
            '/images/rooms/pexels-pixabay-164595.jpg',
            '/images/rooms/Garden Pool Villa.jpg'
        ],
        amenities: [
            { icon: 'Tv', label: 'Private Cinema', labelUr: 'نجی سینما' },
            { icon: 'Cloud', label: '360° City View', labelUr: '۳۶۰ ڈگری شہر کا منظر' },
            { icon: 'Layers', label: 'Two-story Layout', labelUr: 'دو منزلہ ترتیب' },
            { icon: 'Music', label: 'Bang & Olufsen Audio', labelUr: 'بی اینڈ او آڈیو' },
            { icon: 'Trophy', label: 'VIP Concierge', labelUr: 'وی آئی پی دربان' }
        ],
        beds: 'King',
        type: 'Penthouse',
        reviews: [
            {
                id: 701,
                author: 'Elena Moretti',
                date: 'Jan 2024',
                rating: 5,
                avatar: '/avatars/elena.jpg',
                comment: 'Staying here was like living in the clouds. The design is modern yet warm. The rooftop terrace is perfect for stargazing.',
                commentUr: 'یہاں قیام بادلوں میں رہنے جیسا تھا۔ ڈیزائن جدید لیکن آرام دہ ہے۔ چھت کا ٹیرس ستاروں کو دیکھنے کے لیے بہترین ہے۔'
            }
        ]
    },
    {
        id: 4,
        name: 'Pool Villa',
        nameUr: 'پول ولا',
        location: 'Garden Enclave, Secluded Section',
        locationUr: 'گارڈن انکلیو، علیحدہ حصہ',
        sleeps: 2,
        rating: 4.9,
        reviewsCount: 67,
        price: 699,
        fullDescription: 'Escape to your own private slice of paradise. Our Pool Villa is tucked away in lush tropical gardens, offering absolute serenity. Features include a private swimming pool, an outdoor rain shower, and a spacious sun deck perfect for yoga or private dining under the stars.',
        fullDescriptionUr: 'جنت کے اپنے نجی ٹکڑے کی طرف فرار ہوں۔ ہمارا پول ولا سرسبز ٹروپیکل باغات میں چھپا ہوا ہے، جو مکمل سکون پیش کرتا ہے۔ خصوصیات میں نجی سوئمنگ پول، آؤٹ ڈور رین شاور، اور ایک کشادہ سن ڈیک شامل ہے جو یوگا یا ستاروں کے نیچے نجی ڈائننگ کے لیے بہترین ہے۔',
        images: [
            '/images/rooms/Garden Pool Villa.jpg',
            '/images/rooms/pexels-amelia-hallsworth-5461604.jpg',
            '/images/rooms/Oceanfront Infinity Suite.jpg',
            '/images/rooms/pexels-pixabay-164595.jpg',
            '/images/rooms/Grand Deluxe King.jpg'
        ],
        amenities: [
            { icon: 'Waves', label: 'Private Swimming Pool', labelUr: 'نجی سویمنگ پول' },
            { icon: 'TreePine', label: 'Tropical Garden View', labelUr: 'ٹروپیکل باغ کا منظر' },
            { icon: 'Sun', label: 'Private Sun Deck', labelUr: 'نجی سن ڈیک' },
            { icon: 'ShowerHead', label: 'Outdoor Rain Shower', labelUr: 'آؤٹ ڈور رین شاور' },
            { icon: 'Wind', label: 'Evening Turndown', labelUr: 'شام کی ٹرن ڈاؤن سروس' }
        ],
        beds: 'King',
        type: 'Villa',
        discount: 15,
        reviews: [
            {
                id: 401,
                author: 'Michael Chen',
                date: 'Dec 2023',
                rating: 5,
                avatar: '/avatars/michael.jpg',
                comment: 'Perfect for a romantic weekend. The privacy we felt in the villa was amazing. Highly recommend the garden breakfast.',
                commentUr: 'ایمانوی ویک اینڈ کے لیے بہترین۔ ولا میں ہمیں جو رازداری محسوس ہوئی وہ حیرت انگیز تھی۔ گارڈن ناشتے کی پرزور سفارش کی جاتی ہے۔'
            }
        ]
    }
];
