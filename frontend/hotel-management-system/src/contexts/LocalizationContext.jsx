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
            tomorrow: "Tomorrow",
            dates: 'Check-in / Check-out',
            guests: 'Guests',
            total: 'Total',
            includesTaxes: 'Includes taxes & fees',
            bookNow: 'Book Now',
            freeCancellation: 'Free cancellation up to 48 hours',
            perNight: '/ night',
            guestDetails: 'Guest Details',
            contactInfo: 'Contact Information',
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email',
            phone: 'Phone',
            specialRequests: 'Special Requests',
            requestsOptional: 'Optional - let us know how to make your stay special',
            requestsPlaceholder: 'Early check-in, dietary restrictions, anniversary...',
            addOns: 'Enhance Your Stay',
            continueToPayment: 'Continue to Payment',
            payment: 'Payment',
            confirmAndPay: 'Confirm & Pay',
            confirmed: 'Booking Confirmed!',
            confirmationSent: 'Confirmation sent to {email}',
            reference: 'Booking Reference',
            downloadInvoice: 'Download Invoice',
            addToCalendar: 'Add to Calendar',
            goToDashboard: 'Go to Dashboard',
            emailPreview: 'You will also receive an email confirmation shortly.',
            securePayment: 'All payments are secure and encrypted',
            notAvailable: 'Sorry, these dates are no longer available',
            success: 'Booking confirmed successfully!',
            luxuryStay: 'Luxury Stay ({nights} Nights)',
            perNightAt: 'at {price} / night',
            selectDates: 'Please select check-in and check-out dates to proceed.'
        },
        roomDetail: {
            description: "Description",
            amenities: "Amenities",
            reviews: "Reviews",
            share: "Share",
            favorite: "Favorite",
            sleeps_plural: "{count} Guests"
        },
        payment: {
            selectMethod: 'Select Payment Method',
            card: 'Credit Card',
            payAtHotel: 'Pay at Hotel',
            cardNumber: 'Card Number',
            expiry: 'Expiry (MM/YY)',
            cvv: 'CVV',
            cardName: 'Name on Card'
        },
        hero: {
            welcome: "Welcome to",
            stay: "Experience True Luxury",
            subtitle: "Discover a sanctuary of elegance and refinement where every detail is meticulously crafted for your comfort.",
            guests: "Guests",
            adults: "Adults",
            children: "Children",
            checkAvailability: "Check Availability"
        },
        homepage: {
            rooms: {
                preTitle: "ELEGANT ESCAPES",
                title: "Featured Rooms & Suites",
                subtitle: "Experience the perfect blend of modern comfort and classic luxury in our curated selection of rooms.",
                more: "more",
                bookNow: "Visit Room",
                perNight: "/ night"
            },
            amenities: {
                preTitle: "HANDCRAFTED FOR YOU",
                title: "Premium Amenities",
                subtitle: "From infinity pools to private butler service, we provide everything you need for an unforgettable stay."
            },
            testimonials: {
                preTitle: "GUEST EXPERIENCES",
                title: "What Our Guests Say",
                subtitle: "Don't just take our word for it—read about the unforgettable stays of our distinguished guests."
            },
            cta: {
                heading: "Ready for an Unforgettable Stay?",
                subheading: "Book your luxury escape today and experience the pinnacle of hospitality.",
                button: "Book Your Stay Now"
            }
        },
        rooms_listing: {
            title: "Rooms & Suites",
            available: "{count} Rooms Available",
            available_single: "1 Room Available",
            filters: "Filters",
            clearAll: "Clear All",
            resultsMore: "+{count} more",
            showLess: "Show Less",
            section_titles: {
                dates: "Dates",
                guests: "Guests",
                price: "Price Range",
                roomType: "Room Type",
                amenities: "Amenities",
                bedType: "Bed Type",
                rating: "Guest Rating"
            },
            filter_labels: {
                adults: "Adults",
                children: "Children",
                deluxe: "Deluxe",
                executive: "Executive",
                presidential: "Presidential",
                villa: "Villa",
                classic: "Classic",
                bungalow: "Bungalow",
                penthouse: "Penthouse",
                family: "Family",
                wifi: "WiFi",
                'air conditioning': "Air Conditioning",
                'mini-bar': "Mini-bar",
                'ocean view': "Ocean View",
                'king bed': "King Bed",
                'living area': "Living Area",
                'work desk': "Work Desk",
                'private terrace': "Private Terrace",
                'butler service': "Butler Service",
                'private pool': "Private Pool",
                'garden view': "Garden View",
                'outdoor shower': "Outdoor Shower",
                'courtyard view': "Courtyard View",
                'rain shower': "Rain Shower",
                'vintage decor': "Vintage Decor",
                'private rooftop': "Private Rooftop",
                'city view': "City View",
                'home theatre': "Home Theatre",
                'infinity pool': "Infinity Pool",
                'spa bath': "Spa Bath",
                'kids area': "Kids Area",
                jacuzzi: "Jacuzzi",
                'soaking tub': "Soaking Tub",
                'private dining': "Private Dining",
                'steam room': "Steam Room",
                'twin beds': "Twin Beds",
                king: "King",
                queen: "Queen",
                twin: "Twin"
            },
            sort: {
                label: "Sort By",
                priceLowToHigh: "Price: Low to High",
                priceHighToLow: "Price: High to Low",
                topRated: "Top Rated",
                mostPopular: "Most Popular",
                newest: "Newest arrivals"
            },
            view: "Visit Room"
        },
        ui: {
            luxury: "Luxury"
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
            tomorrow: "کل",
            dates: 'چیک ان / چیک آؤٹ',
            guests: 'مہمان',
            total: 'کل رقم',
            includesTaxes: 'ٹیکس اور فیس شامل ہے',
            bookNow: 'ابھی بک کریں',
            freeCancellation: '۴۸ گھنٹے پہلے مفت منسوخی',
            perNight: '/ رات',
            guestDetails: 'مہمان کی تفصیلات',
            contactInfo: 'رابطہ کی معلومات',
            firstName: 'پہلا نام',
            lastName: 'آخری نام',
            email: 'ای میل',
            phone: 'فون',
            specialRequests: 'خصوصی درخواستیں',
            requestsOptional: 'اختیاری - ہمیں بتائیں کہ ہم آپ کے قیام کو کیسے خاص بنا سکتے ہیں',
            requestsPlaceholder: 'جلد چیک ان، غذائی پابندیاں، سالگرہ...',
            addOns: 'اپنے قیام کو بہتر بنائیں',
            continueToPayment: 'ادائیگی جاری رکھیں',
            payment: 'ادائیگی',
            confirmAndPay: 'تصدیق اور ادائیگی',
            confirmed: 'بکنگ کی تصدیق ہو گئی!',
            confirmationSent: 'تصدیق نامہ {email} پر بھیج دیا گیا ہے',
            reference: 'بکنگ حوالہ',
            downloadInvoice: 'انوائس ڈاؤن لوڈ کریں',
            addToCalendar: 'کیلنڈر میں شامل کریں',
            goToDashboard: 'ڈیش بورڈ پر جائیں',
            emailPreview: 'آپ کو جلد ہی ای میل کی تصدیق بھی مل جائے گی۔',
            securePayment: 'تمام ادائیگیاں محفوظ اور انکرپٹڈ ہیں',
            notAvailable: 'افسوس، یہ تاریخیں اب دستیاب نہیں ہیں',
            success: 'بکنگ کی تصدیق کامیابی سے ہو گئی!',
            luxuryStay: 'لگژری قیام ({nights} راتیں)',
            perNightAt: '{price} فی رات',
            selectDates: 'براہ کرم آگے بڑھنے کے لیے چیک ان اور چیک آؤٹ کی تاریخیں منتخب کریں۔'
        },
        roomDetail: {
            description: "تفصیل",
            amenities: "سہولیات",
            reviews: "تجزیے",
            share: "شیئر کریں",
            favorite: "پسندیدہ",
            sleeps_plural: "{count} مہمان"
        },
        payment: {
            selectMethod: 'ادائیگی کا طریقہ منتخب کریں',
            card: 'کریڈٹ کارڈ',
            payAtHotel: 'ہوٹل پر ادائیگی کریں',
            cardNumber: 'کارڈ نمبر',
            expiry: 'میعاد ختم ہونے (MM/YY)',
            cvv: 'CVV',
            cardName: 'کارڈ پر نام'
        },
        hero: {
            welcome: "خوش آمدید",
            stay: "حقیقی عیش و آرام کا تجربہ کریں",
            subtitle: "خوبصورتی اور نفاست کی ایک ایسی پناہ گاہ دریافت کریں جہاں آپ کے آرام کے لیے ہر تفصیل باریک بینی سے تیار کی گئی ہے۔",
            guests: "مہمان",
            adults: "بڑے",
            children: "بچے",
            checkAvailability: "دستیابی چیک کریں"
        },
        homepage: {
            rooms: {
                preTitle: "پُرسکون فرار",
                title: "نمایاں کمرے اور سوئٹ",
                subtitle: "ہمارے منتخب کردہ کمروں میں جدید آرام اور کلاسک لگژری کے بہترین امتزاج کا تجربہ کریں۔",
                more: "مزید",
                bookNow: "کمرہ دیکھیں",
                perNight: "/ رات"
            },
            amenities: {
                preTitle: "آپ کے لیے تیار کردہ",
                title: "پریمیم سہولیات",
                subtitle: "انفینٹی پولز سے لے کر نجی بٹلر سروس تک، ہم وہ سب کچھ فراہم کرتے ہیں جو آپ کو ایک ناقابل فراموش قیام کے لیے درکار ہے۔"
            },
            testimonials: {
                preTitle: "مہمانوں کے تجربات",
                title: "ہمارے مہمان کیا کہتے ہیں",
                subtitle: "صرف ہماری باتوں پر یقین نہ کریں—ہمارے معزز مہمانوں کے ناقابل فراموش قیام کے بارے میں پڑھیں۔"
            },
            cta: {
                heading: "ایک ناقابل فراموش قیام کے لیے تیار ہیں؟",
                subheading: "آج ہی اپنی لگژری فرار بک کریں اور مہمان نوازی کے عروج کا تجربہ کریں۔",
                button: "ابھی اپنا قیام بک کریں"
            }
        },
        rooms_listing: {
            title: "کمرے اور سوئٹ",
            available: "{count} کمرے دستیاب ہیں",
            available_single: "1 کمرہ دستیاب ہے",
            filters: "فلٹرز",
            clearAll: "سب صاف کریں",
            resultsMore: "+{count} مزید",
            showLess: "کم دکھائیں",
            section_titles: {
                dates: "تاریخیں",
                guests: "مہمان",
                price: "قیمت کی حد",
                roomType: "کمرے کی قسم",
                amenities: "سہولیات",
                bedType: "بستر کی قسم",
                rating: "مہمانوں کی درجہ بندی"
            },
            filter_labels: {
                adults: "بڑے",
                children: "بچے",
                deluxe: "ڈی لکس",
                executive: "ایگزیکٹو",
                presidential: "صدارتی",
                villa: "ولا",
                classic: "کلاسک",
                bungalow: "بنگلہ",
                penthouse: "پینٹ ہاؤس",
                family: "فیملی",
                wifi: "وائی فائی",
                'air conditioning': "ایئر کنڈیشننگ",
                'mini-bar': "منی بار",
                'ocean view': "سمندر کا منظر",
                'king bed': "کنگ بیڈ",
                'living area': "لونگ ایریا",
                'work desk': "ورک ڈیسک",
                'private terrace': "نجی ٹیرس",
                'butler service': "بٹلر سروس",
                'private pool': "نجی پول",
                'garden view': "باغ کا منظر",
                'outdoor shower': "آؤٹ ڈور شاور",
                'courtyard view': "صحن کا منظر",
                'rain shower': "رین شاور",
                'vintage decor': "ونٹیج سجاوٹ",
                'private rooftop': "نجی چھت",
                'city view': "شہر کا منظر",
                'home theatre': "ہوم تھیٹر",
                'infinity pool': "انفینٹی پول",
                'spa bath': "سپا غسل",
                'kids area': "بچوں کا علاقہ",
                jacuzzi: "جیکوزی",
                'soaking tub': "باتھ ٹب",
                'private dining': "نجی ڈائننگ",
                'steam room': "اسٹیم روم",
                'twin beds': "ٹوین بیڈز",
                king: "کنگ",
                queen: "کوئین",
                twin: "ٹوین"
            },
            sort: {
                label: "ترتیب دیں",
                priceLowToHigh: "قیمت: کم سے زیادہ",
                priceHighToLow: "قیمت: زیادہ سے کم",
                topRated: "اعلیٰ درجہ بندی",
                mostPopular: "سب سے زیادہ مشہور",
                newest: "تازہ ترین"
            },
            view: "کمرہ دیکھیں"
        },
        ui: {
            luxury: "لگژری"
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
            if (!path) return '';

            const keys = path.toLowerCase().split('.');

            // Helper function for nested lookup
            const lookup = (obj, pathKeys) => {
                let current = obj;
                for (const key of pathKeys) {
                    if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, key)) {
                        current = current[key];
                    } else if (current && typeof current === 'object') {
                        // Case-insensitive direct lookup if key is not exact (should be normalized though)
                        const foundKey = Object.keys(current).find(k => k.toLowerCase() === key);
                        if (foundKey) {
                            current = current[foundKey];
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                }
                return current;
            };

            // 1. Try current language
            let result = lookup(translations[language], keys);

            // 2. Fallback to English if missing
            if (result === null && language !== 'English') {
                result = lookup(translations['English'], keys);
            }

            // 3. Return result or the original path as last resort
            return result !== null ? result : path;
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
