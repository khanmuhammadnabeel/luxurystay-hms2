import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ArrowUp, ArrowDown, Download, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Checkbox, Button } from '../ui';
import Pagination from './Pagination';
import styles from './DataTable.module.css';

const DataTable = ({
    columns = [],
    data = [],
    loading = false,
    totalItems = 0,
    page = 1,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    onSort,
    onSelectionChange,
    selectedRowIds = [],
    variant = 'default', // default, striped, bordered, compact, spacious
    className,
    emptyMessage = "No data available",
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [internalSelection, setInternalSelection] = useState([]);

    // Handle Internal vs Controlled Selection
    const activeSelection = onSelectionChange ? selectedRowIds : internalSelection;
    const setActiveSelection = onSelectionChange ? onSelectionChange : setInternalSelection;

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        onSort && onSort({ key, direction });
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const allIds = data.map(item => item.id);
            setActiveSelection(allIds);
        } else {
            setActiveSelection([]);
        }
    };

    const handleSelectRow = (id, checked) => {
        if (checked) {
            setActiveSelection([...activeSelection, id]);
        } else {
            setActiveSelection(activeSelection.filter(selId => selId !== id));
        }
    };

    const isAllSelected = data.length > 0 && data.every(item => activeSelection.includes(item.id));
    const isIndeterminate = data.some(item => activeSelection.includes(item.id)) && !isAllSelected;

    return (
        <div className={cn(styles.wrapper, className)}>
            {/* Table Area */}
            <div className={styles.tableContainer}>
                <table className={cn(styles.table, styles[variant])}>
                    <thead className={styles.thead}>
                        <tr>
                            {/* Selection Checkbox Header */}
                            <th className={cn(styles.th, "w-12 text-center", "min-w-[3rem]")}>
                                <Checkbox
                                    checked={isAllSelected}
                                    indeterminate={isIndeterminate}
                                    onChange={handleSelectAll}
                                    size="sm"
                                />
                            </th>

                            {columns.map((col) => (
                                <th
                                    key={col.field}
                                    className={cn(
                                        styles.th,
                                        col.sortable && styles.sortable,
                                        col.align === 'right' && "text-right",
                                        col.align === 'center' && "text-center"
                                    )}
                                    style={{ width: col.width }}
                                    onClick={() => col.sortable && handleSort(col.field)}
                                >
                                    {col.header}
                                    {col.sortable && sortConfig.key === col.field && (
                                        <span className={cn(styles.sortIcon, "text-accent")}>
                                            {sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: pageSize }).map((_, i) => (
                                <tr key={`skeleton-${i}`} className={styles.tr}>
                                    {Array.from({ length: columns.length + 1 }).map((_, j) => (
                                        <td key={`skeleton-${i}-${j}`} className={styles.td}>
                                            <div className="h-4 bg-secondary/50 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr className={styles.tr}>
                                <td colSpan={columns.length + 1}>
                                    <div className={styles.emptyState}>
                                        <AlertCircle size={48} className="mx-auto mb-4 text-accent/50" />
                                        <p className="text-lg font-medium text-text-primary">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr
                                    key={row.id}
                                    className={cn(
                                        styles.tr,
                                        activeSelection.includes(row.id) && styles.selected
                                    )}
                                >
                                    <td className={cn(styles.td, "text-center")}>
                                        <Checkbox
                                            checked={activeSelection.includes(row.id)}
                                            onChange={(c) => handleSelectRow(row.id, c)}
                                            size="sm"
                                        />
                                    </td>
                                    {columns.map((col) => (
                                        <td
                                            key={`${row.id}-${col.field}`}
                                            className={cn(
                                                styles.td,
                                                col.align === 'right' && "text-right",
                                                col.align === 'center' && "text-center"
                                            )}
                                        >
                                            {col.render ? col.render(row) : row[col.field]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {(onPageChange || data.length > 0) && (
                <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(totalItems / pageSize)}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                    showSizeSelector={!!onPageSizeChange}
                />
            )}
        </div>
    );
};

DataTable.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        field: PropTypes.string.isRequired,
        header: PropTypes.string.isRequired,
        width: PropTypes.string,
        sortable: PropTypes.bool,
        render: PropTypes.func,
        align: PropTypes.oneOf(['left', 'center', 'right']),
    })).isRequired,
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    totalItems: PropTypes.number,
    page: PropTypes.number,
    pageSize: PropTypes.number,
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    onSort: PropTypes.func,
    onSelectionChange: PropTypes.func,
    selectedRowIds: PropTypes.array,
    variant: PropTypes.oneOf(['default', 'striped', 'bordered', 'compact', 'spacious']),
    className: PropTypes.string,
    emptyMessage: PropTypes.string,
};

export default DataTable;