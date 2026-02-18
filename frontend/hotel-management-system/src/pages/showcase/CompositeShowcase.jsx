import React, { useState, useEffect, useMemo } from 'react';
import {
    DataTable,
    Pagination,
    SearchBar,
    FilterChips,
    Calendar,
    DatePicker,
    TimePicker,
    RangePicker
} from '../../components/composite';
import { Button, Card, Divider } from '../../components/ui';
import { useTheme } from '../../contexts/ThemeContext';
import { Eye, Edit, Trash2, MoreVertical, User, CreditCard, Download } from 'lucide-react';

const MOCK_DATA = Array.from({ length: 50 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + (i % 5)); // Generate Today, Tomorrow, +2, +3, +4 days
    return {
        id: `BK-${1000 + i}`,
        guest: ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Wilson'][i % 5],
        room: ['Deluxe Suite', 'Standard Room', 'Ocean View', 'Penthouse', 'Family Suite'][i % 5],
        type: ['King', 'Twin', 'Queen'][i % 3],
        status: ['Confirmed', 'Pending', 'Checked In', 'Cancelled'][i % 4],
        amount: [299, 199, 450, 899, 350][i % 5],
        date: date.toLocaleDateString(),
    };
});

const CompositeShowcase = () => {
    const { theme, toggleTheme } = useTheme();

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
            'Date': ['Today', 'Tomorrow']
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
        { field: 'id', header: 'Booking ID', sortable: true, width: '120px' },
        {
            field: 'guest',
            header: 'Guest',
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
        { field: 'room', header: 'Room Type', sortable: true },
        {
            field: 'status',
            header: 'Status',
            sortable: true,
            align: 'center',
            render: (row) => {
                const colors = {
                    'Confirmed': 'bg-green-500/10 text-green-500',
                    'Pending': 'bg-yellow-500/10 text-yellow-500',
                    'Checked In': 'bg-blue-500/10 text-blue-500',
                    'Cancelled': 'bg-red-500/10 text-red-500',
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium select-none ${colors[row.status]}`}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            field: 'date',
            header: 'Check-in',
            sortable: true,
            width: '120px'
        },
        {
            field: 'amount',
            header: 'Amount',
            sortable: true,
            align: 'right',
            render: (row) => <span className="font-medium">${row.amount}</span>
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

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-h2 text-text-primary select-none">Bookings Management</h1>
                        <p className="text-body text-text-secondary select-none">Composite Components Showcase</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={toggleTheme}
                        leftIcon={theme === 'dark' ? '🌙' : '☀️'}
                    >
                        {theme === 'dark' ? 'Dark' : 'Light'} Mode
                    </Button>
                </div>

                <Card className="p-6 space-y-6 overflow-visible">

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="Search bookings..."
                            variant="default"
                            className="max-w-md"
                            enableRecent={true}
                        />
                        <div className="flex gap-2">
                            <Button variant="outline" leftIcon={<Download size={16} />}>Export</Button>
                            <Button variant="primary" leftIcon={<PlusIcon size={16} />} >New Booking</Button>
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
                        emptyMessage="No bookings found."
                    />

                </Card>

                {/* Date & Time Showcase */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-h3 text-text-primary select-none">Date & Time Components</h2>
                        <p className="text-body text-text-secondary select-none">Advanced pickers for booking flows</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Input Pickers */}
                        <Card className="p-6 space-y-6 overflow-visible">
                            <h3 className="text-lg font-medium text-text-primary">Input Pickers</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary block">Date Picker (Input)</label>
                                    <DatePicker
                                        value={date}
                                        onChange={setDate}
                                        placeholder="Pick a date"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary block">Time Picker (Dropdown)</label>
                                    <TimePicker
                                        value={time}
                                        onChange={setTime}
                                        label="Check-in Time"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-secondary block">Range Picker (Booking)</label>
                                    <RangePicker
                                        value={range}
                                        onChange={setRange}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Right: Inline Calendar */}
                        <Card className="p-6 space-y-6 flex flex-col items-center">
                            <h3 className="text-lg font-medium text-text-primary w-full text-left">Inline Calendar</h3>
                            <Calendar
                                value={calendarDate}
                                onChange={setCalendarDate}
                                variant="single"
                                className="border rounded-lg"
                            />
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Helper for icon
const PlusIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default CompositeShowcase;
