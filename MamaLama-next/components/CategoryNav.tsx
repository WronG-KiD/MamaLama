'use client';

import { useState } from 'react';

const CATEGORIES = ['🧩 Puzzles', '🎲 Games', '🚀 STEM Kits', '👶 Baby Brain', '🎁 Bundles'];

export default function CategoryNav() {
  const [active, setActive] = useState(0);
  return (
    <nav className="category-nav">
      {CATEGORIES.map((label, i) => (
        <button
          key={label}
          className={`cat-chip ${active === i ? 'active' : ''}`}
          onClick={() => setActive(i)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
