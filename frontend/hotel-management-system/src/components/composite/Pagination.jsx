import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button, Select } from '../ui';
import styles from './Pagination.module.css';

const Pagination = ({
    currentPage = 1,
    totalPages = 1,
    totalItems,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    className,
    showSizeSelector = true,
    showJumpTo = false,
}) => {

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show on each side of current
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        let l;
        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    return (
        <div className={cn(styles.container, className, "select-none")}>

            {/* Left Side: Page Size & Total Items */}
            <div className="flex items-center gap-4">
                {showSizeSelector && onPageSizeChange && (
                    <div className={styles.sizeSelector}>
                        <span>Rows per page:</span>
                        <Select
                            value={pageSize}
                            onChange={onPageSizeChange}
                            options={[
                                { value: 10, label: '10' },
                                { value: 25, label: '25' },
                                { value: 50, label: '50' },
                                { value: 100, label: '100' },
                            ]}
                            size="sm"
                            className="w-[70px]"
                        />
                    </div>
                )}
                {totalItems !== undefined && (
                    <span className="text-sm text-text-secondary select-none">
                        {totalItems} total items
                    </span>
                )}
            </div>

            {/* Right Side: Navigation */}
            <div className={styles.controls}>
                <button
                    className={styles.pageButton}
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    aria-label="First page"
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    className={styles.pageButton}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((page, idx) => (
    page === '...' ? (
        <span key={`dots-${idx}`} className={styles.dots}>...</span>
    ) : (
        <button
            key={page}
            className={cn(
                styles.pageButton, 
                currentPage === page && "bg-accent text-primary border-accent hover:bg-accent/90"
            )}
            onClick={() => handlePageChange(page)}
        >
            {page}
        </button>
    )
))}
                <button
                    className={styles.pageButton}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    className={styles.pageButton}
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label="Last page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    totalItems: PropTypes.number,
    pageSize: PropTypes.number,
    onPageChange: PropTypes.func.isRequired,
    onPageSizeChange: PropTypes.func,
    className: PropTypes.string,
    showSizeSelector: PropTypes.bool,
    showJumpTo: PropTypes.bool,
};

export default Pagination;
