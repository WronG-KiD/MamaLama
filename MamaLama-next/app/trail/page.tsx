'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/StoreContext';
import { useUI } from '@/lib/UIContext';
import type { Profile, Solve, Tier } from '@/types';
import { TIER_XP } from '@/lib/products';
import { tierPromotionBurst } from '@/lib/confetti';

const AVATARS = ['🦙','🐻','🦊','🐰','🦄','🐉','🦕','🐧','🦁','🐯','🐼','🐸'];
const AGES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const TIER_LABEL: Record<Tier, string> = {
  D: 'Tiny Thinker',
  C: 'Clever Cadet',
  B: 'Puzzle Pro',
  A: 'Master at Work',
  S: 'Prophet of Puzzles',
  SS: 'Galaxy Brain'
};

const TIER_THRESHOLD: Record<Tier, number> = {
  D: 0, C: 30, B: 90, A: 210, S: 410, SS: 710
};

const TIER_ORDER: Tier[] = ['D', 'C', 'B', 'A', 'S', 'SS'];

const BADGE_CATALOG: Array<{ id: string; emoji: string; name: string; desc: string; condition: (p: Profile) => boolean }> = [
  { id: 'first-solve',  emoji: '🌟', name: 'First Solve',  desc: 'Log your very first puzzle',           condition: p => p.solves.length >= 1 },
  { id: 'five-solves',  emoji: '🧩', name: 'Puzzle Fan',   desc: 'Complete 5 puzzles',                   condition: p => p.solves.length >= 5 },
  { id: 'ten-solves',   emoji: '🎯', name: 'Puzzle Pro',   desc: 'Complete 10 puzzles',                  condition: p => p.solves.length >= 10 },
  { id: 'reach-c',      emoji: '💫', name: 'Clever Cadet', desc: 'Reach C Tier',                         condition: p => xpTier(p.xp) >= 1 },
  { id: 'reach-b',      emoji: '⭐', name: 'Puzzle Pro',    desc: 'Reach B Tier',                         condition: p => xpTier(p.xp) >= 2 },
  { id: 'reach-a',      emoji: '🔥', name: 'Master Builder',desc: 'Reach A Tier',                         condition: p => xpTier(p.xp) >= 3 },
  { id: 'reach-s',      emoji: '🥇', name: 'Legendary',     desc: 'Reach S Tier',                         condition: p => xpTier(p.xp) >= 4 },
  { id: 'reach-ss',     emoji: '🌌', name: 'Galaxy Brain',  desc: 'Reach SS Tier',                        condition: p => xpTier(p.xp) >= 5 }
];

function xpTier(xp: number): number {
  if (xp >= TIER_THRESHOLD.SS) return 5;
  if (xp >= TIER_THRESHOLD.S) return 4;
  if (xp >= TIER_THRESHOLD.A) return 3;
  if (xp >= TIER_THRESHOLD.B) return 2;
  if (xp >= TIER_THRESHOLD.C) return 1;
  return 0;
}

function tierForXp(xp: number): Tier {
  return TIER_ORDER[xpTier(xp)];
}

function nextTierInfo(xp: number): { tier: Tier; need: number } | null {
  const cur = xpTier(xp);
  if (cur === 5) return null;
  const nextTier = TIER_ORDER[cur + 1];
  return { tier: nextTier, need: TIER_THRESHOLD[nextTier] - xp };
}

function tierProgress(xp: number): number {
  const cur = xpTier(xp);
  if (cur === 5) return 100;
  const curMin = TIER_THRESHOLD[TIER_ORDER[cur]];
  const nextMin = TIER_THRESHOLD[TIER_ORDER[cur + 1]];
  return Math.round(((xp - curMin) / (nextMin - curMin)) * 100);
}

function earnedBadges(p: Profile): typeof BADGE_CATALOG {
  return BADGE_CATALOG.filter(b => b.condition(p));
}

export default function TrailPage() {
  const { store, ready, upsertProfile, deleteProfile, setActiveProfile } = useStore();
  const { showToast } = useUI();

  const [showOnboard, setShowOnboard] = useState(false);
  const [showSolve, setShowSolve] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Onboarding form state
  const [onbStep, setOnbStep] = useState<1 | 2 | 3>(1);
  const [onbName, setOnbName] = useState('');
  const [onbAge, setOnbAge] = useState<number | null>(null);
  const [onbAvatar, setOnbAvatar] = useState('🦙');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState<number>(5);
  const [editAvatar, setEditAvatar] = useState('🦙');

  // Solve form state
  const [solveProductName, setSolveProductName] = useState('');
  const [solveTier, setSolveTier] = useState<Tier>('B');
  const [solveDifficulty, setSolveDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [solveTime, setSolveTime] = useState('');
  const [solveResult, setSolveResult] = useState<{ xp: number; promoted?: Tier } | null>(null);

  // Tier promotion fanfare (full-screen celebration)
  const [fanfare, setFanfare] = useState<{ tier: Tier; name: string } | null>(null);

  const activeProfile = useMemo(() =>
    store.profiles.find(p => p.id === store.activeProfileId) || null,
    [store.profiles, store.activeProfileId]
  );

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function close(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-menu-wrap')) setMenuOpen(false);
    }
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  function startOnboarding() {
    setOnbStep(1);
    setOnbName('');
    setOnbAge(null);
    setOnbAvatar('🦙');
    setShowOnboard(true);
  }

  function finishOnboarding() {
    if (!onbName.trim() || onbAge === null) return;
    const profile: Profile = {
      id: 'p_' + Date.now().toString(36),
      name: onbName.trim(),
      age: onbAge,
      avatar: onbAvatar,
      xp: 0,
      tier: 'D',
      badges: [],
      solves: [],
      createdAt: Date.now()
    };
    upsertProfile(profile);
    setActiveProfile(profile.id);
    setShowOnboard(false);
    showToast(`Welcome, ${profile.name}! Your Sky Trail begins now 🦙`);
  }

  function openEditModal() {
    if (!activeProfile) return;
    setEditName(activeProfile.name);
    setEditAge(activeProfile.age);
    setEditAvatar(activeProfile.avatar);
    setMenuOpen(false);
    setShowEdit(true);
  }

  function saveEdit() {
    if (!activeProfile) return;
    upsertProfile({
      ...activeProfile,
      name: editName.trim() || activeProfile.name,
      age: editAge,
      avatar: editAvatar
    });
    setShowEdit(false);
    showToast('Profile updated ✨');
  }

  function handleDelete() {
    if (!activeProfile) return;
    if (!confirm(`Delete ${activeProfile.name}'s Sky Trail? All XP and badges will be lost. This cannot be undone.`)) return;
    deleteProfile(activeProfile.id);
    setMenuOpen(false);
    setShowEdit(false);
    showToast(`${activeProfile.name} deleted`);
  }

  function logSolve() {
    if (!activeProfile || !solveProductName.trim()) return;
    const baseXp = TIER_XP[solveTier];
    const mul = solveDifficulty === 'hard' ? 1.5 : solveDifficulty === 'easy' ? 0.7 : 1;
    const xpEarned = Math.round(baseXp * mul);
    const timeMinutes = solveTime ? parseInt(solveTime, 10) : undefined;
    const newSolve: Solve = {
      id: 's_' + Date.now().toString(36),
      productName: solveProductName.trim(),
      tier: solveTier,
      difficulty: solveDifficulty,
      timeMinutes,
      xpEarned,
      loggedAt: Date.now()
    };
    const newXp = activeProfile.xp + xpEarned;
    const newTier = tierForXp(newXp);
    const promoted = newTier !== activeProfile.tier ? newTier : undefined;

    upsertProfile({
      ...activeProfile,
      xp: newXp,
      tier: newTier,
      solves: [...activeProfile.solves, newSolve]
    });

    setSolveResult({ xp: xpEarned, promoted });
    // Don't close immediately — show the result, let user close

    // 🎉 If the kid was promoted, kick off the fanfare modal + confetti
    if (promoted) {
      // Small delay so the solve modal animation finishes first
      setTimeout(() => {
        setShowSolve(false);   // close solve modal so fanfare is fullscreen
        setSolveResult(null);
        setFanfare({ tier: promoted, name: activeProfile.name });
        tierPromotionBurst();
      }, 800);
    }
  }

  function closeSolveModal() {
    setShowSolve(false);
    setSolveResult(null);
    setSolveProductName('');
    setSolveTime('');
  }

  if (!ready) {
    return (
      <div className="view view-trail active">
        <section className="page-section"><h1>Loading…</h1></section>
      </div>
    );
  }

  const hasProfiles = store.profiles.length > 0;
  const nextInfo = activeProfile ? nextTierInfo(activeProfile.xp) : null;
  const progressPct = activeProfile ? tierProgress(activeProfile.xp) : 0;
  const profileBadges = activeProfile ? earnedBadges(activeProfile) : [];

  return (
    <div className="view view-trail active">
      <section className="page-section">
        <Link href="/" className="back-home-link">← Back to home</Link>
        <div className="page-header">
          <h1>My Sky Trail 🌈</h1>
          <p>Track your little Llama&apos;s puzzle journey from Tiny Thinker to Galaxy Brain.</p>
        </div>

        {!hasProfiles && (
          <div className="trail-empty visible">
            <div className="trail-empty-card">
              <div className="empty-emoji" style={{ fontSize: 80 }}>🦙</div>
              <h2>Start your Sky Trail!</h2>
              <p>Create a profile for your little one. They&apos;ll earn XP for each puzzle solved, unlock badges, and climb from D-Tier (Tiny Thinker) to SS-Tier (Galaxy Brain).</p>
              <button className="btn-primary" onClick={startOnboarding}>Create First Profile →</button>
            </div>
          </div>
        )}

        {hasProfiles && activeProfile && (
          <div className="trail-dashboard visible">

            {/* Profile selector chips */}
            <div className="profile-selector">
              {store.profiles.map(p => (
                <button
                  key={p.id}
                  className={`profile-chip ${p.id === activeProfile.id ? 'active' : ''}`}
                  onClick={() => setActiveProfile(p.id)}
                >
                  <span className="chip-avatar">{p.avatar}</span>
                  {p.name}
                </button>
              ))}
              <button className="add-profile-chip" onClick={startOnboarding}>+ Add child</button>
            </div>

            {/* Hero card */}
            <div className="trail-hero-card" style={{ position: 'relative' }}>
              <div className="trail-hero-avatar">{activeProfile.avatar}</div>
              <div className="trail-hero-info">
                <h2>{activeProfile.name}</h2>
                <div className="trail-hero-tier-row">
                  <div className="trail-hero-tier-badge">{activeProfile.tier}</div>
                  <div className="trail-hero-tier-name">
                    {TIER_LABEL[activeProfile.tier]}
                    <small>Age {activeProfile.age} · {activeProfile.solves.length} puzzles solved</small>
                  </div>
                </div>
                <div className="xp-bar">
                  <div className="xp-bar-fill" style={{ width: `${progressPct}%` }}></div>
                </div>
                <div className="xp-label">
                  <span>{activeProfile.xp} XP</span>
                  <span>{nextInfo ? `${nextInfo.need} XP to ${nextInfo.tier} (${TIER_LABEL[nextInfo.tier]})` : '🏆 Max tier — Galaxy Brain!'}</span>
                </div>
              </div>

              {/* 3-dots menu */}
              <div className="profile-menu-wrap">
                <button
                  className="profile-menu-btn"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
                  aria-label="Profile actions"
                >⋯</button>
                {menuOpen && (
                  <div className="profile-menu-dropdown open">
                    <button className="profile-menu-item" onClick={openEditModal}>
                      <span className="menu-icon">✏️</span> Edit profile
                    </button>
                    <div className="profile-menu-divider"></div>
                    <button className="profile-menu-item danger" onClick={handleDelete}>
                      <span className="menu-icon">🗑️</span> Delete profile
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="trail-stats">
              <div className="trail-stat">
                <span className="stat-emoji">🧩</span>
                <div className="stat-value">{activeProfile.solves.length}</div>
                <div className="stat-label">Solves</div>
              </div>
              <div className="trail-stat">
                <span className="stat-emoji">⭐</span>
                <div className="stat-value">{activeProfile.xp}</div>
                <div className="stat-label">Total XP</div>
              </div>
              <div className="trail-stat">
                <span className="stat-emoji">🏅</span>
                <div className="stat-value">{profileBadges.length}</div>
                <div className="stat-label">Badges</div>
              </div>
              <div className="trail-stat">
                <span className="stat-emoji">🚀</span>
                <div className="stat-value">{activeProfile.tier}</div>
                <div className="stat-label">Tier</div>
              </div>
            </div>

            {/* Badges */}
            <div className="trail-section-block">
              <div className="trail-section-head">
                <h3>🏅 Badge Gallery</h3>
                <span className="badge-progress">{profileBadges.length} / {BADGE_CATALOG.length} unlocked</span>
              </div>
              <div className="badges-grid">
                {BADGE_CATALOG.map(b => {
                  const unlocked = b.condition(activeProfile);
                  return (
                    <div key={b.id} className={`badge-card ${unlocked ? 'unlocked' : 'locked'}`}>
                      <span className="badge-emoji">{b.emoji}</span>
                      <div className="badge-name">{b.name}</div>
                      <div className="badge-desc">{b.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent solves */}
            <div className="trail-section-block">
              <div className="trail-section-head">
                <h3>📚 Recent Solves</h3>
                <button className="log-solve-btn" onClick={() => setShowSolve(true)}>+ Log a Solve</button>
              </div>
              {activeProfile.solves.length === 0 ? (
                <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: '20px 0' }}>
                  No solves logged yet. When {activeProfile.name} finishes a puzzle, log it to earn XP and climb the trail!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...activeProfile.solves].reverse().slice(0, 10).map(s => (
                    <div key={s.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'var(--cloud-white)',
                      borderRadius: 12
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontFamily: 'var(--font-bubblegum), cursive', fontSize: 16,
                        background: tierGradient(s.tier),
                        border: '2px solid white',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
                      }}>{s.tier}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{s.productName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                          {s.difficulty}{s.timeMinutes ? ` · ${s.timeMinutes} min` : ''} · {new Date(s.loggedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ color: 'var(--pop-hot-pink)', fontWeight: 700, fontSize: 14 }}>+{s.xpEarned} XP</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tier ladder */}
            <div className="trail-section-block">
              <div className="trail-section-head"><h3>🌈 Sky Trail Progress</h3></div>
              <div className="trail-ladder-board">
                {TIER_ORDER.map((t, idx) => {
                  const unlocked = xpTier(activeProfile.xp) >= idx;
                  const current = activeProfile.tier === t;
                  const solvesAtTier = activeProfile.solves.filter(s => s.tier === t).length;
                  return (
                    <div key={t} className={`ladder-step ${unlocked ? 'unlocked' : 'locked'} ${current ? 'current' : ''}`}>
                      <div className="ladder-letter" style={{ background: tierGradient(t) }}>{t}</div>
                      <div className="ladder-name">{TIER_LABEL[t]}</div>
                      <div className="ladder-xp">{TIER_THRESHOLD[t]}+ XP</div>
                      <div className="ladder-solves">{solvesAtTier} solves</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </section>

      {/* ===== ONBOARDING MODAL ===== */}
      {showOnboard && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) setShowOnboard(false); }}>
          <div className="onboarding-container">
            <button className="story-close" style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--text-dark)' }} onClick={() => setShowOnboard(false)}>✕</button>

            <div className="onboarding-progress">
              {[1, 2, 3].map(n => (
                <div key={n} className={`onb-dot ${onbStep === n ? 'active' : ''}`}></div>
              ))}
            </div>

            {onbStep === 1 && (
              <div className="onboarding-step active">
                <h2>What&apos;s your name? 🦙</h2>
                <p>This is how you&apos;ll appear on the leaderboard.</p>
                <label className="onb-label">Your name</label>
                <input
                  className="onb-input"
                  placeholder="e.g. Aarav"
                  value={onbName}
                  onChange={(e) => setOnbName(e.target.value)}
                  autoFocus
                />
                <div className="onb-actions">
                  <span></span>
                  <button
                    className="btn-primary onb-next"
                    disabled={!onbName.trim()}
                    onClick={() => setOnbStep(2)}
                  >Next →</button>
                </div>
              </div>
            )}

            {onbStep === 2 && (
              <div className="onboarding-step active">
                <h2>How old are you?</h2>
                <p>So we can recommend the right puzzles for your age.</p>
                <div className="age-picker">
                  {AGES.map(age => (
                    <button
                      key={age}
                      className={onbAge === age ? 'selected' : ''}
                      onClick={() => setOnbAge(age)}
                    >{age}</button>
                  ))}
                </div>
                <div className="onb-actions">
                  <button className="onb-back" onClick={() => setOnbStep(1)}>← Back</button>
                  <button
                    className="btn-primary onb-next"
                    disabled={onbAge === null}
                    onClick={() => setOnbStep(3)}
                  >Next →</button>
                </div>
              </div>
            )}

            {onbStep === 3 && (
              <div className="onboarding-step active">
                <h2>Pick your avatar 🎨</h2>
                <p>Choose one that feels like you.</p>
                <div className="avatar-grid">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      className={onbAvatar === a ? 'selected' : ''}
                      onClick={() => setOnbAvatar(a)}
                    >{a}</button>
                  ))}
                </div>
                <div className="onb-actions">
                  <button className="onb-back" onClick={() => setOnbStep(2)}>← Back</button>
                  <button className="btn-primary onb-next" onClick={finishOnboarding}>
                    Begin Sky Trail ✨
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== LOG SOLVE MODAL ===== */}
      {showSolve && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) closeSolveModal(); }}>
          <div className="solve-container">
            <button className="story-close" style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--text-dark)' }} onClick={closeSolveModal}>✕</button>

            {!solveResult ? (
              <>
                <h2>🧩 Log a Solve</h2>
                <p>Quick — capture the win while it&apos;s fresh!</p>

                <label className="onb-label">Which puzzle?</label>
                <input
                  className="onb-input"
                  placeholder="e.g. Rainbow Logic Cubes"
                  value={solveProductName}
                  onChange={(e) => setSolveProductName(e.target.value)}
                />

                <label className="onb-label">What tier?</label>
                <div className="solve-tier-grid">
                  {TIER_ORDER.map(t => (
                    <button
                      key={t}
                      className={`solve-tier-btn ${t.toLowerCase()} ${solveTier === t ? '' : ''}`}
                      style={{
                        opacity: solveTier === t ? 1 : 0.5,
                        transform: solveTier === t ? 'scale(1.05)' : 'scale(1)'
                      }}
                      onClick={() => setSolveTier(t)}
                    >
                      {t}
                      <small>{TIER_XP[t]} XP</small>
                    </button>
                  ))}
                </div>

                <label className="onb-label">How tough was it?</label>
                <div className="solve-tier-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <button
                      key={d}
                      className="solve-tier-btn"
                      style={{
                        background: 'var(--cloud-white)',
                        color: 'var(--text-dark)',
                        opacity: solveDifficulty === d ? 1 : 0.6,
                        transform: solveDifficulty === d ? 'scale(1.05)' : 'scale(1)',
                        border: solveDifficulty === d ? '3px solid var(--pop-purple)' : '3px solid transparent',
                        fontSize: 14,
                        textTransform: 'capitalize'
                      }}
                      onClick={() => setSolveDifficulty(d)}
                    >{d}</button>
                  ))}
                </div>

                <label className="onb-label">Time (optional, minutes)</label>
                <input
                  className="onb-input"
                  type="number"
                  min="1"
                  placeholder="e.g. 15"
                  value={solveTime}
                  onChange={(e) => setSolveTime(e.target.value)}
                />

                <div className="onb-actions">
                  <button className="onb-back" onClick={closeSolveModal}>Cancel</button>
                  <button
                    className="btn-primary onb-next"
                    disabled={!solveProductName.trim()}
                    onClick={logSolve}
                  >Save Solve ✨</button>
                </div>
              </>
            ) : (
              <>
                <h2>🎉 Solve Logged!</h2>
                <div className="solve-result visible">
                  <span className="gain">+{solveResult.xp} XP</span>
                  {solveResult.promoted ? (
                    <>You&apos;ve been promoted to <strong>{solveResult.promoted} Tier — {TIER_LABEL[solveResult.promoted]}</strong>! 🚀</>
                  ) : (
                    <>Keep going! Every solve brings you closer to {nextInfo?.tier || 'Galaxy Brain'}.</>
                  )}
                </div>
                <div className="onb-actions" style={{ marginTop: 22 }}>
                  <span></span>
                  <button className="btn-primary onb-next" onClick={closeSolveModal}>Done</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== TIER PROMOTION FANFARE ===== */}
      {fanfare && (
        <div
          className="fanfare-overlay"
          onClick={() => { setFanfare(null); tierPromotionBurst(); }}
        >
          <div className="fanfare-card" onClick={(e) => e.stopPropagation()}>
            <div className="fanfare-stars">✨ ⭐ 🌟 ✨</div>
            <div className="fanfare-headline">🎉 TIER UP!</div>
            <div className={`fanfare-tier-badge tier-${fanfare.tier.toLowerCase()}`}>
              {fanfare.tier}
            </div>
            <h2 className="fanfare-title">
              {fanfare.name}, you&apos;re now a<br/>
              <span className="fanfare-tier-name">{TIER_LABEL[fanfare.tier]}!</span>
            </h2>
            <p className="fanfare-sub">
              That solve unlocked a whole new tier on the Sky Trail. Keep going — the Cloud Castle awaits.
            </p>
            <button
              className="btn-primary fanfare-cta"
              onClick={() => { setFanfare(null); tierPromotionBurst(); }}
            >Awesome ✨</button>
          </div>
        </div>
      )}

      {/* ===== EDIT PROFILE MODAL ===== */}
      {showEdit && (
        <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) setShowEdit(false); }}>
          <div className="edit-profile-container">
            <button className="story-close" style={{ background: 'rgba(0,0,0,0.1)', color: 'var(--text-dark)' }} onClick={() => setShowEdit(false)}>✕</button>
            <h2>Edit profile</h2>
            <p>Update {activeProfile?.name}&apos;s details.</p>

            <label className="onb-label">Name</label>
            <input className="onb-input" value={editName} onChange={(e) => setEditName(e.target.value)} />

            <label className="onb-label">Age</label>
            <div className="age-picker">
              {AGES.map(age => (
                <button key={age} className={editAge === age ? 'selected' : ''} onClick={() => setEditAge(age)}>{age}</button>
              ))}
            </div>

            <label className="onb-label">Avatar</label>
            <div className="avatar-grid">
              {AVATARS.map(a => (
                <button key={a} className={editAvatar === a ? 'selected' : ''} onClick={() => setEditAvatar(a)}>{a}</button>
              ))}
            </div>

            <div className="edit-actions">
              <button className="btn-danger" onClick={handleDelete}>Delete profile</button>
              <button className="btn-primary" onClick={saveEdit}>Save changes ✨</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function tierGradient(t: Tier): string {
  switch (t) {
    case 'SS': return 'linear-gradient(135deg, #ff6fa8, #b8a4ff 50%, #76b8ff)';
    case 'S':  return 'linear-gradient(135deg, #ffe27a, #ffb800)';
    case 'A':  return 'linear-gradient(135deg, #ff8888, #ef4444)';
    case 'B':  return 'linear-gradient(135deg, #4ad9a3, #10b981)';
    case 'C':  return 'linear-gradient(135deg, #76b8ff, #3b82f6)';
    case 'D':  return 'linear-gradient(135deg, #ffaad6, #f472b6)';
  }
}
