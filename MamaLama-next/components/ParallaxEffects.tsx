'use client';

import { useEffect } from 'react';

// Natural aspect ratio of background.png (height / width)
const BG_NATURAL_RATIO = 12701 / 3334;

const PARALLAX = {
  heroSlower: 0.25,
  cardSlower: 0.12,
  smallSlower: 0.07
};

export default function ParallaxEffects() {
  useEffect(() => {
    const lamaBalloon = document.getElementById('lamaBalloon');
    const welcomeBubble = document.getElementById('welcomeBubble');

    let bgK = 0;
    let ticking = false;

    function recalcBgParallax() {
      const bgHeight = window.innerWidth * BG_NATURAL_RATIO;
      const vh = window.innerHeight;
      const max = document.body.scrollHeight - vh;
      if (max <= 0) { bgK = 0; return; }
      bgK = (bgHeight - vh - max) / max;
    }

    function update() {
      const y = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(y / max, 1) : 0;

      if (lamaBalloon) {
        const startTop = 200;
        const endTop = window.innerHeight - 320;
        lamaBalloon.style.top = (startTop + (endTop - startTop) * progress) + 'px';
      }

      if (welcomeBubble) {
        if (y > 100) {
          welcomeBubble.style.opacity = '0';
          welcomeBubble.style.pointerEvents = 'none';
        } else {
          welcomeBubble.style.opacity = '1';
          welcomeBubble.style.pointerEvents = '';
        }
      }

      document.body.style.backgroundPosition = `center ${-(y * bgK).toFixed(2)}px`;

      const heroBanner = document.querySelector('.hero-slider') as HTMLElement | null;
      if (heroBanner) {
        heroBanner.style.setProperty('--parallax-y', `${y * PARALLAX.heroSlower}px`);
      }
      const cardOffset = `${y * PARALLAX.cardSlower}px`;
      document.querySelectorAll<HTMLElement>('.product-card').forEach(c =>
        c.style.setProperty('--parallax-y', cardOffset)
      );
      const smallOffset = `${y * PARALLAX.smallSlower}px`;
      document.querySelectorAll<HTMLElement>('.trust-card').forEach(c =>
        c.style.setProperty('--parallax-y', smallOffset)
      );
      document.querySelectorAll<HTMLElement>('.cat-card').forEach(c =>
        c.style.setProperty('--parallax-y', smallOffset)
      );

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    function refresh() {
      recalcBgParallax();
      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refresh);
    refresh();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', refresh);
    };
  }, []);

  return null;
}
