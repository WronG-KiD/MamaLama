'use client';

import { useState } from 'react';
import { TIER_BANNERS } from '@/lib/tierBanners';
import { useUI } from '@/lib/UIContext';

export default function TierBanners() {
  const [flipped, setFlipped] = useState<string | null>(null);
  const { openProductStory } = useUI();

  return (
    <section className="spaced">
      <div className="section-header">
        <h2>Popular Puzzles 🧩</h2>
        <a href="#all-tiers">View All →</a>
      </div>

      <div className="tier-banner-grid" id="tierBannerGrid">
        {TIER_BANNERS.map(b => {
          const isFlipped = flipped === b.tier;
          return (
            <div
              key={b.tier}
              className={`tier-banner ${b.cssClass} ${isFlipped ? 'flipped' : ''}`}
              data-tier={b.tier}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('.see-products-btn')) return;
                setFlipped(prev => prev === b.tier ? null : b.tier);
              }}
            >
              <div className="tier-banner-inner">
                <div className="tier-banner-front">
                  <div className="rank-emoji">{b.emoji}</div>
                  <div className="rank-letter">{b.tier}</div>
                  <div>
                    <div className="rank-title">{b.rankTitle}</div>
                    <div className="tap-hint">Tap to flip ✨</div>
                  </div>
                </div>
                <div className="tier-banner-back">
                  <div className="back-body">
                    <div className="back-rank">{b.tier} Tier</div>
                    <div className="back-title">{b.backTitle}</div>
                    <div className="back-desc">{b.backDesc}</div>
                    <div className="back-rewards">
                      {b.rewardLine.split(' · ')[0]} <strong>{b.xp} XP</strong>
                      {' · '}{b.rewardLine.split(' · ').slice(1).join(' · ')}
                    </div>
                    <div className="back-challenge">{b.challenge}</div>
                  </div>
                  <button
                    className="see-products-btn"
                    data-tier={b.tier}
                    onClick={(e) => { e.stopPropagation(); openProductStory(b.tier); }}
                  >List Products →</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
