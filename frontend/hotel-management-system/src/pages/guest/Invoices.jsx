import React, { useEffect } from 'react';
import { useGuest } from '../../hooks/useGuest';
import { useLocalization } from '../../contexts/LocalizationContext';
import { Card, Badge, Button, SectionHeader, DataTable } from '../../components/ui';
import { Download, FileText, ExternalLink } from 'lucide-react';
import styles from './Invoices.module.css';

const Invoices = () => {
    const { t, currency } = useLocalization();
    const { invoices, fetchInvoices, loading } = useGuest();

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const columns = [
        {
            key: 'invoiceNumber',
            label: t('dashboard.invoices.number'),
            render: (val) => <span className={styles.number}>{val}</span>
        },
        {
            key: 'issueDate',
            label: t('dashboard.invoices.date'),
            render: (val) => new Date(val).toLocaleDateString()
        },
        {
            key: 'roomId',
            label: t('dashboard.invoices.room'),
            render: (val) => val?.roomNumber || '-'
        },
        {
            key: 'totalAmount',
            label: t('dashboard.invoices.amount'),
            render: (val) => <span className={styles.amount}>{currency.symbol}{val}</span>
        },
        {
            key: 'status',
            label: t('dashboard.invoices.status'),
            render: (val) => (
                <Badge variant={val === 'paid' ? 'success' : val === 'overdue' ? 'error' : 'warning'}>
                    {t(`status.${val}`)}
                </Badge>
            )
        },
        {
            key: 'actions',
            label: '',
            render: (_, row) => (
                <div className={styles.rowActions}>
                    <button className={styles.iconBtn} title={t('dashboard.invoices.view')}>
                        <ExternalLink size={18} />
                    </button>
                    <button className={styles.iconBtn} title={t('dashboard.invoices.download')}>
                        <Download size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <SectionHeader
                    title={t('dashboard.invoices.title')}
                    subtitle={t('dashboard.invoices.subtitle')}
                />
            </header>

            <Card className={styles.tableCard}>
                {loading.invoices ? (
                    <div className={styles.loading}>{t('common.loading')}...</div>
                ) : invoices.length > 0 ? (
                    <DataTable
                        columns={columns}
                        data={invoices}
                        className={styles.table}
                    />
                ) : (
                    <div className={styles.emptyState}>
                        <FileText size={48} className={styles.emptyIcon} />
                        <h3>{t('dashboard.invoices.empty_title')}</h3>
                        <p>{t('dashboard.invoices.empty_desc')}</p>
                    </div>
                )}
            </Card>

            <div className={styles.infoCard}>
                <div className={styles.infoContent}>
                    <h3>{t('dashboard.invoices.payment_help_title')}</h3>
                    <p>{t('dashboard.invoices.payment_help_desc')}</p>
                </div>
                <Button variant="accent" size="sm">
                    {t('dashboard.invoices.contact_billing')}
                </Button>
            </div>
        </div>
    );
};

export default Invoices;
