'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer id="forever" className={styles.footer}>
      <div className={styles.backgroundGlow} />

      {/* Floating stars */}
      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <div
            key={star}
            className={styles.starDot}
            style={{
              top: `${(star * 9) % 100}%`,
              left: `${(star * 13) % 100}%`,
              animationDelay: `${star * 0.4}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          className={styles.messageBox}
        >
          <div className={styles.sparkleRow}>
            <Sparkles className={styles.sparkle} />
            <span>Forever &amp; Always</span>
            <Sparkles className={styles.sparkle} />
          </div>

          <h2 className={styles.happyText}>Happy Birthday</h2>
          <h1 className={styles.mithranText}>MITHRAN ✨</h1>

          <p className={styles.lovedText}>&ldquo;You are loved more than words can ever say.&rdquo;</p>

          <div className={styles.divider} />

          <div className={styles.signatureBlock}>
            <span className={styles.withLove}>With Love</span>
            <Heart className={styles.heartIcon} />
            <h3 className={styles.parentsNames}>Muthukumar &amp; Pavithra</h3>
          </div>

          <p className={styles.copyright}>
            Designed with endless love for Mithran &bull; {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
