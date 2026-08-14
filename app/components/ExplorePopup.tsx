'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Heart, Gift, Play } from 'lucide-react';
import { triggerConfetti } from './Confetti';
import styles from './ExplorePopup.module.scss';

interface ExplorePopupProps {
  onExplore?: () => void;
}

export default function ExplorePopup({ onExplore }: ExplorePopupProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Lock body scroll when popup is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleExplore = async () => {
    setIsOpen(false);
    triggerConfetti();

    // Track Click to Explore event to visitor log file
    try {
      let clientGeoData: Record<string, unknown> = {};

      try {
        const geoRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        if (geoRes.ok) {
          const data = await geoRes.json();
          if (data && data.city) {
            clientGeoData = {
              clientIp: data.ip,
              city: data.city,
              region: data.region,
              country: data.country_name,
              countryCode: data.country_code,
              org: data.org || data.asn,
              latitude: data.latitude,
              longitude: data.longitude,
            };
          }
        }
      } catch {}

      if (!clientGeoData.city) {
        try {
          const geoRes2 = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) });
          if (geoRes2.ok) {
            const data2 = await geoRes2.json();
            if (data2 && data2.success && data2.city) {
              clientGeoData = {
                clientIp: data2.ip,
                city: data2.city,
                region: data2.region,
                country: data2.country,
                countryCode: data2.country_code,
                org: data2.connection?.isp || data2.connection?.org || '',
                latitude: data2.latitude,
                longitude: data2.longitude,
              };
            }
          }
        } catch {}
      }

      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...clientGeoData,
          action: 'Click to Explore',
          path: '/ (Explored Website)',
          userAgent: navigator.userAgent,
          screen: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          referrer: document.referrer || 'Direct',
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Explore tracking error:', err);
    }

    if (onExplore) {
      onExplore();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className={styles.overlay}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 }}
            className={styles.modalCard}
          >
            {/* Ambient background glows */}
            <div className={styles.glowOrb1} />
            <div className={styles.glowOrb2} />

            {/* Sparkle Badges */}
            <div className={styles.badgeWrap}>
              <Sparkles className={styles.sparkleIcon} />
              <span>2nd Birthday Special</span>
              <Sparkles className={styles.sparkleIcon} />
            </div>

            {/* Baby Portrait Preview */}
            <div className={styles.portraitWrap}>
              <div className={styles.portraitRing}>
                <Image
                  src="/images/photo-25.jpeg"
                  alt="Little Mithran"
                  fill
                  priority
                  sizes="130px"
                  className={styles.portraitImg}
                />
              </div>
              <span className={styles.heartFloat}>❤️</span>
              <span className={styles.starFloat}>✨</span>
            </div>

            {/* Modal Heading */}
            <h2 className={styles.title}>
              Welcome to <span className={styles.titleHighlight}>Mithran’s</span> World 👑
            </h2>

            <p className={styles.subtitle}>
              Celebrating 2 Years of pure magic, laughter, and endless love created by <strong>Muthukumar</strong> &amp; <strong>Pavithra</strong>.
            </p>

            {/* Explore Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExplore}
              className={styles.exploreBtn}
            >
              <Gift className={styles.btnIconLeft} />
              <span>Click to Explore</span>
              <Sparkles className={styles.btnIconRight} />
            </motion.button>

            <span className={styles.subtext}>
              🎵 Tap to enter &amp; enjoy background music
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
