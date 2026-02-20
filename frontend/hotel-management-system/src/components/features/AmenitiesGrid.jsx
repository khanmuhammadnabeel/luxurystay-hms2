// src/components/features/AmenitiesGrid.jsx
import React from 'react';
import { Card, SectionHeader } from '../ui';
import { amenities } from '../../data/homepageData';
import styles from './AmenitiesGrid.module.css';

const AmenitiesGrid = () => {
    return (
        <section className={styles.section} aria-labelledby="amenities-heading">
            <div className={styles.inner}>

                {/* Section Header */}
                <SectionHeader
                    preTitle="HANDCRAFTED FOR YOU"
                    title="World-Class Amenities"
                    subtitle="Everything you need for the perfect stay"
                />

                {/* Amenities Grid */}
                <div className={styles.grid}>
                    {amenities.map(({ id, icon: Icon, title, description }) => (
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
                            <h3 className={styles.title}>{title}</h3>

                            {/* Description */}
                            <p className={styles.description}>{description}</p>
                        </Card>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default AmenitiesGrid;
