'use client';

import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';

export default function Header() {
  const { store, ready } = useStore();
  const cartCount = ready ? store.cart.reduce((sum, i) => sum + i.qty, 0) : 0;
  const wishCount = ready ? store.wishlist.length : 0;

  return (
    <header>
      <Link href="/" aria-label="MamaLama home">
        {/* Brand assets will live under /public — placeholder for now */}
        <img src="/logo.png" alt="MamaLama" className="logo-img" id="navLogo" />
      </Link>
      <div className="search-bar">
        <input type="text" placeholder="Search puzzles, toys, books..." />
        <button className="search-btn" aria-label="Search">🔍</button>
      </div>
      <div className="header-actions">
        <button className="icon-btn trophy-btn" id="trophyBtn" title="Top 10 Sky Trail Legends">
          🏆
          <span className="trophy-tag">#47</span>
        </button>
        <Link href="/trail" className="icon-btn" title="My Sky Trail">
          <span style={{ fontSize: 26 }}>👤</span>
          <span>Trail</span>
        </Link>
        <Link href="/wishlist" className="icon-btn wishlist-wrap" title="Wishlist">
          <img src="/wishlist-heart.png" alt="Wishlist" className="icon-img" />
          {wishCount > 0 && <span className="wish-count">{wishCount}</span>}
          <span>Wishlist</span>
        </Link>
        <Link href="/cart" className="icon-btn cart-wrap" title="Cart">
          <img src="/cart-icon.png" alt="Cart" className="icon-img" />
          <span className="cart-count">{cartCount}</span>
          <span>Cart</span>
        </Link>
      </div>
    </header>
  );
}
