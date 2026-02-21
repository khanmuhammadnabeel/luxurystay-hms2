import React from 'react';
import styles from './DataTable.module.css';
import clsx from 'clsx';

const DataTable = ({ columns, data, className }) => {
    return (
        <div className={clsx(styles.wrapper, className)}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className={styles.th}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={row._id || rowIndex} className={styles.tr}>
                            {columns.map((col) => (
                                <td key={`${rowIndex}-${col.key}`} className={styles.td}>
                                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
