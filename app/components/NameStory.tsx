'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Sun } from 'lucide-react';
import styles from './NameStory.module.scss';

export default function NameStory() {
  return (
    <section id="name-story" className={styles.section}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          className={styles.header}
        >
          <span className={styles.sectionBadge}>
            <Sparkles size={14} /> The Story of a Name
          </span>
          <h2 className={styles.title}>A Name Made With Love</h2>
          <p className={styles.subtitle}>
            Before you were born, we carried a promise in our hearts. Your name is the reflection of our bond.
          </p>
        </motion.div>

        {/* Morphing Cards Section */}
        <div className={styles.equationWrapper}>
          {/* Card 1: Muthukumar */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`${styles.parentCard} ${styles.muthuCard}`}
          >
            <div className={styles.fatherBadge}>FATHER</div>
            <h3 className={styles.parentName}>Muthukumar</h3>
            <div className={styles.arrowLine}>
              <div className={styles.lineGlow} />
            </div>
            <div className={styles.extractedLetter}>
              <span>M</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={styles.plusSign}
          >
            <Heart className={styles.heartPulse} />
          </motion.div>

          {/* Card 2: Pavithra */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`${styles.parentCard} ${styles.paviCard}`}
          >
            <div className={styles.motherBadge}>MOTHER</div>
            <h3 className={styles.parentName}>Pavithra</h3>
            <div className={styles.arrowLine}>
              <div className={styles.lineGlow} />
            </div>
            <div className={styles.extractedLetters}>
              <span>ITHRA</span>
            </div>
          </motion.div>
        </div>

        {/* Combined Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className={styles.resultCard}
        >
          <div className={styles.resultHeader}>
            <span>M</span>
            <span className={styles.goldText}>ITHRA</span>
            <span>N</span>
          </div>
          <h1 className={styles.combinedName}>MITHRAN</h1>

          <div className={styles.quotesWrapper}>
            <p className={styles.quoteHighlight}>&ldquo;Two hearts. One beautiful name.&rdquo;</p>
            <p className={styles.quoteSub}>&ldquo;A little piece of us, in the name of you.&rdquo;</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
