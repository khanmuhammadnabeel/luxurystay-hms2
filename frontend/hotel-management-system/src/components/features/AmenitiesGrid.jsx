// src/components/features/AmenitiesGrid.jsx
import React from 'react';
import { Card, SectionHeader } from '../ui';
import { amenities } from '../../data/homepageData';
import { useLocalization } from '../../contexts';
import styles from './AmenitiesGrid.module.css';

const AmenitiesGrid = () => {
    const { t, language } = useLocalization();
    const isUrdu = language === 'Urdu';

    return (
        <section className={styles.section} aria-labelledby="amenities-heading">
            <div className={styles.inner}>

                {/* Section Header */}
                <SectionHeader
                    preTitle={t('homepage.amenities.preTitle')}
                    title={t('homepage.amenities.title')}
                    subtitle={t('homepage.amenities.subtitle')}
                />

                {/* Amenities Grid */}
                <div className={styles.grid}>
                    {amenities.map(({ id, icon: Icon, title, titleUr, description, descriptionUr }) => (
                        <Card
                            key={id}
                            variant="glass"
                            className={styles.card}
                        >
                            {/* Icon */}
                            <div className={styles.iconWrap} aria-hidden="true">
                                <Icon
                                    className={styles.icon}
                                    size={48}
                                    strokeWidth={1.5}
                                />
                            </div>

                            {/* Title */}
                            <h3 className={styles.title}>
                                {isUrdu ? titleUr : title}
                            </h3>

                            {/* Description */}
                            <p className={styles.description}>
                                {isUrdu ? descriptionUr : description}
                            </p>
                        </Card>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default AmenitiesGrid;
