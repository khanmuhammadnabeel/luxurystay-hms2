// src/components/features/TestimonialsCarousel.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Star } from 'lucide-react';
import { Card, SectionHeader } from '../ui';
import { testimonials } from '../../data/homepageData';
import { useLocalization } from '../../contexts';
import styles from './TestimonialsCarousel.module.css';

const TestimonialsCarousel = () => {
    const { t, language } = useLocalization();
    const isUrdu = language === 'Urdu';

    return (
        <section className={styles.section} aria-labelledby="testimonials-heading">
            <div className={styles.inner}>

                {/* Section Header */}
                <SectionHeader
                    preTitle={t('homepage.testimonials.preTitle')}
                    title={t('homepage.testimonials.title')}
                    subtitle={t('homepage.testimonials.subtitle')}
                />

                {/* Swiper Carousel */}
                <Swiper
                    className={styles.swiper}
                    modules={[Autoplay, Pagination]}
                    slidesPerView={1}
                    spaceBetween={30}
                    loop={true}
                    speed={800}
                    autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    pagination={{ clickable: true }}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                >
                    {testimonials.map((t_item) => (
                        <SwiperSlide key={t_item.id}>
                            <Card variant="default" className={styles.card}>

                                {/* Author row: avatar + name + stars */}
                                <div className={styles.author}>
                                    <img
                                        src={t_item.avatar}
                                        alt={t_item.name}
                                        className={styles.avatar}
                                        loading="lazy"
                                    />
                                    <div className={styles.authorInfo}>
                                        <p className={styles.name}>{t_item.name}</p>
                                        <div className={styles.stars} aria-label={`${t_item.rating} out of 5 stars`}>
                                            {Array.from({ length: t_item.rating }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={13}
                                                    fill="#CFAF7E"
                                                    color="#CFAF7E"
                                                    strokeWidth={0}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Review text */}
                                <p className={styles.review}>
                                    {isUrdu ? t_item.reviewUr : t_item.review}
                                </p>

                            </Card>
                        </SwiperSlide>
                    ))}
                </Swiper>

            </div>
        </section>
    );
};

export default TestimonialsCarousel;
