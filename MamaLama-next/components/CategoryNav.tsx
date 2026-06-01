'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  emoji: string;
  label: string;
  href: string;        // route to navigate to (or '#tier-banners' for scroll on homepage)
  scrollTarget?: string; // CSS selector to scroll to instead of/after navigation
}

const NAV_ITEMS: NavItem[] = [
  { emoji: '🚀', label: 'STEM Kits',   href: '/',            scrollTarget: '#tier-banner-grid' },
  { emoji: '👨‍🍳', label: "Code Chefs",  href: '/code-chefs' },
  { emoji: '🦙', label: 'Merchandise', href: '/merchandise' }
];

export default function CategoryNav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleClick(item: NavItem, e: React.MouseEvent<HTMLAnchorElement>) {
    if (item.scrollTarget) {
      // If we're on the homepage already, just scroll. Otherwise navigate then scroll.
      if (pathname === item.href) {
        e.preventDefault();
        const el = document.querySelector(item.scrollTarget);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Navigate to home, then scroll after the page loads
        e.preventDefault();
        router.push(item.href);
        setTimeout(() => {
          const el = document.querySelector(item.scrollTarget!);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  }

  return (
    <nav className="category-nav">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === '/'
          ? pathname === '/'
          : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`cat-chip ${isActive ? 'active' : ''}`}
            onClick={(e) => handleClick(item, e)}
          >
            {item.emoji} {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
