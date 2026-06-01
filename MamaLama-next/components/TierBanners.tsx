'use client';

import { useState, useRef, useEffect } from 'react';
import { TIER_BANNERS } from '@/lib/tierBanners';
import { TIER_PRODUCTS, TIER_TITLES } from '@/lib/products';
import { useStore } from '@/lib/StoreContext';
import { useUI } from '@/lib/UIContext';
import { makeCartId } from '@/lib/store';
import type { Tier } from '@/types';

export default function TierBanners() {
  const [openTier, setOpenTier] = useState<Tier | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { store, addToCart, toggleWishlist } = useStore();
  const { showToast } = useUI();

  // Smooth scroll the drawer into view when it opens / changes tier
  useEffect(() => {
    if (openTier && drawerRef.current) {
      const t = setTimeout(() => {
        drawerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(t);
    }
  }, [openTier]);

  function toggleTier(tier: Tier) {
    setOpenTier(prev => prev === tier ? null : tier);
  }

  const activeBanner = openTier ? TIER_BANNERS.find(b => b.tier === openTier) : null;
  const activeProducts = openTier ? TIER_PRODUCTS[openTier] : [];

  return (
    <section className="spaced">
      <div className="section-header">
        <h2>Popular Puzzles 🧩</h2>
      </div>

      <div className="tier-banner-grid" id="tierBannerGrid">
        {TIER_BANNERS.map(b => {
          const isOpen = openTier === b.tier;
          return (
            <div
              key={b.tier}
              className={`tier-banner ${b.cssClass} ${isOpen ? 'selected' : ''}`}
              data-tier={b.tier}
              onClick={() => toggleTier(b.tier)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTier(b.tier); } }}
            >
              <div className="tier-banner-inner-static">
                <div className="rank-emoji">{b.emoji}</div>
                <div className="rank-letter">{b.tier}</div>
                <div>
                  <div className="rank-title">{b.rankTitle}</div>
                  <div className="tap-hint">{isOpen ? 'Tap to close ✕' : 'Tap to view ✨'}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sliding drawer — opens below the banner grid with description + products */}
      <div
        ref={drawerRef}
        className={`tier-drawer ${openTier ? 'open' : ''} ${activeBanner ? `accent-${activeBanner.cssClass}` : ''}`}
        aria-hidden={!openTier}
      >
        {activeBanner && (
          <>
            <div className="tier-drawer-header">
              <div className={`tier-drawer-pill ${activeBanner.cssClass}`}>
                <span className="pill-emoji">{activeBanner.emoji}</span>
                <span className="pill-letter">{activeBanner.tier}</span>
              </div>
              <div className="tier-drawer-text">
                <h3>{activeBanner.backTitle}</h3>
                <p className="tier-drawer-desc">{activeBanner.backDesc}</p>
                <div className="tier-drawer-meta">
                  <span className="meta-pill">{TIER_TITLES[openTier as Tier]}</span>
                  <span className="meta-pill">⭐ {activeBanner.xp} XP per solve</span>
                </div>
              </div>
              <button
                className="tier-drawer-close"
                onClick={() => setOpenTier(null)}
                aria-label="Close"
              >✕</button>
            </div>

            <div className="tier-drawer-product-grid">
              {activeProducts.map((p, i) => {
                const payload = { ...p, tier: openTier as Tier };
                const isWished = !!store.wishlist.find(w => w.wishlistId === makeCartId(payload));
                return (
                  <div key={p.name} className="tier-product-card" style={{ animationDelay: `${i * 40}ms` }}>
                    <div className={`tier-product-thumb ${activeBanner.cssClass}`}>
                      <span className="thumb-emoji">{p.emoji}</span>
                      <span className="stock-badge">{p.stock}</span>
                    </div>
                    <div className="tier-product-body">
                      <h4>{p.name}</h4>
                      <div className="tier-product-meta">{p.meta}</div>
                      <p className="tier-product-desc">{p.desc}</p>
                      <div className="tier-product-footer">
                        <span className="tier-product-price">{p.price}</span>
                        <div className="tier-product-actions">
                          <button
                            className="wish-icon-btn"
                            onClick={() => {
                              toggleWishlist(payload);
                              showToast(isWished ? `${p.name} removed from wishlist` : `${p.name} saved 💖`);
                            }}
                            aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
                            title={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
                          >{isWished ? '♥' : '♡'}</button>
                          <button
                            className="btn-add-cart-sm"
                            onClick={() => {
                              addToCart(payload);
                              showToast(`${p.name} added 🛒`);
                            }}
                          >+ Cart</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
