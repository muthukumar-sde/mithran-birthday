'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Sparkles, Star, Smile, Compass, Hand, Rocket, Crown, Gift } from 'lucide-react';
import styles from './Timeline.module.scss';

const milestones = [
  {
    id: 1,
    title: 'Month 2 — Tiny Giggles',
    subtitle: 'Early Wonder',
    date: '2 Months',
    description: 'Grasping our world with tiny hands, bright eyes, and sweet soft coos that melted our hearts.',
    image: '/images/bigmovements/month-2.jpg',
    icon: Heart,
  },
  {
    id: 2,
    title: 'Month 4 — First Sweet Smiles',
    subtitle: 'Pure Happiness',
    date: '4 Months',
    description: 'Melting Mom & Dad’s hearts every morning with your sunniest dimpled smile.',
    image: '/images/bigmovements/month-4.jpg',
    icon: Smile,
  },
  {
    id: 3,
    title: 'Month 5 — Curious Explorer',
    subtitle: 'Reaching & Rolling',
    date: '5 Months',
    description: 'Reaching out for everything with endless curiosity, energy, and playful giggles.',
    image: '/images/bigmovements/month-5.jpg',
    icon: Compass,
  },
  {
    id: 4,
    title: 'Month 6 — Halfway to One',
    subtitle: 'Half Birthday Joy',
    date: '6 Months',
    description: 'Sitting up tall, laughing out loud, and filling our home with pure sunshine.',
    image: '/images/bigmovements/month-6.jpg',
    icon: Sparkles,
  },
  {
    id: 5,
    title: 'Month 7 — Bouncing Energy',
    subtitle: 'Playful Bliss',
    date: '7 Months',
    description: 'Exploring every corner of the room with tireless enthusiasm and little babbles.',
    image: '/images/bigmovements/month-7.jpg',
    icon: Hand,
  },
  {
    id: 6,
    title: 'Month 8 — Little Chatterbox',
    subtitle: 'First Words',
    date: '8 Months',
    description: 'Talking in your own adorable baby language that brings continuous laughter to our home.',
    image: '/images/bigmovements/month-8.jpg',
    icon: Smile,
  },
  {
    id: 7,
    title: 'Month 9 — Standing Proud',
    subtitle: 'Little Champion',
    date: '9 Months',
    description: 'Holding onto furniture and standing tall with a proud, victorious smile.',
    image: '/images/bigmovements/month-9.jpg',
    icon: Rocket,
  },
  {
    id: 8,
    title: 'Month 10 — Little Gentleman',
    subtitle: 'Growing Fast',
    date: '10 Months',
    description: 'Learning new tricks, clapping tiny hands, and waving hello to everyone.',
    image: '/images/bigmovements/month-10.jpg',
    icon: Star,
  },
  {
    id: 9,
    title: 'Month 11 — Countdown to One',
    subtitle: 'Almost One!',
    date: '11 Months',
    description: 'Counting down the magical days to your big 1st birthday celebration.',
    image: '/images/bigmovements/month-11.jpg',
    icon: Sparkles,
  },
  {
    id: 10,
    title: 'Divine Little Krishna',
    subtitle: 'Krishna Jayanthi Blessing',
    date: 'Divine Avatar',
    description: 'Dressed up as our darling Little Krishna, spreading divine grace, joy, and sweet blessings.',
    image: '/images/bigmovements/lord-krishna-getup.jpg',
    icon: Crown,
  },
  {
    id: 11,
    title: 'Little Lord Murugan',
    subtitle: 'Royal Radiance',
    date: 'Sacred Avatar',
    description: 'Adorned with divine charm and royal radiance, our brave little prince.',
    image: '/images/bigmovements/lord-murugan-getup.jpg',
    icon: Crown,
  },
  {
    id: 12,
    title: 'Playful Cutie Avatar',
    subtitle: 'Adorable Dressup',
    date: 'Sweet Memories',
    description: 'Dressed up in cute traditional attire, winning everyone’s heart with innocent charm.',
    image: '/images/bigmovements/girl-getup.jpg',
    icon: Heart,
  },
  {
    id: 13,
    title: 'Ear Piercing Ceremony (Kadhukuthu)',
    subtitle: 'Traditional Blessing',
    date: 'Sacred Milestone',
    description: 'A traditional milestone surrounded by elders’ love, prayers, and heartfelt family blessings.',
    image: '/images/bigmovements/ear-piercing-ceremony.jpg',
    icon: Gift,
  },
  {
    id: 14,
    title: '1st Birthday Celebration',
    subtitle: 'Our Little Miracle',
    date: '1 Year',
    description: 'One full year of pure magic, laughter, and unconditional love. Happy Birthday Mithran!',
    image: '/images/bigmovements/first_birthday.jpg',
    icon: Star,
  },
];

export default function Timeline() {
  return (
    <section id="timeline" className={styles.section}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
          className={styles.header}
        >
          <span className={styles.badge}>
            <Sparkles size={14} /> Chapters of Love
          </span>
          <h2 className={styles.title}>Little Moments, Big Memories</h2>
          <p className={styles.subtitle}>
            Walking through the 14 magical milestones of Mithran&apos;s journey from month 2 to his 1st birthday!
          </p>
        </motion.div>

        <div className={styles.timelineWrapper}>
          <div className={styles.timelineLine} />

          {milestones.map((item, index) => {
            const Icon = item.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50, x: isEven ? -30 : 30 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.7, delay: (index % 4) * 0.1 }}
                className={`${styles.timelineItem} ${isEven ? styles.left : styles.right}`}
              >
                {/* Node Center Badge */}
                <div className={styles.nodeIconWrap}>
                  <Icon size={22} className={styles.nodeIcon} />
                </div>

                {/* Content Box */}
                <div className={styles.cardContent}>
                  <div className={styles.cardImageWrap}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className={styles.cardImg}
                    />
                    <div className={styles.dateBadge}>{item.date}</div>
                  </div>

                  <div className={styles.cardBody}>
                    <span className={styles.cardSubtitle}>{item.subtitle}</span>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardDesc}>{item.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
