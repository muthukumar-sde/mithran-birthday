'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Heart } from 'lucide-react';
import { triggerConfetti } from './Confetti';
import Fireworks from './Fireworks';
import styles from './BirthdayCelebration.module.scss';

export default function BirthdayCelebration() {
  const [blownOut, setBlownOut] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);

  const handleBlowOutCandles = () => {
    if (blownOut) return;
    setBlownOut(true);
    setScreenFlash(true);

    setTimeout(() => setScreenFlash(false), 800);
    triggerConfetti();
  };

  const handleReset = () => {
    setBlownOut(false);
  };

  return (
    <section id="birthday-celebration" className={styles.section}>
      <Fireworks active={blownOut} />

      {/* Screen Glow Flash Effect */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={styles.flashOverlay}
          />
        )}
      </AnimatePresence>

      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          className={styles.header}
        >
          <span className={styles.badge}>
            <Sparkles size={14} /> The Grand Celebration
          </span>
          <h2 className={styles.topWish}>🎂 HAPPY BIRTHDAY 🎂</h2>
          <h1 className={styles.bigName}>MITHRAN</h1>
        </motion.div>

        {/* Multi-Tier Interactive Cake */}
        <div className={styles.cakeStage}>
          {!blownOut && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0.6, 1, 0.6], y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={styles.tapInstruction}
            >
              ✨ Tap the candles to blow them out &amp; make a wish! ✨
            </motion.p>
          )}

          <div
            className={`${styles.cakeContainer} ${blownOut ? styles.blown : ''}`}
            onClick={handleBlowOutCandles}
          >
            {/* Candles Group */}
            <div className={styles.candlesGroup}>
              {[1, 2, 3].map((id) => (
                <div key={id} className={styles.candle}>
                  {!blownOut ? (
                    <div className={styles.flameWrap}>
                      <div className={styles.flameInner} />
                      <div className={styles.flameOuter} />
                      <div className={styles.flameGlow} />
                    </div>
                  ) : (
                    <div className={styles.smokePuff} />
                  )}
                  <div className={styles.waxStick} />
                </div>
              ))}
            </div>

            {/* Cake Tiers */}
            <div className={styles.tierTop}>
              <div className={styles.frostingDrips} />
            </div>
            <div className={styles.tierMiddle}>
              <div className={styles.frostingDrips} />
              <div className={styles.cakeDecorations}>
                <span>⭐</span>
                <span>❤️</span>
                <span>⭐</span>
              </div>
            </div>
            <div className={styles.tierBottom}>
              <div className={styles.cakeBaseGlow} />
            </div>

            {/* Plate */}
            <div className={styles.cakePlate} />
          </div>

          {/* Result Banner when Candles are Blown */}
          <AnimatePresence>
            {blownOut && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: 'spring', damping: 15 }}
                className={styles.wishRevealedCard}
              >
                <div className={styles.wishHeader}>
                  <Sparkles className={styles.sparkleIcon} />
                  <h3>Make a Wish, Mithran! ✨</h3>
                  <Sparkles className={styles.sparkleIcon} />
                </div>
                <p className={styles.wishText}>
                  May your life always be filled with endless laughter, love, and magic. You bring boundless warmth to our family every single day!
                </p>

                <button onClick={handleReset} className={styles.relightBtn}>
                  <RefreshCw size={16} /> Relight Candles
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Final Emotional Love Signature Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={styles.finalLoveBlock}
        >
          <p className={styles.lovedQuote}>&ldquo;You are loved more than words can ever say.&rdquo;</p>
          <div className={styles.divider} />
          <div className={styles.signatureBlock}>
            <span className={styles.withLove}>With All Our Love</span>
            <Heart className={styles.heartIcon} />
            <h3 className={styles.parentsNames}>Muthukumar &amp; Pavithra</h3>
          </div>
          <p className={styles.copyright}>
            Designed with endless love for Mithran &bull; {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
