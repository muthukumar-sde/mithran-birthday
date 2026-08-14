'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './AnimatedBackgroundOrbs.module.scss';

export default function AnimatedBackgroundOrbs() {
  return (
    <div className={styles.orbsWrapper}>
      <motion.div
        animate={{
          x: [0, 80, -60, 0],
          y: [0, -70, 90, 0],
          scale: [1, 1.25, 0.9, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`${styles.orb} ${styles.orbGold}`}
      />

      <motion.div
        animate={{
          x: [0, -90, 70, 0],
          y: [0, 80, -60, 0],
          scale: [1, 0.85, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className={`${styles.orb} ${styles.orbRose}`}
      />

      <motion.div
        animate={{
          x: [0, 60, -80, 0],
          y: [0, 90, -70, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className={`${styles.orb} ${styles.orbViolet}`}
      />

      <motion.div
        animate={{
          x: [0, -70, 50, 0],
          y: [0, -60, 80, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 6,
        }}
        className={`${styles.orb} ${styles.orbCyan}`}
      />
    </div>
  );
}
