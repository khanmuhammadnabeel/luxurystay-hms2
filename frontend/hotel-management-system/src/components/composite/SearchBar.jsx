import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Search, X, Clock, Loader2, Mic } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../ui';
import { useLocalization } from '../../contexts';
import styles from './SearchBar.module.css';

const SearchBar = ({
    onSearch,
    placeholder = "Search...",
    variant = 'default', // default, global, compact
    suggestions = [],
    loading = false,
    enableRecent = true,
    className,
    delay = 300,
    value: controlledValue,
    onChange: controlledOnChange,
}) => {
    const { t } = useLocalization();
    const [query, setQuery] = useState(controlledValue || '');
    const [isFocused, setIsFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const debounceTimer = useRef(null);
    const wrapperRef = useRef(null);

    // Sync internal query with controlledValue
    useEffect(() => {
        if (controlledValue !== undefined) {
            setQuery(controlledValue);
        }
    }, [controlledValue]);

    // Load recent searches from localStorage
    useEffect(() => {
        if (enableRecent) {
            const saved = localStorage.getItem('ls_recent_searches');
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            }
        }
    }, [enableRecent]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (searchTerm) => {
        onSearch && onSearch(searchTerm);

        // Save to recent
        if (enableRecent && searchTerm.trim()) {
            const newRecent = [
                searchTerm,
                ...recentSearches.filter(s => s !== searchTerm)
            ].slice(0, 5); // Keep last 5
            setRecentSearches(newRecent);
            localStorage.setItem('ls_recent_searches', JSON.stringify(newRecent));
        }

        setIsFocused(false);
    };

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);
        controlledOnChange && controlledOnChange(val);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            onSearch && onSearch(val);
        }, delay);
    };

    const clearSearch = () => {
        setQuery('');
        onSearch && onSearch('');
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };

    return (
        <div
            className={cn(styles.container, styles[variant], className)}
            ref={wrapperRef}
        >
            <div className={styles.searchWrapper}>
                <Input
                    value={query}
                    onChange={handleInput}
                    onFocus={() => setIsFocused(true)}
                    placeholder={placeholder}
                    leftIcon={<Search size={variant === 'compact' ? 14 : 18} />}
                    className={cn(
                        variant === 'global' && "bg-transparent border-0 border-b-2 rounded-none px-0 text-lg focus:ring-0",
                        variant === 'compact' && "h-8 text-sm"
                    )}
                />

                {loading && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                        <Loader2 size={16} className="animate-spin text-accent" />
                    </div>
                )}

                {query && (
                    <button
                        onClick={clearSearch}
                        className={styles.clearButton}
                        aria-label={t('common.clear')}
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Dropdown for Suggestions/Recent */}
            {isFocused && (
                (suggestions.length > 0 || (enableRecent && recentSearches.length > 0 && !query)) && (
                    <div className={cn(styles.suggestions, "bg-glass backdrop-blur-md")}>

                        {/* Suggestions from API/Props */}
                        {query && suggestions.map((item, idx) => (
                            <div
                                key={idx}
                                className={cn(styles.suggestionItem, "select-none")}
                                onClick={() => {
                                    setQuery(item);
                                    handleSearch(item);
                                }}
                            >
                                <Search size={14} className={styles.itemIcon} />
                                <span className={styles.itemText}>
                                    {item}
                                </span>
                            </div>
                        ))}

                        {/* Recent Searches (only show when no query typed) */}
                        {!query && enableRecent && recentSearches.map((item, idx) => (
                            <div
                                key={`recent-${idx}`}
                                className={cn(styles.recentItem, "select-none")}
                                onClick={() => {
                                    setQuery(item);
                                    handleSearch(item);
                                }}
                            >
                                <Clock size={14} className={styles.itemIcon} />
                                <span className={styles.itemText}>{item}</span>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

SearchBar.propTypes = {
    onSearch: PropTypes.func,
    placeholder: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'global', 'compact']),
    suggestions: PropTypes.arrayOf(PropTypes.string),
    loading: PropTypes.bool,
    enableRecent: PropTypes.bool,
    className: PropTypes.string,
    delay: PropTypes.number,
    value: PropTypes.string,
    onChange: PropTypes.func,
};

export default SearchBar;
