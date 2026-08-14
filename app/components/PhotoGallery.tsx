'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Sparkles, Heart, Star, Maximize2 } from 'lucide-react';
import styles from './PhotoGallery.module.scss';

const photos = Array.from({ length: 24 }, (_, i) => {
  const index = String(i + 1).padStart(2, '0');
  return {
    id: i + 1,
    src: `/images/photo-${index}.jpg`,
    alt: `Mithran Memory ${i + 1}`,
    caption: `Mithran's Precious Moment #${i + 1}`,
    styleType: (i % 6 === 0 ? 'hero' : i % 5 === 2 ? 'polaroid' : i % 4 === 1 ? 'tall' : 'card'),
  };
});

export default function PhotoGallery() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <section id="photo-gallery" className={styles.section}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1 }}
          className={styles.header}
        >
          <span className={styles.badge}>
            <Sparkles size={14} /> Treasure Box of Memories
          </span>
          <h2 className={styles.title}>Mithran&apos;s Precious Moments</h2>
          <p className={styles.subtitle}>
            A living photo album of smiles, giggles, and unforgettable milestone moments.
          </p>
        </motion.div>

        {/* Full Image Vertical Collage Grid */}
        <div className={styles.collageGrid}>
          {photos.map((photo, idx) => {
            const isPolaroid = photo.styleType === 'polaroid';
            const isHero = photo.styleType === 'hero';
            const isTall = photo.styleType === 'tall';

            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 35, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: (idx % 4) * 0.08 }}
                onClick={() => openLightbox(idx)}
                className={`${styles.item} ${isHero ? styles.itemHero : ''} ${
                  isTall ? styles.itemTall : ''
                } ${isPolaroid ? styles.itemPolaroid : ''}`}
              >
                {/* Washi Tape Pin for Polaroids */}
                {isPolaroid && (
                  <div className={styles.washiTape}>
                    <Star size={12} className={styles.tapeStar} />
                  </div>
                )}

                <div className={styles.imageBox}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={styles.img}
                  />
                  <div className={styles.hoverMask}>
                    <div className={styles.zoomCircle}>
                      <Maximize2 size={20} />
                    </div>
                    <span className={styles.hoverLabel}>View Moment #{photo.id}</span>
                  </div>
                </div>

                {isPolaroid ? (
                  <div className={styles.polaroidLabel}>
                    <span>Mithran &apos;s Smile ❤️</span>
                  </div>
                ) : (
                  <div className={styles.cardFooter}>
                    <Heart className={styles.heartMini} />
                    <span>Moment #{photo.id}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.lightbox}
            onClick={closeLightbox}
          >
            <button className={styles.closeBtn} onClick={closeLightbox} aria-label="Close">
              <X size={28} />
            </button>

            <div className={styles.lightboxBody} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.prevBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
                aria-label="Previous"
              >
                <ChevronLeft size={36} />
              </button>

              <motion.div
                key={selectedPhotoIndex}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className={styles.lightboxContent}
              >
                <div className={styles.lightboxImgContainer}>
                  <Image
                    src={photos[selectedPhotoIndex].src}
                    alt={photos[selectedPhotoIndex].alt}
                    fill
                    sizes="100vw"
                    className={styles.lightboxImg}
                  />
                </div>
                <div className={styles.lightboxFooter}>
                  <p>{photos[selectedPhotoIndex].caption}</p>
                  <span>
                    {selectedPhotoIndex + 1} / {photos.length}
                  </span>
                </div>
              </motion.div>

              <button
                className={styles.nextBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                aria-label="Next"
              >
                <ChevronRight size={36} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
