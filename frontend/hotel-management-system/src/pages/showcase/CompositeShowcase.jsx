import React, { useState, useEffect, useMemo } from 'react';
import {
    DataTable,
    Pagination,
    SearchBar,
    FilterChips,
    Calendar,
    DatePicker,
    TimePicker,
    RangePicker,
    FileUploader,
    ImagePreview,
    Gallery,
    Lightbox
} from '../../components/composite';
import { Button, Card, Divider } from '../../components/ui';
import { useTheme, useLocalization } from '../../contexts';
import { Eye, Edit, Trash2, MoreVertical, User, CreditCard, Download, Image, Grid, List, Maximize2, Plus } from 'lucide-react';

const MOCK_DATA = Array.from({ length: 50 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + (i % 5));
    return {
        id: `BK-${1000 + i}`,
        guest: ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Wilson'][i % 5],
        roomKey: ['deluxe', 'standard', 'ocean', 'penthouse', 'family'][i % 5],
        typeKey: ['king', 'twin', 'queen'][i % 3],
        statusKey: ['confirmed', 'pending', 'checkedIn', 'cancelled'][i % 4],
        amount: [299, 199, 450, 899, 350][i % 5],
        date: date.toLocaleDateString(),
    };
});

const CompositeShowcase = () => {
    const { theme, toggleTheme } = useTheme();
    const { t, isRTL, activeCurrency } = useLocalization();

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);
    const [sort, setSort] = useState({ key: 'id', direction: 'asc' });
    const [loading, setLoading] = useState(false);

    // Date & Time Showcase State
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('14:30');
    const [range, setRange] = useState({ start: null, end: null });
    const [calendarDate, setCalendarDate] = useState(new Date());

    // File & Gallery Showcase State
    // File & Gallery Showcase State
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    // Dedicated state for the Image Preview section (independent of Gallery)
    const [previewImage, setPreviewImage] = useState({
        src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        alt: 'Preview Image',
        isPrimary: false
    });

    const [galleryImages, setGalleryImages] = useState([
        { id: 1, src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', alt: 'Executive Suite', isPrimary: true },
        { id: 2, src: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', alt: 'Ocean View', isPrimary: false },
        { id: 3, src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', alt: 'Lobby', isPrimary: false },
        { id: 4, src: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80', alt: 'Pool Area', isPrimary: false },
        { id: 5, src: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', alt: 'Dining', isPrimary: false },
        { id: 6, src: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80', alt: 'Spa', isPrimary: false },
    ]);

    // Gallery Handlers
    const handleSetPrimary = (id) => {
        setGalleryImages(prev => prev.map(img => ({
            ...img,
            isPrimary: img.id === id
        })));
    };

    const handleDeleteImage = (id) => {
        setGalleryImages(prev => prev.filter(img => img.id !== id));
        if (lightboxIndex >= 0) setLightboxIndex(-1);
    };

    // Preview Section Handlers (Independent)
    const handlePreviewDelete = () => {
        setPreviewImage(null);
    };

    const handlePreviewTogglePrimary = () => {
        setPreviewImage(prev => prev ? ({ ...prev, isPrimary: !prev.isPrimary }) : null);
    };

    const handleRotate = (angle) => {
        console.log('Rotated image to:', angle);
    };

    const handleUpload = (files) => {
        // Add to Gallery
        const newImages = files.map((file, i) => ({
            id: Date.now() + i,
            src: URL.createObjectURL(file),
            alt: file.name,
            isPrimary: false
        }));
        setGalleryImages(prev => [...prev, ...newImages]);

        // Also update the Preview Section with the first uploaded file
        if (files.length > 0) {
            setPreviewImage({
                src: URL.createObjectURL(files[0]),
                alt: files[0].name,
                isPrimary: false
            });
        }
    };

    // Filter & Sort Logic
    const filteredData = useMemo(() => {
        let result = [...MOCK_DATA];

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.guest.toLowerCase().includes(lowerTerm) ||
                item.id.toLowerCase().includes(lowerTerm)
            );
        }

        // Filters
        filters.forEach(filter => {
            if (filter.label === 'Status') {
                result = result.filter(item => item.status === filter.value);
            }
            if (filter.label === 'Type') {
                result = result.filter(item => item.type === filter.value);
            }
            if (filter.label === 'Price Range') {
                const value = filter.value; // "$0-$200" or "$200+"
                if (value.includes('+')) {
                    const min = parseInt(value.replace('$', '').replace('+', ''), 10);
                    result = result.filter(item => item.amount >= min);
                } else {
                    const [minStr, maxStr] = value.split('-');
                    const min = parseInt(minStr.replace('$', ''), 10);
                    const max = parseInt(maxStr.replace('$', ''), 10);
                    result = result.filter(item => item.amount >= min && item.amount <= max);
                }
            }
            if (filter.label === 'Date') {
                const today = new Date();
                const itemDate = new Date(filter.value === 'Today' ? today : new Date(today.setDate(today.getDate() + 1))).toLocaleDateString();
                result = result.filter(item => item.date === itemDate);
            }
        });

        // Sort
        if (sort.key) {
            result.sort((a, b) => {
                const valA = a[sort.key];
                const valB = b[sort.key];

                if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [searchTerm, filters, sort]);

    // Pagination Logic
    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, page, pageSize]);

    // Handlers
    const handleSearch = (term) => {
        setLoading(true);
        setSearchTerm(term);
        setPage(1);
        setTimeout(() => setLoading(false), 500); // Simulate network
    };

    const handleAddFilter = (field) => {
        // Mocking filter addition
        const values = {
            'Status': ['Confirmed', 'Pending'],
            'Type': ['King', 'Twin'],
            'Price Range': ['$0-$200', '$200+'],
            'Date': [t('booking.today'), t('booking.tomorrow')]
        };
        const randomValue = values[field][Math.floor(Math.random() * values[field].length)];

        const newFilter = {
            id: Date.now(),
            label: field,
            value: randomValue,
            icon: field === 'Date' ? <Calendar size={14} /> : null
        };
        setFilters([...filters, newFilter]);
    };

    const handleRemoveFilter = (id) => {
        setFilters(filters.filter(f => f.id !== id));
    };

    const columns = [
        { field: 'id', header: t('booking.id'), sortable: true, width: '120px' },
        {
            field: 'guest',
            header: t('booking.guest'),
            sortable: true,
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent">
                        {row.guest.charAt(0)}
                    </div>
                    {row.guest}
                </div>
            )
        },
        {
            field: 'roomKey',
            header: t('booking.roomType'),
            sortable: true,
            render: (row) => t(`rooms.${row.roomKey}`)
        },
        {
            field: 'statusKey',
            header: t('booking.status'),
            sortable: true,
            align: 'center',
            render: (row) => {
                const colors = {
                    'confirmed': 'bg-green-500/10 text-green-500',
                    'pending': 'bg-yellow-500/10 text-yellow-500',
                    'checkedIn': 'bg-blue-500/10 text-blue-500',
                    'cancelled': 'bg-red-500/10 text-red-500',
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium select-none ${colors[row.statusKey]}`}>
                        {t(`status.${row.statusKey}`)}
                    </span>
                );
            }
        },
        {
            field: 'date',
            header: t('booking.checkIn'),
            sortable: true,
            width: '120px'
        },
        {
            field: 'amount',
            header: t('booking.amount'),
            sortable: true,
            align: 'end',
            render: (row) => <span className="font-medium">{activeCurrency.symbol}{row.amount}</span>
        },
        {
            field: 'actions',
            header: '',
            width: '50px',
            align: 'center',
            render: () => (
                <button className="text-text-secondary hover:text-accent transition-colors">
                    <MoreVertical size={16} />
                </button>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-primary p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* ================================================================================== */}
                {/*                                       HEADER                                       */}
                {/* ================================================================================== */}


                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className={isRTL ? "text-right" : "text-left"}>
                        <h1 className="text-h2 text-text-primary select-none cursor-default">{t('showcase.title')}</h1>
                        <p className="text-body text-text-secondary select-none cursor-default">{t('showcase.subtitle')}</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={toggleTheme}
                        leftIcon={theme === 'dark' ? '🌙' : '☀️'}
                    >
                        {theme === 'dark' ? t('nav.theme') + ' (Dark)' : t('nav.theme') + ' (Light)'}
                    </Button>
                </div>

                {/* ================================================================================== */}
                {/*                           BOOKINGS MANAGEMENT SECTION                              */}
                {/* ================================================================================== */}
                <Card className="p-6 space-y-6 overflow-visible">

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder={t('booking.searchPlaceholder')}
                            variant="default"
                            className="max-w-md"
                            enableRecent={true}
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" leftIcon={<Download size={16} />}>{t('common.export')}</Button>
                            <Button variant="primary" leftIcon={<Plus size={16} />} >{t('common.newBooking')}</Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <FilterChips
                        filters={filters}
                        onRemove={handleRemoveFilter}
                        onAdd={handleAddFilter}
                        onClear={() => setFilters([])}
                        onSavePreset={() => alert('Preset saved!')}
                    />

                    {/* Data Table */}
                    <DataTable
                        columns={columns}
                        data={paginatedData}
                        loading={loading}
                        totalItems={filteredData.length}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setPage(1); // Reset to first page on size change
                        }}
                        onSort={setSort}
                        onSelectionChange={setSelectedRows}
                        selectedRowIds={selectedRows}
                        variant="striped"
                        emptyMessage={t('common.noResults')}
                    />

                </Card>

                {/* ================================================================================== */}
                {/*                           DATE & TIME COMPONENTS SECTION                           */}
                {/* ================================================================================== */}
                <div className="space-y-6">
                    <div className={isRTL ? "text-right" : "text-left"}>
                        <h2 className="text-h3 text-text-primary select-none cursor-default">{t('showcase.dateTimeTitle')}</h2>
                        <p className="text-body text-text-secondary select-none cursor-default">{t('showcase.dateTimeSubtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Input Pickers */}
                        <Card className="p-6 space-y-6 overflow-visible">
                            <h3 className="text-lg font-medium text-text-primary select-none cursor-default">{t('showcase.inputPickers')}</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className={`text-sm font-medium text-text-secondary block select-none cursor-default ${isRTL ? "text-right" : "text-left"}`}>{t('booking.datePicker')}</label>
                                    <DatePicker
                                        value={date}
                                        onChange={setDate}
                                        placeholder={t('booking.pickDate')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-sm font-medium text-text-secondary block select-none cursor-default ${isRTL ? "text-right" : "text-left"}`}>{t('booking.timePicker')}</label>
                                    <TimePicker
                                        value={time}
                                        onChange={setTime}
                                        label={t('booking.checkInTime')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-sm font-medium text-text-secondary block select-none cursor-default ${isRTL ? "text-right" : "text-left"}`}>{t('booking.rangePicker')}</label>
                                    <RangePicker
                                        value={range}
                                        onChange={setRange}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Right: Inline Calendar */}
                        <Card className="p-6 space-y-6 flex flex-col items-center">
                            <h3 className={`text-lg font-medium text-text-primary w-full select-none cursor-default ${isRTL ? "text-right" : "text-left"}`}>{t('showcase.inlineCalendar')}</h3>
                            <Calendar
                                value={calendarDate}
                                onChange={setCalendarDate}
                                variant="single"
                                className="border rounded-lg"
                            />
                        </Card>
                    </div>
                </div>

                {/* ================================================================================== */}
                {/*                           FILE & GALLERY COMPONENTS SECTION                        */}
                {/* ================================================================================== */}
                <div className="space-y-6">
                    <div className={isRTL ? "text-right" : "text-left"}>
                        <h2 className="text-h3 text-text-primary select-none cursor-default">{t('showcase.fileMediaTitle')}</h2>
                        <p className="text-body text-text-secondary select-none cursor-default">{t('showcase.fileMediaSubtitle')}</p>
                    </div>

                    {/* File Uploaders */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6 space-y-6">
                            <h3 className="text-lg font-medium text-text-primary select-none cursor-default">{t('showcase.uploaderDrag')}</h3>
                            <div className="space-y-4">
                                <FileUploader
                                    variant="multiple"
                                    onUpload={handleUpload}
                                    className="h-full"
                                />
                                <div className="flex gap-4 items-center pt-2">
                                    <FileUploader variant="avatar" onUpload={handleUpload} />
                                    <div className={isRTL ? "text-right" : "text-left"}>
                                        <p className="text-sm font-medium text-text-primary select-none cursor-default">{t('showcase.avatarMode')}</p>
                                        <p className="text-xs text-text-secondary select-none cursor-default">{t('showcase.clickToUpload')}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 space-y-6">
                            <h3 className="text-lg font-medium text-text-primary select-none cursor-default">{t('showcase.imagePreviews')}</h3>
                            <div className="flex flex-col gap-4">
                                {/* Standalone Image Preview 1 */}
                                <div className="w-40">
                                    {previewImage ? (
                                        <>
                                            <ImagePreview
                                                src={previewImage.src}
                                                alt={previewImage.alt}
                                                variant="card"
                                                isPrimary={previewImage.isPrimary}
                                                onDelete={handlePreviewDelete}
                                                onSetPrimary={handlePreviewTogglePrimary}
                                                onRotate={handleRotate}
                                                onClick={() => { }} // No lightbox for this specific demo or maybe separate?
                                            // The user didn't explicitly ask for lightbox on the standalone, 
                                            // but "Clicking gallery images opens the lightbox" was requested.
                                            // For this preview box, clicking usually just shows it.
                                            // Let's keep it simple or maybe open lightbox with just this image?
                                            // For now, I'll remove the lightbox click to focus on the preview functionality as requested.
                                            />
                                            <p className="text-xs text-center mt-2 text-text-secondary select-none cursor-default">{t('booking.cardVariant')}</p>
                                        </>
                                    ) : (
                                        <div className="w-full aspect-square bg-secondary rounded-xl border-2 border-dashed border-accent/20 flex items-center justify-center">
                                            <p className="text-xs text-text-secondary">{t('booking.noImage')}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Standalone Image Preview 2 */}
                                <div className="w-full">
                                    {previewImage ? (
                                        <ImagePreview
                                            src={previewImage.src}
                                            alt={previewImage.alt}
                                            variant="list"
                                            isPrimary={previewImage.isPrimary}
                                            onDelete={handlePreviewDelete}
                                            onSetPrimary={handlePreviewTogglePrimary}
                                            onRotate={handleRotate}
                                        />
                                    ) : (
                                        <div className="w-full h-16 bg-secondary rounded-lg border border-dashed border-accent/20 flex items-center justify-center">
                                            <p className="text-xs text-text-secondary">{t('booking.noImageSelected')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Gallery & Lightbox */}
                    <Card className="p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-text-primary select-none cursor-default">{t('showcase.galleryInteractive')}</h3>
                            <p className="text-sm text-text-secondary select-none cursor-default">{t('showcase.lightboxHint')}</p>
                        </div>
                        {/* Gallery - passes handlers correctly */}
                        <Gallery
                            images={galleryImages}
                            variant="grid"
                            gap="md"
                            onDelete={handleDeleteImage}
                            onSetPrimary={handleSetPrimary}
                        // Gallery internally uses ImagePreview which now accepts clicks
                        // But Gallery.jsx already wraps them in a div with onClick to setLightboxIndex
                        // So we need to ensure Gallery.jsx sets the index correctly.
                        // Gallery.jsx has internal state for index. 
                        // WAIT: I should probably hoist lightbox state to here so the standalone images share the same Lightbox!
                        // Currently Gallery has its own Lightbox.
                        // The standalone images try to set 'lightboxIndex' HERE in ShowCase.
                        // BUT there is no Lightbox rendered in Showcase! It's inside Gallery!
                        // Fix: Render Lightbox in Showcase and pass handlers to Gallery to open it.
                        // But Gallery.jsx currently renders its own Lightbox.
                        // I should change Gallery to accept onImageClick or similar, 
                        // OR just let Gallery handle its own lightbox and add ANOTHER Lightbox for standalone? 
                        // NO, better to have one shared lightbox.
                        // I will modify Gallery to accept `onImageClick` and NOT render Lightbox itself if passed?
                        // Or simpler: Just render a second Lightbox at the root of Showcase for the shared state.
                        // AND update Gallery to use the passed down handlers if I want unified experience.
                        // Actually, I'll just let Gallery do its thing (it has its own internal lightbox state),
                        // AND I will add a Lightbox here for the standalone images.
                        />
                    </Card>
                </div>

                {/* Global Lightbox for Standalone Images (or shared if I refactored Gallery) */}
                <Lightbox
                    isOpen={lightboxIndex >= 0}
                    initialIndex={lightboxIndex}
                    images={galleryImages}
                    onClose={() => setLightboxIndex(-1)}
                />

            </div>
        </div>
    );
};

// Helper for icon (Removed redundant PlusIcon as it is imported from lucide-react)

export default CompositeShowcase;
