'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Quote, Sparkles } from 'lucide-react';
import styles from './BirthdayMessage.module.scss';

export default function BirthdayMessage() {
  const paragraphs = [
    'From the moment you came into our lives, you filled our world with a happiness we never knew existed.',
    'Your smile became our favorite sight.\nYour laughter became our favorite sound.\nEvery little moment with you became a beautiful memory.',
    'You are our little star, our greatest blessing and the most beautiful chapter of our lives.',
    'Happy Birthday, Mithran.',
    'May your life always be filled with happiness, love, laughter and endless dreams.',
  ];

  return (
    <section id="birthday-message" className={styles.section}>
      <div className={styles.ambientGlow} />

      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          className={styles.header}
        >
          <span className={styles.badge}>
            <Sparkles size={14} /> From Mom &amp; Dad
          </span>
          <h2 className={styles.title}>To Our Dear Mithran...</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9 }}
          className={styles.letterCard}
        >
          <Quote className={styles.quoteTop} />

          <div className={styles.parentPortraitWrap}>
            <div className={styles.portraitRing}>
              <Image
                src="/images/photo-08.jpg"
                alt="Parents & Mithran"
                fill
                sizes="140px"
                className={styles.portraitImg}
              />
            </div>
          </div>

          <div className={styles.letterBody}>
            {paragraphs.map((text, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                className={`${styles.paragraph} ${
                  idx === 3 ? styles.birthdayWishHighlight : ''
                }`}
              >
                {text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </motion.p>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className={styles.signatureWrap}
            >
              <span className={styles.sigPrefix}>With all our love,</span>
              <h3 className={styles.sigNames}>
                Muthukumar &amp; Pavithra <Heart className={styles.heartSig} />
              </h3>
            </motion.div>
          </div>

          <Quote className={styles.quoteBottom} />
        </motion.div>
      </div>
    </section>
  );
}
