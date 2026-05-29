'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const SLIDE_COUNT = 2;
const SLIDE_MS = 6000;

export default function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = window.setInterval(() => {
      setActive(a => (a + 1) % SLIDE_COUNT);
    }, SLIDE_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [paused]);

  return (
    <section className="hero">
      <div
        className="hero-slider"
        id="heroSlider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="hero-progress" id="heroProgress"></div>

        <div className={`hero-slide slide-1 ${active === 0 ? 'active' : ''}`} data-slide="0">
          <div className="hero-tagline">★ A magical learning adventure ★</div>
          <h1>Where Little Minds<br/><span className="accent">Take Flight</span></h1>
          <p>Puzzles, toys &amp; treasures that grow tiny thinkers into Galaxy Brains. Curated for ages 2–8, loved by mamas.</p>
          <Link href="/trail" className="btn-primary" id="heroStartTrailBtn">Start the Sky Trail →</Link>
        </div>

        <div className={`hero-slide slide-2 ${active === 1 ? 'active' : ''}`} data-slide="1">
          <div className="hero-tagline">★ This week&apos;s speed solvers ★</div>
          <h2>Top 3 Sky Trail Champions 🏆</h2>
          <div className="podium">
            <div className="podium-spot p2">
              <span className="podium-medal">🥈</span>
              <span className="podium-tier-chip s">S</span>
              <div className="podium-avatar">👧🏼</div>
              <div className="podium-name">Maya</div>
              <div className="podium-puzzle">Cosmic Logic Cube<br/>250 pieces</div>
              <div className="podium-time">⏱ 12m 04s</div>
            </div>
            <div className="podium-spot p1">
              <span className="podium-medal">🥇</span>
              <span className="podium-tier-chip ss">SS</span>
              <div className="podium-avatar">👦🏽</div>
              <div className="podium-name">Aarav</div>
              <div className="podium-puzzle">Galactic Maze Master<br/>200 pieces</div>
              <div className="podium-time">⏱ 9m 47s</div>
            </div>
            <div className="podium-spot p3">
              <span className="podium-medal">🥉</span>
              <span className="podium-tier-chip ss">SS</span>
              <div className="podium-avatar">🧒🏻</div>
              <div className="podium-name">Liam</div>
              <div className="podium-puzzle">Atlas of Riddles<br/>108-page set</div>
              <div className="podium-time">⏱ 14m 22s</div>
            </div>
          </div>
        </div>

        <div className="hero-dots" id="heroDots">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${active === i ? 'active' : ''}`}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>

      <div className="trust-row">
        <div className="trust-card c1">
          <div className="trust-icon">🚚</div>
          <div className="trust-text"><strong>Free Shipping</strong><small>On orders over $40</small></div>
        </div>
        <div className="trust-card c2">
          <div className="trust-icon">🛡️</div>
          <div className="trust-text"><strong>Safe &amp; Tested</strong><small>Non-toxic materials</small></div>
        </div>
        <div className="trust-card c3">
          <div className="trust-icon">🧠</div>
          <div className="trust-text"><strong>Learning First</strong><small>Designed by educators</small></div>
        </div>
        <div className="trust-card c4">
          <div className="trust-icon">💖</div>
          <div className="trust-text"><strong>Mama Approved</strong><small>10,000+ happy families</small></div>
        </div>
      </div>
    </section>
  );
}
