'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const FAQ_DATA = [
  { q: 'What ages are MamaLama puzzles for?', a: 'Our Sky Trail tiers cover ages 2 through 8+. The D tier is for toddlers (2–3), and the SS tier is for puzzle wizards (8+). Most kids find their sweet spot in the C, B, or A tiers.' },
  { q: 'How fast do you ship?', a: 'Standard shipping ships in 1–2 business days and arrives in 3–5 business days. Express is overnight if ordered before 2pm PT.' },
  { q: 'Do you ship internationally?', a: 'Yes! We ship to Canada ($12.99) and most of the world ($24.99). International orders typically arrive in 7–14 business days.' },
  { q: 'What\'s your return policy?', a: '30-day no-questions-asked returns. If your kid doesn\'t love it, ship it back and we\'ll refund you in full.' },
  { q: 'What if pieces are missing?', a: 'Email us at hello@mamalama.shop with your order number and we\'ll ship replacement pieces within 48 hours. Free of charge, always.' },
  { q: 'What is the Sky Trail?', a: 'A free gamified progression system. Your kid builds a profile, logs puzzles they complete, earns XP and badges, and climbs from D tier (Tiny Thinker) to SS tier (Galaxy Brain).' },
  { q: 'Are the puzzles safe?', a: 'All MamaLama products are CPSIA and ASTM F963 certified, non-toxic, BPA-free, and lab-tested for choking hazards. We test every single batch.' },
  { q: 'Do you offer gift wrap?', a: 'Yes — at checkout you can add hand-wrapped gift packaging with a handwritten note for $4.99.' },
  { q: 'What payment methods do you accept?', a: 'All major credit cards, UPI, netbanking, popular wallets, and EMI for India. International orders accept Visa, Mastercard, and Amex.' },
  { q: 'Can I change or cancel my order?', a: 'Yes, as long as it hasn\'t shipped yet. Email us within 2 hours of placing the order at orders@mamalama.shop.' },
  { q: 'Do you sell wholesale?', a: 'Yes! We work with select toy stores, schools, and Montessori centers. Drop us a line at wholesale@mamalama.shop with your details.' },
  { q: 'How do you handle privacy?', a: 'We never sell your data. We only use your information to fulfill orders and (if you opt in) send occasional updates. Full policy on request.' }
];

export default function FaqPage() {
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return FAQ_DATA.map((item, i) => ({ ...item, _i: i }));
    return FAQ_DATA
      .map((item, i) => ({ ...item, _i: i }))
      .filter(item =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      );
  }, [filter]);

  return (
    <div className="view view-faq active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to home</Link>
        <h1>Help &amp; FAQ ❓</h1>

        <input
          type="text"
          className="faq-search"
          placeholder="Search the FAQ..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />

        {filtered.length === 0 ? (
          <div className="faq-no-match">
            No matching questions — try different words, or
            <Link href="/contact"> ask us directly</Link>.
          </div>
        ) : (
          <div className="faq-list">
            {filtered.map(item => {
              const isOpen = open === item._i;
              return (
                <div key={item._i} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    className="faq-question"
                    onClick={() => setOpen(prev => prev === item._i ? null : item._i)}
                  >
                    {item.q}
                    <span className="faq-chevron">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && <div className="faq-answer">{item.a}</div>}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
