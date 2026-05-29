'use client';

import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';

export default function WishlistPage() {
  const { store, ready, toggleWishlist, addToCart } = useStore();

  if (!ready) {
    return (
      <div className="view view-wishlist active">
        <section className="page-section"><h1>Wishlist 💖</h1></section>
      </div>
    );
  }

  const wishlist = store.wishlist;
  const isEmpty = wishlist.length === 0;

  return (
    <div className="view view-wishlist active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to Home</Link>
        <div className="page-header">
          <h1>Your Wishlist 💖</h1>
          <p>
            {isEmpty
              ? 'Tap the ♡ button on any puzzle to save it for later.'
              : `${wishlist.length} ${wishlist.length === 1 ? 'puzzle' : 'puzzles'} saved.`}
          </p>
        </div>

        {!isEmpty && (
          <div className="wishlist-grid">
            {wishlist.map(item => {
              const tierLc = (item.tier || '').toLowerCase();
              return (
                <div key={item.wishlistId} className="wishlist-card">
                  <div className={`wishlist-banner ${tierLc}`}>
                    <span>{item.emoji}</span>
                    {item.tier && <span className="tier-pill">{item.tier}</span>}
                  </div>
                  <h3>{item.name}</h3>
                  <div className="meta">{item.meta}</div>
                  <div className="price">{item.price}</div>
                  <div className="wishlist-actions">
                    <button className="btn-add-cart" onClick={() => { addToCart(item); toggleWishlist(item); }}>Add to Cart 🛒</button>
                    <button className="btn-remove" onClick={() => toggleWishlist(item)} aria-label="Remove">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isEmpty && (
          <div className="empty-state visible">
            <div className="empty-emoji">💖</div>
            <h2>Your wishlist is empty!</h2>
            <p>Tap the ♡ button on any puzzle to save it for later.</p>
            <Link href="/" className="btn-primary">Browse Puzzles →</Link>
          </div>
        )}
      </section>
    </div>
  );
}
