'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, Play, Pause } from 'lucide-react';
import styles from './PhotoCarousel.module.scss';

const carouselPhotos = Array.from({ length: 24 }, (_, i) => {
  const index = String(i + 1).padStart(2, '0');
  return {
    id: i + 1,
    src: `/images/photo-${index}.jpg`,
    title: `Mithran Memory #${i + 1}`,
  };
});

export default function PhotoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % carouselPhotos.length);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselPhotos.length) % carouselPhotos.length);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  return (
    <section id="photo-carousel" className={styles.section}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          className={styles.header}
        >
          <span className={styles.badge}>
            <Sparkles size={14} /> Cinema Mode
          </span>
          <h2 className={styles.title}>Our Favorite Memories ❤️</h2>
          <p className={styles.subtitle}>Sit back and watch the story of Mithran unfold in cinematic motion.</p>
        </motion.div>

        {/* Carousel Frame */}
        <div className={styles.carouselFrame}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className={styles.slide}
            >
              {/* Ken Burns Effect Image */}
              <motion.div
                animate={{ scale: [1, 1.08] }}
                transition={{ duration: 6, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
                className={styles.kenBurnsWrap}
              >
                <Image
                  src={carouselPhotos[currentIndex].src}
                  alt={carouselPhotos[currentIndex].title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 1000px"
                  className={styles.carouselImg}
                />
              </motion.div>

              <div className={styles.captionOverlay}>
                <p>{carouselPhotos[currentIndex].title}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <button onClick={prevSlide} className={styles.navBtnLeft} aria-label="Previous Memory">
            <ChevronLeft size={32} />
          </button>
          <button onClick={nextSlide} className={styles.navBtnRight} aria-label="Next Memory">
            <ChevronRight size={32} />
          </button>

          {/* Play / Pause toggle button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={styles.pauseBtn}
            aria-label={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>

        {/* Progress Bar & Dots */}
        <div className={styles.progressBarWrapper}>
          <div className={styles.track}>
            <motion.div
              key={currentIndex}
              initial={{ width: '0%' }}
              animate={{ width: isPlaying ? '100%' : '0%' }}
              transition={{ duration: isPlaying ? 4.5 : 0, ease: 'linear' }}
              className={styles.fill}
            />
          </div>
          <div className={styles.counterText}>
            <span>{currentIndex + 1}</span> / {carouselPhotos.length}
          </div>
        </div>
      </div>
    </section>
  );
}
