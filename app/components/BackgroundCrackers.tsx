'use client';

import React, { useEffect, useRef } from 'react';

interface FloatingIcon {
  x: number;
  y: number;
  vy: number;
  vx: number;
  symbol: string;
  size: number;
  alpha: number;
  rotation: number;
  vr: number;
}

interface CrackerParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
  gravity: number;
  sparkle?: boolean;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
}

export default function BackgroundCrackers() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: CrackerParticle[] = [];
    const rockets: Rocket[] = [];
    const floatingIcons: FloatingIcon[] = [];

    const iconSymbols = ['🎂', '❤️', '✨', '⭐', '💖', '🎂', '🎉', '🌟'];

    // Generate initial ambient floating icons (cakes, hearts, stars)
    for (let i = 0; i < 18; i++) {
      floatingIcons.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: -(Math.random() * 0.8 + 0.3),
        vx: (Math.random() - 0.5) * 0.4,
        symbol: iconSymbols[Math.floor(Math.random() * iconSymbols.length)],
        size: Math.floor(Math.random() * 12) + 18,
        alpha: Math.random() * 0.4 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.02,
      });
    }

    const colors = [
      '#f59e0b', // Gold
      '#fef08a', // Bright yellow
      '#f43f5e', // Rose
      '#ec4899', // Pink
      '#8b5cf6', // Violet
      '#38bdf8', // Cyan
      '#fb923c', // Orange
      '#ffffff', // Diamond White
    ];

    const createBurst = (x: number, y: number, particleCount = 45) => {
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        const useMulti = Math.random() > 0.4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: useMulti ? colors[Math.floor(Math.random() * colors.length)] : baseColor,
          size: Math.random() * 2.8 + 1,
          decay: Math.random() * 0.015 + 0.008,
          gravity: 0.03,
          sparkle: Math.random() > 0.5,
        });
      }
    };

    const launchRocket = () => {
      const x = Math.random() * (width * 0.9) + width * 0.05;
      // Target all module heights across screen
      const targetY = Math.random() * (height * 0.65) + height * 0.1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      rockets.push({
        x,
        y: height + 10,
        targetY,
        vy: -(Math.random() * 6 + 9),
        color,
      });
    };

    // Continuous firecracker rocket launch loop for all modules
    const interval = setInterval(() => {
      if (rockets.length < 8) {
        launchRocket();
      }
    }, 1000);

    // Initial festive top banner bursts on load
    createBurst(width * 0.2, height * 0.2, 50);
    createBurst(width * 0.8, height * 0.25, 50);
    createBurst(width * 0.5, height * 0.15, 60);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render & Update Floating Icons (Cakes, Hearts, Stars)
      for (let i = 0; i < floatingIcons.length; i++) {
        const item = floatingIcons[i];
        item.y += item.vy;
        item.x += item.vx;
        item.rotation += item.vr;

        if (item.y < -40) {
          item.y = height + 40;
          item.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = item.alpha;
        ctx.font = `${item.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);
        ctx.fillText(item.symbol, 0, 0);
        ctx.restore();
      }

      // 2. Render & Update Firecracker Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;

        ctx.save();
        ctx.fillStyle = r.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        particles.push({
          x: r.x + (Math.random() * 2 - 1),
          y: r.y + 4,
          vx: Math.random() * 1 - 0.5,
          vy: Math.random() * 2 + 1,
          alpha: 0.7,
          color: r.color,
          size: 1.2,
          decay: 0.05,
          gravity: 0.01,
        });

        if (r.y <= r.targetY) {
          createBurst(r.x, r.y, 50);
          rockets.splice(i, 1);
        }
      }

      // 3. Render & Update Cracker Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;

        if (p.sparkle) {
          p.alpha += (Math.random() - 0.5) * 0.2;
        }

        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.85,
      }}
    />
  );
}
