'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music } from 'lucide-react';
import styles from './MusicPlayer.module.scss';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const audio = new Audio('/music/birthday.mp3');
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;

    // Attempt autoplay on load
    const tryAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch {
        // Autoplay blocked by browser policy until user interaction
        setIsPlaying(false);
        setShowToast(true);
      }
    };

    tryAutoplay();

    // Start playing sound on first user gesture anywhere on the page
    const handleGlobalInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          })
          .catch(() => {});
      }
    };

    window.addEventListener('click', handleGlobalInteraction, { once: true });
    window.addEventListener('touchstart', handleGlobalInteraction, { once: true });
    window.addEventListener('keydown', handleGlobalInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleGlobalInteraction);
      window.removeEventListener('touchstart', handleGlobalInteraction);
      window.removeEventListener('keydown', handleGlobalInteraction);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <div className={styles.floatingContainer}>
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={styles.statusToast}
          >
            {isPlaying ? 'Playing our special song 🎵' : 'Tap anywhere for music 🎵'}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={togglePlay}
        className={`${styles.musicButton} ${isPlaying ? styles.playing : ''}`}
        aria-label={isPlaying ? 'Pause Music' : 'Play Music'}
      >
        {isPlaying ? (
          <div className={styles.equalizer}>
            <span className={styles.bar1} />
            <span className={styles.bar2} />
            <span className={styles.bar3} />
          </div>
        ) : (
          <Music className={styles.musicIcon} />
        )}

        <div className={styles.volumeBadge}>
          {isPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </div>
      </button>
    </div>
  );
}
