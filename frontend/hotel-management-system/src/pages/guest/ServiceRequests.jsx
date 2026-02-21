import React, { useState, useEffect } from 'react';
import { useGuest } from '../../hooks/useGuest';
import { useLocalization } from '../../contexts/LocalizationContext';
import { Card, Badge, Button, SectionHeader, Input, Select, Modal } from '../../components/ui';
import { Plus, ConciergeBell, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './ServiceRequests.module.css';

const ServiceRequests = () => {
    const { t, currency } = useLocalization();
    const { serviceRequests, fetchServiceRequests, loading } = useGuest();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchServiceRequests();
    }, [fetchServiceRequests]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <SectionHeader
                    title={t('dashboard.services.title')}
                    subtitle={t('dashboard.services.subtitle')}
                />
                <Button variant="accent" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} style={{ marginRight: '0.5rem' }} />
                    {t('dashboard.services.new_request')}
                </Button>
            </header>

            <div className={styles.requestGrid}>
                {loading.requests ? (
                    <div className={styles.loading}>{t('common.loading')}...</div>
                ) : serviceRequests.length > 0 ? (
                    serviceRequests.map((request) => (
                        <Card key={request._id} className={styles.requestCard}>
                            <div className={styles.requestHeader}>
                                <div className={styles.serviceInfo}>
                                    <div className={styles.iconWrapper}>
                                        <ConciergeBell size={20} />
                                    </div>
                                    <div>
                                        <h3 className={styles.serviceName}>{request.serviceDetails?.name}</h3>
                                        <p className={styles.category}>{request.serviceDetails?.category}</p>
                                    </div>
                                </div>
                                <Badge variant={getStatusVariant(request.status)}>
                                    {t(`status.${request.status}`)}
                                </Badge>
                            </div>

                            <div className={styles.requestBody}>
                                <div className={styles.bodyItem}>
                                    <Clock size={16} />
                                    <span>{new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {request.specialInstructions && (
                                    <p className={styles.instructions}>
                                        "{request.specialInstructions}"
                                    </p>
                                )}
                            </div>

                            <div className={styles.requestFooter}>
                                <span className={styles.price}>{currency.symbol}{request.totalPrice}</span>
                                <span className={styles.detailsBtn}>{t('common.details')}</span>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <ConciergeBell size={48} className={styles.emptyIcon} />
                        <h3>{t('dashboard.services.empty_title')}</h3>
                        <p>{t('dashboard.services.empty_desc')}</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t('dashboard.services.new_request')}
            >
                <div className={styles.modalContent}>
                    <Select
                        label={t('dashboard.services.select_service')}
                        options={[
                            { value: 'room_service', label: 'Room Service' },
                            { value: 'laundry', label: 'Laundry' },
                            { value: 'spa', label: 'Spa' }
                        ]}
                    />
                    <Input
                        label={t('dashboard.services.quantity')}
                        type="number"
                        defaultValue={1}
                    />
                    <Input
                        as="textarea"
                        label={t('dashboard.services.instructions')}
                        placeholder={t('dashboard.services.instructions_placeholder')}
                    />
                    <div className={styles.modalActions}>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="accent">
                            {t('dashboard.services.submit')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const getStatusVariant = (status) => {
    switch (status) {
        case 'delivered': return 'success';
        case 'preparing': return 'accent';
        case 'pending': return 'warning';
        case 'cancelled': return 'error';
        default: return 'default';
    }
};

export default ServiceRequests;
