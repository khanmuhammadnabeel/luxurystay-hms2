import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';
import Input from './Input';
import styles from './Select.module.css'; // Reusing select dropdown styles

const countryCodes = [
    { code: '+92', flag: '🇵🇰', name: 'Pakistan', country: 'PK' },
    { code: '+1', flag: '🇺🇸', name: 'USA', country: 'US' },
    { code: '+44', flag: '🇬🇧', name: 'UK', country: 'GB' },
    { code: '+971', flag: '🇦🇪', name: 'UAE', country: 'AE' },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', country: 'SA' },
    { code: '+91', flag: '🇮🇳', name: 'India', country: 'IN' },
    { code: '+61', flag: '🇦🇺', name: 'Australia', country: 'AU' },
    { code: '+1', flag: '🇨🇦', name: 'Canada', country: 'CA' },
    { code: '+49', flag: '🇩🇪', name: 'Germany', country: 'DE' },
    { code: '+33', flag: '🇫🇷', name: 'France', country: 'FR' },
    { code: '+81', flag: '🇯🇵', name: 'Japan', country: 'JP' },
    { code: '+86', flag: '🇨🇳', name: 'China', country: 'CN' },
    { code: '+7', flag: '🇷🇺', name: 'Russia', country: 'RU' },
    { code: '+55', flag: '🇧🇷', name: 'Brazil', country: 'BR' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa', country: 'ZA' },
    { code: '+90', flag: '🇹🇷', name: 'Turkey', country: 'TR' },
];

const PhoneInput = ({
    label,
    value, // Full phone number including code
    onChange,
    error,
    disabled = false,
    required = false,
    placeholder = "123 4567890",
    size = 'md',
    className,
    ...props
}) => {
    // Extract code and number from initial value
    const initialCountry = countryCodes.find(c => value?.startsWith(c.code)) || countryCodes[0];

    // Ensure value starts with the country code if it's a new field
    const effectiveValue = value || initialCountry.code;

    const [selectedCountry, setSelectedCountry] = useState(initialCountry);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Update parent when country is switched (auto-updates the prefix in input)
    const handleCountrySelect = (country) => {
        const oldCode = selectedCountry.code;
        const newCode = country.code;

        // Replace old code with new code in the input value
        let newValue = value || '';
        if (newValue.startsWith(oldCode)) {
            newValue = newCode + newValue.substring(oldCode.length);
        } else {
            newValue = newCode + ' ' + newValue.trim();
        }

        setSelectedCountry(country);
        setIsOpen(false);

        onChange?.({
            target: {
                name: props.name,
                value: newValue
            }
        });
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePhoneChange = (e) => {
        onChange?.(e);
    };

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            {/* Label - Matches Input.jsx exactly */}
            {label && (
                <label className={cn(
                    "text-[var(--text-sm)] font-[var(--font-medium)] font-sans",
                    "tracking-[var(--tracking-wide)] leading-none select-none text-foreground"
                )}>
                    {label}
                </label>
            )}

            {/* Field Wrapper - Matches Input.jsx structure */}
            <div className="relative flex items-stretch">
                {/* Country Selector - Merged Look */}
                <div className="relative flex" ref={dropdownRef}>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 border transition-all duration-200 bg-[var(--color-secondary)] border-[var(--glass-border)]",
                            "rounded-l-[var(--radius-lg)] rounded-r-none border-r-0",
                            "hover:border-accent/10 focus:z-10 focus:ring-2 focus:ring-accent/20 outline-none",
                            disabled && "opacity-50 cursor-not-allowed",
                            size === 'lg' ? 'h-12' : 'h-10'
                        )}
                    >
                        <span className="text-xl leading-none">{selectedCountry.flag}</span>
                        <ChevronDown size={14} className={cn("text-text-secondary opacity-60 transition-transform", isOpen && "rotate-180")} />
                    </button>

                    {isOpen && (
                        <div className={cn(
                            "absolute z-[100] top-full left-0 mt-2 w-64 bg-glass backdrop-blur-xl border border-glass-border rounded-xl shadow-gold-lg overflow-hidden",
                            styles.selectDropdown
                        )}>
                            <ul className="max-h-64 overflow-y-auto py-2">
                                {countryCodes.map((country) => (
                                    <li
                                        key={`${country.country}-${country.code}`}
                                        className={cn(
                                            "px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3 transition-colors select-none",
                                            "hover:bg-accent/10",
                                            selectedCountry.country === country.country && "bg-accent/5 text-accent font-medium"
                                        )}
                                        onClick={() => handleCountrySelect(country)}
                                    >
                                        <span className="text-xl">{country.flag}</span>
                                        <span className="flex-1 text-text-primary">{country.name}</span>
                                        <span className="text-text-secondary font-mono">{country.code}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Input Field - Matches Input.jsx core styles */}
                <input
                    type="tel"
                    value={effectiveValue}
                    onChange={handlePhoneChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        "w-full font-sans text-foreground placeholder:text-muted-foreground",
                        "transition-all duration-150 focus-visible:outline-none bg-transparent border border-[var(--glass-border)]",
                        "rounded-r-[var(--radius-lg)] rounded-l-none border-l-0",
                        "focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none px-3",
                        size === 'lg' ? 'h-12 text-base' : 'h-10 text-sm',
                        error && "border-[var(--color-error-light)] focus:ring-[var(--color-error-light)]/20",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    {...props}
                />
            </div>

            {/* Error Message Row - Matches Input.jsx exactly */}
            {error && (
                <div className="min-h-[1.25rem]">
                    <ErrorMessage
                        message={typeof error === "string" ? error : undefined}
                        messages={Array.isArray(error) ? error : undefined}
                        mode="inline"
                    />
                </div>
            )}
        </div>
    );
};

PhoneInput.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    placeholder: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    className: PropTypes.string,
    name: PropTypes.string,
};

export default PhoneInput;
