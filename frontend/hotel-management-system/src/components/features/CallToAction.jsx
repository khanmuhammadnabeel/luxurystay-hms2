// src/components/features/CallToAction.jsx
import React from 'react';
import Button from '../ui/Button';
import styles from './CallToAction.module.css';
import { ArrowRight } from 'lucide-react';

const CallToAction = () => {
    return (
        <section className={styles.section} aria-labelledby="cta-heading">
            {/* Glassmorphism card */}
            <div className={styles.glass}>

                {/* Gold decorative rule */}
                <div className={styles.rule} aria-hidden="true" />

                {/* Heading */}
                <h2 id="cta-heading" className={styles.heading}>
                    Ready for an unforgettable experience?
                </h2>

                {/* Subheading */}
                <p className={styles.subheading}>
                    Book your stay today and indulge in luxury
                </p>

                {/* CTA Button */}
                <div className={styles.btnWrap}>
                    <Button
                        variant="primary"
                        size="lg"
                        rightIcon={<ArrowRight size={18} />}
                        className={styles.btn}
                    >
                        Book Your Stay
                    </Button>
                </div>

                {/* Gold decorative rule */}
                <div className={styles.rule} aria-hidden="true" />

            </div>
        </section>
    );
};

export default CallToAction;
