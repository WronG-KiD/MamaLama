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
