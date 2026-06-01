'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';
import { LEGENDS } from '@/lib/legends';

export default function Header() {
  const { store, ready } = useStore();
  const cartCount = ready ? store.cart.reduce((sum, i) => sum + i.qty, 0) : 0;
  const wishCount = ready ? store.wishlist.length : 0;

  // Compute the active profile's rank (same logic as /leaderboard).
  // Show "TOP N" badge only if they're in the top 10.
  const trophyRank = useMemo<number | null>(() => {
    if (!ready) return null;
    const active = store.profiles.find(p => p.id === store.activeProfileId);
    if (!active) return null;
    // Build combined list (real profiles + fictional legends), sort by XP
    const all = [
      ...store.profiles.map(p => ({ name: p.name, xp: p.xp, isActive: p.id === active.id })),
      ...LEGENDS.map(l => ({ name: l.name, xp: l.xp, isActive: false }))
    ];
    all.sort((a, b) => b.xp - a.xp);
    const rank = all.findIndex(r => r.isActive) + 1;
    return rank > 0 && rank <= 10 ? rank : null;
  }, [store, ready]);

  return (
    <header>
      <Link href="/" aria-label="MamaLama home">
        <img src="/logo.png" alt="MamaLama" className="logo-img" id="navLogo" />
      </Link>
      <div className="search-bar">
        <input type="text" placeholder="Search puzzles, toys, books..." />
        <button className="search-btn" aria-label="Search">🔍</button>
      </div>
      <div className="header-actions">
        <Link href="/leaderboard" className="icon-btn trophy-btn" id="trophyBtn" title="Sky Trail Leaderboard" aria-label="Leaderboard">
          🏆
          {trophyRank !== null && <span className="trophy-tag">#{trophyRank}</span>}
        </Link>
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
