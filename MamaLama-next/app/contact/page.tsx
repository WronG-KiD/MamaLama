'use client';

import { useState } from 'react';
import Link from 'next/link';

const TOPICS = ['Order help', 'Missing piece', 'Returns', 'Wholesale', 'Press', 'Something else'];

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Please tell us your name';
    if (!isEmail(email)) next.email = 'Please use a valid email';
    if (message.trim().length < 10) next.message = 'A few more words, please';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      // TODO: wire up real email send in Phase 3.4 (Resend)
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="view view-contact active">
        <section className="page-section">
          <Link href="/" className="back-home-link">← Back to home</Link>
          <div className="contact-success">
            <div className="big-check">✓</div>
            <h2>Thanks! We&apos;ve got your message</h2>
            <p>Most replies go out within 24 hours, often much sooner.</p>
            <button className="btn-primary" onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); }}>
              Send another →
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="view view-contact active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to home</Link>
        <h1>Get in touch 💌</h1>
        <p className="subtitle">A mama, a teacher, and a friendly llama are standing by.</p>

        <div className="contact-grid">
          <form className="contact-form-card" onSubmit={submit} noValidate>
            <div className={`form-row ${errors.name ? 'error' : ''}`}>
              <label>Your name</label>
              <input value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <small className="error-msg">{errors.name}</small>}
            </div>
            <div className={`form-row ${errors.email ? 'error' : ''}`}>
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              {errors.email && <small className="error-msg">{errors.email}</small>}
            </div>
            <div className="form-row">
              <label>What&apos;s this about?</label>
              <select value={topic} onChange={e => setTopic(e.target.value)}>
                {TOPICS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className={`form-row ${errors.message ? 'error' : ''}`}>
              <label>Message</label>
              <textarea rows={6} value={message} onChange={e => setMessage(e.target.value)} />
              {errors.message && <small className="error-msg">{errors.message}</small>}
            </div>
            <button type="submit" className="btn-primary">Send message →</button>
          </form>

          <aside className="contact-info-card">
            <h3>Other ways to reach us</h3>
            <div className="contact-line"><strong>Email:</strong> hello@mamalama.shop</div>
            <div className="contact-line"><strong>Phone:</strong> +1 (555) 626-2552</div>
            <div className="contact-line"><strong>Studio:</strong> 142 Cloud Lane,<br />Portland, OR 97201</div>
            <div className="contact-line muted">Most messages get a reply within 24 hours.</div>
            <div className="social-row">
              <a href="#" className="social-pill">Instagram</a>
              <a href="#" className="social-pill">TikTok</a>
              <a href="#" className="social-pill">Pinterest</a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
