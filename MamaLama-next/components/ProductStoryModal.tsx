'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/lib/UIContext';
import { useStore } from '@/lib/StoreContext';
import { TIER_PRODUCTS, TIER_TITLES } from '@/lib/products';
import { makeCartId } from '@/lib/store';
import type { Tier } from '@/types';

export default function ProductStoryModal() {
  const { storyTier, closeProductStory, showToast } = useUI();
  const { store, addToCart, toggleWishlist } = useStore();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [addedFlash, setAddedFlash] = useState(false);

  // Reset to first product when a tier opens
  useEffect(() => {
    setIndex(0);
    setAddedFlash(false);
  }, [storyTier]);

  const items = storyTier ? TIER_PRODUCTS[storyTier] : [];

  const next = useCallback(() => {
    setIndex(i => Math.min(i + 1, items.length - 1));
    setAddedFlash(false);
  }, [items.length]);

  const prev = useCallback(() => {
    setIndex(i => Math.max(i - 1, 0));
    setAddedFlash(false);
  }, []);

  // Keyboard nav
  useEffect(() => {
    if (!storyTier) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeProductStory();
      else if (e.key === 'ArrowLeft' && index > 0) prev();
      else if (e.key === 'ArrowRight' && index < items.length - 1) next();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [storyTier, index, items.length, prev, next, closeProductStory]);

  if (!storyTier) return null;

  const p = items[index];
  const tierLc = storyTier.toLowerCase();
  const title = TIER_TITLES[storyTier].split('—')[0].trim();
  const payload = { ...p, tier: storyTier as Tier };
  const wished = !!store.wishlist.find(w => w.wishlistId === makeCartId(payload));

  function handleBuy() {
    addToCart(payload);
    showToast(`${p.name} added 🛒 — opening cart...`);
    closeProductStory();
    setTimeout(() => router.push('/cart'), 350);
  }

  function handleAddCart() {
    addToCart(payload);
    setAddedFlash(true);
    showToast(`${p.name} added to cart 🛒`);
  }

  function handleWish() {
    toggleWishlist(payload);
    showToast(wished ? `${p.name} removed from wishlist` : `${p.name} saved 💖`);
  }

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => { if (e.target === e.currentTarget) closeProductStory(); }}
    >
      <div className="product-story-wrapper">
        <button
          className="story-nav prev"
          aria-label="Previous product"
          disabled={index === 0}
          onClick={prev}
        >‹</button>

        <div className={`story-container product-story-container ${tierLc}`}>
          <div className="story-progress">
            {items.map((_, i) => (
              <div key={i} className={`bar ${i < index ? 'done' : ''} ${i === index ? 'current' : ''}`}>
                <div className="fill" style={{ width: i <= index ? '100%' : '0%' }} />
              </div>
            ))}
          </div>

          <button className="story-close" onClick={closeProductStory}>✕</button>

          <div className="story-rank-badge">{storyTier} Tier · {title}</div>

          <div className="story-content product-story-content">
            <div className="product-hero-banner">
              <span className="rank-chip">{storyTier}</span>
              <span>{p.emoji}</span>
              <span className="stock-chip">{(p.stock || 'In stock').toUpperCase()}</span>
            </div>
            <div className="product-story-name">{p.name}</div>
            <div className="product-story-meta">{p.meta}</div>
            <div className="product-story-desc">{p.desc}</div>
            <div className="product-story-features">
              <span>🚚 Free shipping $40+</span>
              <span>🛡️ Non-toxic</span>
              <span>↩️ 30-day returns</span>
            </div>
            <div className="product-price-row">
              <span className="price">{p.price}</span>
              <span className="free-ship">Free ship over $40</span>
            </div>
            <div className="product-story-actions">
              <button className="btn-buy-now" onClick={handleBuy}>Buy Now ⚡</button>
              <button
                className={`btn-add-cart ${addedFlash ? 'added' : ''}`}
                onClick={handleAddCart}
              >
                {addedFlash ? '✓ Added' : '+ Add to Cart 🛒'}
              </button>
            </div>
            <div className="product-bottom-row">
              <button
                className="wish-btn"
                onClick={handleWish}
                style={wished ? { color: '#ff3b8b' } : undefined}
              >
                {wished ? '♥ Wishlisted' : '♡ Wishlist'}
              </button>
              <span className="position-pill">{index + 1} of {items.length}</span>
            </div>
          </div>
        </div>

        <button
          className="story-nav next"
          aria-label="Next product"
          disabled={index === items.length - 1}
          onClick={next}
        >›</button>
      </div>
    </div>
  );
}
