'use client';

import React from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Heart, ChevronDown } from 'lucide-react';
import styles from './Hero.module.scss';

const nameLetters = ['M', 'I', 'T', 'H', 'R', 'A', 'N'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.5,
    },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 50, rotateX: 90 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
};

const dancingPhotos = [
  { id: 'top-left', src: '/images/bigmovements/lord-krishna-getup.jpg', label: 'Little Krishna ✨', className: styles.danceTopLeft },
  { id: 'top-right', src: '/images/bigmovements/lord-murugan-getup.jpg', label: 'Lord Murugan 👑', className: styles.danceTopRight },
  { id: 'mid-left', src: '/images/bigmovements/girl-getup.jpg', label: 'Cutie Avatar 💖', className: styles.danceMidLeft },
  { id: 'mid-right', src: '/images/bigmovements/ear-piercing-ceremony.jpg', label: 'Kadhukuthu 🪔', className: styles.danceMidRight },
  { id: 'bot-left', src: '/images/bigmovements/month-4.jpg', label: 'Month 4 😊', className: styles.danceBotLeft },
  { id: 'bot-right', src: '/images/bigmovements/month-6.jpg', label: 'Month 6 🌟', className: styles.danceBotRight },
];

export default function Hero() {
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, -120]);
  const opacityParallax = useTransform(scrollY, [0, 350], [1, 0]);

  return (
    <section id="hero" className={styles.heroSection}>
      {/* Background Starfield */}
      <div className={styles.starfield}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className={styles.star}
            style={{
              top: `${(i * 17) % 100}%`,
              left: `${(i * 23) % 100}%`,
              animationDelay: `${(i * 0.3) % 4}s`,
              transform: `scale(${0.5 + (i % 3) * 0.3})`,
            }}
          />
        ))}
      </div>
      <div className={styles.glowOrb1} />
      <div className={styles.glowOrb2} />

      {/* 6 Dancing Floating Mini Photos around Title */}
      <div className={styles.dancingPhotosWrapper}>
        {dancingPhotos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: 1,
              scale: [1, 1.05, 1],
              y: [-8, 8, -8],
              rotate: i % 2 === 0 ? [-5, 5, -5] : [5, -5, 5],
            }}
            transition={{
              duration: 3.5 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.8 + i * 0.2,
            }}
            className={`${styles.dancingFrame} ${photo.className}`}
          >
            <div className={styles.dancingImgInner}>
              <Image src={photo.src} alt={photo.label} fill sizes="140px" className={styles.dancingImg} />
            </div>
            <span className={styles.dancingLabel}>{photo.label}</span>
          </motion.div>
        ))}
      </div>

      <motion.div style={{ y: yParallax, opacity: opacityParallax }} className={styles.heroContent}>
        {/* Step 1: Subtitle tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className={styles.subtitleBadge}
        >
          <Sparkles className={styles.sparkleIcon} />
          <span>A Little Star Came Into Our World...</span>
          <Sparkles className={styles.sparkleIcon} />
        </motion.div>

        {/* Step 2: Name letter by letter reveal */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={styles.nameTitle}
        >
          {nameLetters.map((letter, index) => (
            <motion.span key={index} variants={letterVariants} className={styles.letter}>
              {letter}
            </motion.span>
          ))}
        </motion.h1>

        {/* Sub-tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
          className={styles.miracleTag}
        >
          Our Little Miracle <Heart className={styles.heartInline} />
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.2 }}
          className={styles.parentsTag}
        >
          A name created with the love of <span>Muthukumar</span> &amp; <span>Pavithra</span>
        </motion.p>

        {/* Main Circular Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 2.5, type: 'spring' }}
          className={styles.portraitWrapper}
        >
          <div className={styles.glowingRing} />
          <div className={styles.imageContainer}>
            <Image
              src="/images/photo-25.jpg"
              alt="Mithran"
              fill
              priority
              sizes="(max-width: 768px) 240px, 320px"
              className={styles.heroImg}
            />
          </div>

          {/* Floating Heart particles around photo */}
          <motion.div
            animate={{ y: [-5, -20, -5], opacity: [0.3, 1, 0.3], x: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className={styles.floatingHeart1}
          >
            ❤️
          </motion.div>

          <motion.div
            animate={{ y: [0, -25, 0], opacity: [0.4, 0.9, 0.4], x: [10, -10, 10] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className={styles.floatingHeart2}
          >
            ✨
          </motion.div>

          <motion.div
            animate={{ y: [-10, -30, -10], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className={styles.floatingHeart3}
          >
            💖
          </motion.div>
        </motion.div>

        {/* Highlighted Scroll Down Indicator */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 2.8, duration: 0.8 },
            y: { delay: 3, duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={styles.scrollDownHighlight}
          aria-label="Scroll to explore timeline"
        >
          <span className={styles.scrollBadge}>
            <Sparkles className={styles.scrollIconLeft} />
            <span className={styles.scrollText}>Scroll to Explore</span>
            <ChevronDown className={styles.scrollChevron} />
          </span>
        </motion.button>
      </motion.div>
    </section>
  );
}
