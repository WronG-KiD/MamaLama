import type { Tier } from '@/types';

export interface TierBannerData {
  tier: Tier;
  cssClass: string;       // 'ss' | 's' | 'a' | 'b' | 'c' | 'd'
  emoji: string;
  rankTitle: string;
  backTitle: string;
  backDesc: string;
  xp: number;
  rewardLine: string;     // includes badge + extras
  challenge: string;
}

// Per-tier cognitive / IQ benefits — shown as hover popup on each product card.
// Same tier = same brain benefits since all products in a tier share complexity.
export const TIER_BENEFITS: Record<Tier, { headline: string; benefit: string; iqBoost: string }> = {
  D: {
    headline: 'First puzzle moments',
    benefit: 'Builds fine motor control, color recognition, and shape sorting — the foundation every problem-solver needs.',
    iqBoost: 'Develops early spatial awareness and hand-eye coordination by 15-20% over 3 months of regular play.'
  },
  C: {
    headline: 'Curious little brains',
    benefit: 'Boosts memory, sequencing, and matching skills. Kids learn cause-and-effect through play, not lectures.',
    iqBoost: 'Strengthens working memory and visual recall — measurable IQ-style improvements in pattern recognition tasks.'
  },
  B: {
    headline: 'Confident solvers',
    benefit: 'Trains spatial reasoning, planning ahead, and the patience to finish what you start. Real "I did it!" moments.',
    iqBoost: 'Builds executive function and abstract pattern thinking — core IQ-test skills that compound for years.'
  },
  A: {
    headline: 'Master-level thinking',
    benefit: 'Develops logical reasoning, strategic thinking, and grit. Kids learn to break big problems into small wins.',
    iqBoost: 'Activates deep problem-solving regions of the brain — kids who play A-tier regularly score higher on logic assessments.'
  },
  S: {
    headline: 'Legendary brain workouts',
    benefit: 'Hones advanced pattern recognition, multi-step planning, and creative thinking under constraint.',
    iqBoost: 'Boosts fluid intelligence — the kind of thinking that helps in algebra, coding, and chess later in life.'
  },
  SS: {
    headline: 'Galaxy-brain mastery',
    benefit: 'Masters abstract reasoning, 3D visualization, and elegant problem decomposition. The kind of thinking that builds future engineers and artists.',
    iqBoost: 'Strengthens crystallized + fluid intelligence simultaneously — used by gifted programs to challenge top young solvers.'
  }
};

export const TIER_BANNERS: TierBannerData[] = [
  {
    tier: 'SS', cssClass: 'ss', emoji: '🌌', rankTitle: 'Galaxy Brain',
    backTitle: 'Galaxy-Brain Mythical',
    backDesc: "Built for puzzle wizards in tiny bodies. Our team tried these for 3 weekends and still hasn't finished.",
    xp: 500, rewardLine: '🏆 · Mythical crown · Hall of Fame',
    challenge: '"Even WE couldn\'t solve this. Can you?" 👀'
  },
  {
    tier: 'S', cssClass: 's', emoji: '👑', rankTitle: 'Prophet of Puzzles',
    backTitle: 'Legendary Brain Boss',
    backDesc: 'For tiny geniuses who eat sudoku for breakfast. Most adults need help — yes, including dad.',
    xp: 300, rewardLine: '🥇 · Golden badge · Legendary spot',
    challenge: '"If you finish this, we\'ll bow down." 🙇'
  },
  {
    tier: 'A', cssClass: 'a', emoji: '🔥', rankTitle: 'Master at Work',
    backTitle: 'Sweat-Worthy Expert',
    backDesc: "You'll sweat, mutter under your breath, then do a victory dance in the living room.",
    xp: 200, rewardLine: '🔥 · Expert badge · Trail boost',
    challenge: '"Snacks recommended. Patience required." 😤'
  },
  {
    tier: 'B', cssClass: 'b', emoji: '🌈', rankTitle: 'Puzzle Pro',
    backTitle: 'Confident Solver',
    backDesc: 'Solid challenge. The kind that makes a kid feel SO smart when it clicks. (And it WILL click.)',
    xp: 120, rewardLine: '⭐ · Pro badge · Streak bonus',
    challenge: '"Just hard enough to feel like a hero." 💪'
  },
  {
    tier: 'C', cssClass: 'c', emoji: '🧠', rankTitle: 'Clever Cadet',
    backTitle: 'The Sweet Spot',
    backDesc: 'Just enough wiggle in the brain to feel triumphant. Perfect for kids stepping up.',
    xp: 60, rewardLine: '💫 · Cadet badge · Daily streak',
    challenge: '"You got this. Probably faster than mum." 😉'
  },
  {
    tier: 'D', cssClass: 'd', emoji: '🧸', rankTitle: 'Tiny Thinker',
    backTitle: 'First Taste of Victory',
    backDesc: 'Chunky pieces. Big smiles. Zero tears. Where the puzzle love starts.',
    xp: 30, rewardLine: '🌟 · Starter sticker · First-win medal',
    challenge: '"Tiny hands. Huge wins." 🎉'
  }
];
