// src/components/features/TestimonialsCarousel.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Star } from 'lucide-react';
import { Card, SectionHeader } from '../ui';
import { testimonials } from '../../data/homepageData';
import styles from './TestimonialsCarousel.module.css';

const TestimonialsCarousel = () => {
    return (
        <section className={styles.section} aria-labelledby="testimonials-heading">
            <div className={styles.inner}>

                {/* Section Header */}
                <SectionHeader
                    preTitle="GUEST EXPERIENCES"
                    title="What Our Guests Say"
                    subtitle="Real stories from real stays"
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
                    {testimonials.map((t) => (
                        <SwiperSlide key={t.id}>
                            <Card variant="default" className={styles.card}>

                                {/* Author row: avatar + name + stars */}
                                <div className={styles.author}>
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        className={styles.avatar}
                                        loading="lazy"
                                    />
                                    <div className={styles.authorInfo}>
                                        <p className={styles.name}>{t.name}</p>
                                        <div className={styles.stars} aria-label={`${t.rating} out of 5 stars`}>
                                            {Array.from({ length: t.rating }).map((_, i) => (
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
                                <p className={styles.review}>{t.review}</p>

                            </Card>
                        </SwiperSlide>
                    ))}
                </Swiper>

            </div>
        </section>
    );
};

export default TestimonialsCarousel;
