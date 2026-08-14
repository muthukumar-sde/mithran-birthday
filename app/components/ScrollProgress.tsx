'use client';

import React, { useEffect, useState } from 'react';
import styles from './ScrollProgress.module.scss';

const sections = [
  { id: 'hero', label: '01 — Beginning' },
  { id: 'timeline', label: '02 — Our Story' },
  { id: 'photo-gallery', label: '03 — Precious Moments' },
  { id: 'name-story', label: '04 — Our Name' },
  { id: 'birthday-celebration', label: '05 — Celebration' },
];

export default function ScrollProgress() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;

      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.progressContainer}>
      {sections.map((sec) => (
        <button
          key={sec.id}
          onClick={() => scrollToSection(sec.id)}
          className={`${styles.item} ${activeSection === sec.id ? styles.active : ''}`}
          aria-label={sec.label}
        >
          <span className={styles.label}>{sec.label}</span>
          <span className={styles.dot} />
        </button>
      ))}
    </div>
  );
}
