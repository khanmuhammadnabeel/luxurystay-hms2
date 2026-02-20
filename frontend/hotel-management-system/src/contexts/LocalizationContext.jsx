import React, { createContext, useContext, useState, useEffect } from 'react';

const LocalizationContext = createContext();

export const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸', dir: 'ltr', name: 'English' },
    { code: 'ur', label: 'اردو', flag: '🇵🇰', dir: 'rtl', name: 'Urdu', font: "'Noto Nastaliq Urdu', serif" }
];

export const currencies = [
    { code: 'USD', symbol: '$', label: 'USD ($)', name: 'US Dollar' },
    { code: 'PKR', symbol: 'Rs.', label: 'PKR (Rs)', name: 'Pakistani Rupee' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)', name: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'GBP (£)', name: 'British Pound' }
];

export const translations = {
    English: {
        nav: {
            home: "Home",
            rooms: "Rooms & Suites",
            gallery: "Photo Gallery",
            about: "About Us",
            contact: "Contact",
            bookNow: "Book Now",
            search: "Search...",
            theme: "Theme",
            guestAccount: "Guest Account",
            profile: "View Profile & Settings"
        },
        footer: {
            description: "Refining the art of hospitality. Experience unparalleled luxury and personalized service in the heart of the city.",
            experience: "Experience",
            support: "Support",
            newsletter: "Newsletter",
            subscribe: "Get exclusive offers and news.",
            emailPlaceholder: "Email Address",
            followUs: "Follow Us",
            rights: "All rights reserved.",
            language: "Language",
            currency: "Currency",
            goTop: "Back to Top"
        },
        common: {
            loading: "LUXURYSTAY...",
            search: "Search",
            export: "Export",
            newBooking: "New Booking",
            actions: "Actions",
            noResults: "No results found.",
            clear: "Clear search",
            show: "Show {count} Results"
        },
        pagination: {
            rowsPerPage: "Rows per page:",
            totalItems: "total items",
            first: "First page",
            last: "Last page",
            next: "Next page",
            prev: "Previous page"
        },
        showcase: {
            title: "Bookings Management",
            subtitle: "Composite Components Showcase",
            libTitle: "LuxuryStay Component Library",
            buttons: "Buttons",
            variants: "Variants",
            sizes: "Sizes",
            withIcons: "With Icons",
            states: "States",
            inputs: "Inputs",
            labels: "Labels & Errors",
            dividers: "Dividers",
            dropdowns: "Dropdowns",
            cards: "Cards",
            dateTimeTitle: "Date & Time Components",
            dateTimeSubtitle: "Advanced pickers for booking flows",
            fileMediaTitle: "File & Media Components",
            fileMediaSubtitle: "Uploaders, previews, and galleries",
            inputPickers: "Input Pickers",
            inlineCalendar: "Inline Calendar",
            galleryInteractive: "Interactive Gallery",
            lightboxHint: "Click image to open Lightbox",
            uploaderDrag: "File Uploader (Drag & Drop)",
            imagePreviews: "Image Previews",
            avatarMode: "Avatar Mode",
            clickToUpload: "Click to upload",
            bio: "Bio",
            bioPlaceholder: "Tell us about yourself...",
            specialOffer: "Special Offer",
            getawayPackage: "Weekend getaway package",
            includesBreakfast: "Includes breakfast & spa",
            learnMore: "Learn More",
            lastMinute: "Last Minute Deal",
            save30: "Save 30% on select rooms",
            limited: "LIMITED",
            fromPrice: "From $139",
            view: "View",
            or: "OR",
            left: "Left",
            right: "Right",
            openMenu: "Open Menu",
            myAccount: "My Account",
            profile: "Profile",
            settings: "Settings",
            logout: "Logout",
            hoverMe: "Hover Me",
            viewDetails: "View Details",
            edit: "Edit",
            share: "Share",
            rightClickHere: "Right click here",
            cut: "Cut",
            copy: "Copy",
            paste: "Paste",
            singleSelect: "Single Select",
            chooseRoom: "Choose a room",
            amenities: "Amenities",
            selectAmenities: "Select amenities",
            searchableLoading: "Searchable & Loading",
            searchGuest: "Search guest...",
            simulatingAsync: "Simulating async loading state",
            acceptTerms: "Accept Terms",
            roundedStyle: "Rounded Style",
            selectAll: "Select All",
            addAirportPickup: "Add Airport Pickup",
            chauffeurWait: "Private chauffeur will wait at arrivals",
            kingBed: "King Bed",
            twinBeds: "Twin Beds",
            standardRate: "Standard Rate",
            nonRefundable: "Non-refundable",
            flexibleRate: "Flexible Rate",
            freeCancellation: "Free cancellation up to 24h"
        },
        ui: {
            ghost: "Ghost",
            outline: "Outline",
            secondary: "Secondary",
            primary: "Primary",
            small: "Small",
            medium: "Medium",
            large: "Large",
            leftIcon: "Left Icon",
            rightIcon: "Right Icon",
            favorite: "Favorite",
            disabled: "Disabled",
            loading: "Loading",
            basicInput: "Basic Input",
            withIcons: "With Icons",
            password: "Password",
            withError: "With Error",
            charCounter: "Character Counter",
            filled: "Filled Variant",
            inlineError: "Inline error message",
            hoverTooltip: "Hover for tooltip",
            showToast: "Show Toast Demo",
            horizontal: "Horizontal",
            withText: "With Text",
            gold: "Gold",
            dashed: "Dashed",
            vertical: "Vertical",
            rightClick: "Right-Click Area",
            hoverTrigger: "Hover Trigger",
            clickTrigger: "Click Trigger",
            book: "Book",
            night: "night",
            reviews: "reviews"
        },
        booking: {
            id: "Booking ID",
            guest: "Guest",
            roomType: "Room Type",
            status: "Status",
            checkIn: "Check-in",
            checkOut: "Check-out",
            amount: "Amount",
            searchPlaceholder: "Search bookings...",
            priceRange: "Price Range",
            type: "Type",
            date: "Date",
            datePicker: "Date Picker (Input)",
            timePicker: "Time Picker (Dropdown)",
            rangePicker: "Range Picker (Booking)",
            pickDate: "Pick a date",
            checkInTime: "Check-in Time",
            noImage: "No image",
            noImageSelected: "No image selected",
            cardVariant: "Card Variant",
            today: "Today",
            tomorrow: "Tomorrow"
        },
        rooms: {
            deluxe: "Deluxe Suite",
            standard: "Standard Room",
            ocean: "Ocean View",
            penthouse: "Penthouse",
            family: "Family Suite",
            executive: "Executive Suite",
            pool: "Pool Villa",
            presidential: "Presidential Suite",
            king: "King",
            twin: "Twin",
            queen: "Queen"
        },
        hero: {
            welcome: "Welcome to",
            stay: "LuxuryStay",
            subtitle: "Where every stay becomes a memory",
            checkAvailability: "Check Availability",
            guests: "Guests",
            adults: "Adults",
            children: "Children",
            scroll: "Scroll"
        },
        status: {
            confirmed: "Confirmed",
            pending: "Pending",
            checkedIn: "Checked In",
            cancelled: "Cancelled"
        },
        homepage: {
            rooms: {
                preTitle: "Curated for You",
                title: "Featured Accommodations",
                subtitle: "From intimate hideaways to palatial suites — each room is a world of its own, crafted for those who expect nothing less than extraordinary.",
                perNight: "/ night",
                luxury: "Luxury",
                more: "more",
                bookNow: "Book Now"
            },
            amenities: {
                preTitle: "HANDCRAFTED FOR YOU",
                title: "World-Class Amenities",
                subtitle: "Everything you need for the perfect stay"
            },
            testimonials: {
                preTitle: "GUEST EXPERIENCES",
                title: "What Our Guests Say",
                subtitle: "Real stories from real stays"
            },
            cta: {
                heading: "Ready for an unforgettable experience?",
                subheading: "Book your stay today and indulge in luxury",
                button: "Book Your Stay"
            }
        },
        rooms_listing: {
            title: 'Rooms & Suites',
            available: '{count} rooms available',
            available_single: '1 room available',
            filters: 'Filters',
            sort: {
                label: 'Sort by:',
                priceLowToHigh: 'Price: Low to High',
                priceHighToLow: 'Price: High to Low',
                topRated: 'Top Rated',
                mostPopular: 'Most Popular',
                newest: 'Newest'
            },
            noRooms: 'No rooms found',
            tryAdjusting: 'Try adjusting your filters',
            clearAll: 'Clear all filters',
            view: 'View Room',
            night: 'night',
            more: 'more',
            showLess: 'Show less',
            resultsMore: '+{count} more',
            section_titles: {
                dates: 'Check-in / Check-out',
                guests: 'Guests',
                price: 'Price per night',
                roomType: 'Room Type',
                amenities: 'Amenities',
                bedType: 'Bed Type',
                rating: 'Guest Rating'
            },
            filter_labels: {
                // Room Types
                'Deluxe': 'Deluxe',
                'Executive': 'Executive',
                'Presidential': 'Presidential',
                'Villa': 'Villa',
                'Classic': 'Classic',
                'Bungalow': 'Bungalow',
                'Family': 'Family',
                'Penthouse': 'Penthouse',
                // Bed Types
                'King': 'King',
                'Queen': 'Queen',
                'Twin': 'Twin',
                // Amenities
                'WiFi': 'WiFi',
                'Air Conditioning': 'Air Conditioning',
                'Mini-bar': 'Mini-bar',
                'Ocean View': 'Ocean View',
                'King Bed': 'King Bed',
                'Living Area': 'Living Area',
                'Work Desk': 'Work Desk',
                'Private Terrace': 'Private Terrace',
                'Butler Service': 'Butler Service',
                'Private Pool': 'Private Pool',
                'Garden View': 'Garden View',
                'Outdoor Shower': 'Outdoor Shower',
                'Courtyard View': 'Courtyard View',
                'Rain Shower': 'Rain Shower',
                'Vintage Decor': 'Vintage Decor',
                'Private Rooftop': 'Private Rooftop',
                'City View': 'City View',
                'Home Theatre': 'Home Theatre',
                'Infinity Pool': 'Infinity Pool',
                'Spa Bath': 'Spa Bath',
                'Kids Area': 'Kids Area',
                'Jacuzzi': 'Jacuzzi',
                'Soaking Tub': 'Soaking Tub',
                'Private Dining': 'Private Dining',
                'Steam Room': 'Steam Room',
                'Twin Beds': 'Twin Beds',
                'adults': 'Adults',
                'children': 'Children'
            }
        },
        ui: {
            reviews: "reviews",
            luxury: "Luxury",
            more: "more"
        },
        roomDetail: {
            sleeps: 'Sleeps {count}',
            sleeps_plural: 'Sleeps {count} guests',
            description: 'About this room',
            amenities: 'Amenities',
            reviews: 'Reviews',
            writeReview: 'Write a review',
            similarRooms: 'You might also like',
            share: 'Share',
            favorite: 'Save to favorites',
            location: 'Location'
        },
        booking: {
            dates: 'Check-in / Check-out',
            guests: 'Guests',
            total: 'Total',
            includesTaxes: 'Includes taxes & fees',
            bookNow: 'Book Now',
            freeCancellation: 'Free cancellation up to 48 hours',
            perNight: '/ night'
        }
    },
    Urdu: {
        nav: {
            home: "ہوم",
            rooms: "کمرے اور سوئٹ",
            gallery: "فوٹو گیلری",
            about: "ہمارے بارے میں",
            contact: "رابطہ کریں",
            bookNow: "ابھی بک کریں",
            search: "تلاش کریں...",
            theme: "تھیم",
            guestAccount: "مہمان اکاؤنٹ",
            profile: "پروفائل اور ترتیبات دیکھیں"
        },
        footer: {
            description: "مہمان نوازی کے فن کو نکھارنا۔ شہر کے قلب میں بے مثال لگژری اور ذاتی خدمت کا تجربہ کریں۔",
            experience: "تجربہ",
            support: "سپورٹ",
            newsletter: "نیوز لیٹر",
            subscribe: "خصوصی پیشکشیں اور خبریں حاصل کریں۔",
            emailPlaceholder: "ای میل ایڈریس",
            followUs: "ہمیں فالو کریں",
            rights: "تمام جملہ حقوق محفوظ ہیں۔",
            language: "زبان",
            currency: "کرنسی",
            goTop: "اوپر جائیں"
        },
        common: {
            loading: "لگژری اسٹے...",
            search: "تلاش کریں",
            export: "ایکسپورٹ",
            newBooking: "نئی بکنگ",
            actions: "اقدامات",
            noResults: "کوئی نتیجہ نہیں ملا.",
            clear: "تلاش صاف کریں",
            show: "{count} نتائج دکھائیں"
        },
        pagination: {
            rowsPerPage: "قطاریں فی صفحہ:",
            totalItems: "کل اشیاء",
            first: "پہلا صفحہ",
            last: "آخری صفحہ",
            next: "اگلا صفحہ",
            prev: "پچھلا صفحہ"
        },
        showcase: {
            title: "بکنگ مینجمنٹ",
            subtitle: "کمپوزٹ اجزاء کا شوکیس",
            libTitle: "لگژری اسٹے اجزاء کی لائبریری",
            buttons: "بٹن",
            variants: "اقسام",
            sizes: "سائز",
            withIcons: "آئیکن کے ساتھ",
            states: "حالتیں",
            inputs: "ان پٹ",
            labels: "لیبل اور غلطیاں",
            dividers: "ڈیوائیڈرز",
            dropdowns: "ڈراپ ڈاؤنز",
            cards: "کارڈز",
            dateTimeTitle: "تاریخ اور وقت کے اجزاء",
            dateTimeSubtitle: "بکنگ کے بہاؤ کے لیے ایڈوانسڈ پکرز",
            fileMediaTitle: "فائل اور میڈیا کے اجزاء",
            fileMediaSubtitle: "اپ لوڈرز، پیش نظارہ اور گیلریاں",
            inputPickers: "ان پٹ پکرز",
            inlineCalendar: "ان لائن کیلنڈر",
            galleryInteractive: "انٹرایکٹو گیلری",
            lightboxHint: "لائٹ باکس کھولنے کے لیے تصویر پر کلک کریں",
            uploaderDrag: "فائل اپ لوڈر (ڈرئیگ اینڈ ڈراپ)",
            imagePreviews: "تصویر کے پیش نظارہ",
            avatarMode: "اواتار موڈ",
            clickToUpload: "اپ لوڈ کرنے کے لیے کلک کریں",
            bio: "سوانح عمری",
            bioPlaceholder: "اپنے بارے میں بتائیں...",
            specialOffer: "خصوصی پیشکش",
            getawayPackage: "ویک اینڈ گیٹ وے پیکیج",
            includesBreakfast: "ناشتہ اور سپا شامل ہے",
            learnMore: "مزید جانیں",
            lastMinute: "آخری لمحے کی ڈیل",
            save30: "منتخب کمروں پر 30% بچائیں",
            limited: "محدود",
            fromPrice: "کم از کم $139",
            view: "دیکھیں",
            or: "یا",
            left: "بایاں",
            right: "دایاں",
            openMenu: "مینیو کھولیں",
            myAccount: "میرا اکاؤنٹ",
            profile: "پروفائل",
            settings: "ترتیبات",
            logout: "لاگ آؤٹ",
            hoverMe: "ہوور کریں",
            viewDetails: "تفصیلات دیکھیں",
            edit: "ترمیم کریں",
            share: "شیئر کریں",
            rightClickHere: "یہاں رائٹ کلک کریں",
            cut: "کٹ",
            copy: "کاپی",
            paste: "پیسٹ",
            singleSelect: "سنگل سلیکٹ",
            chooseRoom: "ایک کمرہ منتخب کریں",
            amenities: "سہولیات",
            selectAmenities: "سہولیات منتخب کریں",
            searchableLoading: "سرچ ایبل اور لوڈنگ",
            searchGuest: "مہمان تلاش کریں...",
            simulatingAsync: "ایسنک لوڈنگ کی نقالی",
            acceptTerms: "شرائط قبول کریں",
            roundedStyle: "راؤنڈ اسٹائل",
            selectAll: "سب منتخب کریں",
            addAirportPickup: "ایئرپورٹ پک اپ شامل کریں",
            chauffeurWait: "نجی ڈرائیور آمد پر انتظار کرے گا",
            kingBed: "کنگ بیڈ",
            twinBeds: "ٹوین بیڈز",
            standardRate: "معیاری ریٹ",
            nonRefundable: "ناقابل واپسی",
            flexibleRate: "لچکدار ریٹ",
            freeCancellation: "24 گھنٹے تک مفت منسوخی"
        },
        ui: {
            ghost: "گھوسٹ",
            outline: "آؤٹ لائن",
            secondary: "ثانوی",
            primary: "بنیادی",
            small: "چھوٹا",
            medium: "درمیانہ",
            large: "بڑا",
            leftIcon: "بایاں آئیکن",
            rightIcon: "دایاں آئیکن",
            favorite: "پسندیدہ",
            disabled: "معطل",
            loading: "لوڈ ہو رہا ہے",
            basicInput: "بنیادی ان پٹ",
            withIcons: "آئیکن کے ساتھ",
            password: "پاس ورڈ",
            withError: "غلطی کے ساتھ",
            charCounter: "حروف کا کاؤنٹر",
            filled: "فلڈ ویرینٹ",
            inlineError: "ان لائن غلطی کا پیغام",
            hoverTooltip: "ٹول ٹپ کے لیے ہوور کریں",
            showToast: "ٹوسٹ ڈیمو دکھائیں",
            horizontal: "افقی",
            withText: "متن کے ساتھ",
            gold: "سنہرا",
            dashed: "ڈیشڈ",
            vertical: "عمودی",
            rightClick: "رائٹ کلک ایریا",
            hoverTrigger: "ہوور ٹریگر",
            clickTrigger: "کلک ٹریگر",
            book: "بک کریں",
            night: "رات",
            reviews: "تجزیے"
        },
        booking: {
            id: "بکنگ آئی ڈی",
            guest: "مہمان",
            roomType: "کمرے کی قسم",
            status: "حیثیت",
            checkIn: "چیک ان",
            checkOut: "چیک آؤٹ",
            amount: "رقم",
            searchPlaceholder: "بکنگ تلاش کریں...",
            priceRange: "قیمت کی حد",
            type: "قسم",
            date: "تاریخ",
            datePicker: "ڈیٹ پکر (ان پٹ)",
            timePicker: "ٹائم پکر (ڈراپ ڈاؤن)",
            rangePicker: "رینج پکر (بکنگ)",
            pickDate: "تاریخ منتخب کریں",
            checkInTime: "چیک ان کا وقت",
            noImage: "کوئی تصویر نہیں",
            noImageSelected: "کوئی تصویر منتخب نہیں کی گئی",
            cardVariant: "کارڈ ویرینٹ",
            today: "آج",
            tomorrow: "کل"
        },
        rooms: {
            deluxe: "ڈی لکس سوئٹ",
            standard: "اسٹینڈرڈ روم",
            ocean: "اوشین ویو",
            penthouse: "پینٹ ہاؤس",
            family: "فیملی سوئٹ",
            executive: "ایگزیکٹو سوئٹ",
            pool: "پول ولا",
            presidential: "صدارتی سوئٹ",
            king: "کنگ",
            twin: "ٹوین",
            queen: "کوئین"
        },
        hero: {
            welcome: "خوش آمدید",
            stay: "لگژری اسٹے",
            subtitle: "جہاں ہر قیام ایک یاد بن جاتا ہے",
            checkAvailability: "دستیابی چیک کریں",
            guests: "مہمان",
            adults: "بالغ",
            children: "بچے",
            scroll: "اسکرول"
        },
        status: {
            confirmed: "تصدیق شدہ",
            pending: "زیر التواء",
            checkedIn: "چیک ان کیا گیا",
            cancelled: "منسوخ"
        },
        homepage: {
            rooms: {
                preTitle: "آپ کے لیے منتخب",
                title: "نمایاں قیام گاہیں",
                subtitle: "چھوٹی خلوت گاہوں سے لے کر شاہانہ سوئٹ تک — ہر کمرہ اپنی دنیا ہے، ان کے لیے تیار کیا گیا جو غیر معمولی سے کم کچھ نہیں چاہتے۔",
                perNight: "/ رات",
                luxury: "لگژری",
                more: "مزید",
                bookNow: "ابھی بک کریں"
            },
            amenities: {
                preTitle: "آپ کے لیے تیار کردہ",
                title: "عالمی معیار کی سہولیات",
                subtitle: "کامل قیام کے لیے آپ کو جو کچھ چاہیے"
            },
            testimonials: {
                preTitle: "مہمانوں کے تجربات",
                title: "ہمارے مہمان کیا کہتے ہیں",
                subtitle: "حقیقی قیام کی حقیقی کہانیاں"
            },
            cta: {
                heading: "ایک ناقابلِ فراموش تجربے کے لیے تیار ہیں؟",
                subheading: "آج ہی اپنا قیام بک کریں اور لگژری سے لطف اندوز ہوں",
                button: "اپنا قیام بک کریں"
            }
        },
        rooms_listing: {
            title: 'کمرے اور سوئٹ',
            available: '{count} کمرے دستیاب ہیں',
            available_single: '1 کمرہ دستیاب ہے',
            filters: 'فلٹرز',
            sort: {
                label: 'ترتیب دیں:',
                priceLowToHigh: 'قیمت: کم سے زیادہ',
                priceHighToLow: 'قیمت: زیادہ سے کم',
                topRated: 'اعلیٰ درجہ بندی',
                mostPopular: 'سب سے مقبول',
                newest: 'جدید ترین'
            },
            noRooms: 'کوئی کمرہ نہیں ملا',
            tryAdjusting: 'اپنے فلٹرز کو تبدیل کرنے کی کوشش کریں',
            clearAll: 'تمام فلٹرز صاف کریں',
            view: 'کمرہ دیکھیں',
            night: 'رات',
            more: 'مزید',
            showLess: 'کم دکھائیں',
            resultsMore: '+{count} مزید',
            section_titles: {
                dates: 'چیک ان / چیک آؤٹ',
                guests: 'مہمان',
                price: 'قیمت فی رات',
                roomType: 'کمرے کی قسم',
                amenities: 'سہولیات',
                bedType: 'بستر کی قسم',
                rating: 'مہمانوں کی درجہ بندی'
            },
            filter_labels: {
                // Room Types
                'Deluxe': 'ڈی لکس',
                'Executive': 'ایگزیکٹو',
                'Presidential': 'صدارتی',
                'Villa': 'ولا',
                'Classic': 'کلاسک',
                'Bungalow': 'بنگلہ',
                'Family': 'خاندانی',
                'Penthouse': 'پینٹ ہاؤس',
                // Bed Types
                'King': 'کنگ',
                'Queen': 'کوئین',
                'Twin': 'ٹوین',
                // Amenities
                'WiFi': 'وائی فائی',
                'Air Conditioning': 'ایئر کنڈیشننگ',
                'Mini-bar': 'منی بار',
                'Ocean View': 'سمندر کا منظر',
                'King Bed': 'کنگ بیڈ',
                'Living Area': 'رہنے کا علاقہ',
                'Work Desk': 'کام کی میز',
                'Private Terrace': 'نجی ٹیرس',
                'Butler Service': 'بٹلر سروس',
                'Private Pool': 'نجی پول',
                'Garden View': 'باغ کا منظر',
                'Outdoor Shower': 'آؤٹ ڈور شاور',
                'Courtyard View': 'صحن کا منظر',
                'Rain Shower': 'رین شاور',
                'Vintage Decor': 'ونٹیج سجاوٹ',
                'Private Rooftop': 'نجی چھت',
                'City View': 'شہر کا منظر',
                'Home Theatre': 'ہوم تھیٹر',
                'Infinity Pool': 'انفینٹی پول',
                'Spa Bath': 'سپا غسل',
                'Kids Area': 'بچوں کا علاقہ',
                'Jacuzzi': 'جیکوزی',
                'Soaking Tub': 'باتھ ٹب',
                'Private Dining': 'نجی ڈائننگ',
                'Steam Room': 'اسٹیم روم',
                'Twin Beds': 'ٹوین بیڈز',
                'adults': 'بالغ',
                'children': 'بچے'
            }
        },
        ui: {
            reviews: "جائزے",
            luxury: "لگژری",
            more: "مزید"
        },
        roomDetail: {
            sleeps: '{count} افراد کے لیے',
            sleeps_plural: '{count} مہمانوں کے لیے',
            description: 'کمرے کے بارے میں',
            amenities: 'سہولیات',
            reviews: 'جائزے',
            writeReview: 'جائزہ لکھیں',
            similarRooms: 'آپ کو یہ بھی پسند آ سکتا ہے',
            share: 'شیئر کریں',
            favorite: 'پسندیدہ میں شامل کریں',
            location: 'مقام'
        },
        booking: {
            dates: 'چیک ان / چیک آؤٹ',
            guests: 'مہمان',
            total: 'کل رقم',
            includesTaxes: 'ٹیکس اور فیس شامل ہے',
            bookNow: 'ابھی بک کریں',
            freeCancellation: '۴۸ گھنٹے پہلے مفت منسوخی',
            perNight: '/ رات'
        }
    },
};

export const LocalizationProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('ls_language') || 'English');
    const [currency, setCurrency] = useState(localStorage.getItem('ls_currency') || 'USD');

    const activeLanguage = languages.find(l => l.name === language) || languages[0];
    const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];
    const isRTL = activeLanguage.dir === 'rtl';

    useEffect(() => {
        localStorage.setItem('ls_language', language);
        localStorage.setItem('ls_currency', currency);

        // Apply text direction and language to the html element
        document.documentElement.dir = activeLanguage.dir;
        document.documentElement.lang = activeLanguage.code;

        // Apply font-family if specified for the language
        if (activeLanguage.font) {
            document.body.style.fontFamily = activeLanguage.font;
        } else {
            document.body.style.fontFamily = ''; // Revert to default
        }
    }, [language, currency, activeLanguage]);

    const value = {
        language,
        setLanguage,
        currency,
        setCurrency,
        activeLanguage,
        activeCurrency,
        isRTL,
        t: (path) => {
            const keys = path.split('.');
            let result = translations[language];
            for (const key of keys) {
                if (result && result[key]) {
                    result = result[key];
                } else {
                    return path;
                }
            }
            return result;
        }
    };

    return (
        <LocalizationContext.Provider value={value}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = () => {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};

export default LocalizationContext;
