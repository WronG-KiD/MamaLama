// Hardcoded "legends" — fictional top-XP kids used to seed the leaderboard
// until enough real profiles exist. As real users create kid profiles and
// log solves, they'll appear interleaved with these in the leaderboard.

import type { Tier } from '@/types';

export interface Legend {
  name: string;
  title: string;
  tier: Tier;
  puzzle: string;        // their best/most recent puzzle
  emoji: string;
  xp: number;            // total XP — what we actually rank by
  isFictional: true;     // marker to distinguish from real user profiles
}

export const LEGENDS: Legend[] = [
  { name: 'Aarav', title: 'Prophet of Puzzles',  tier: 'SS', puzzle: 'Galactic Maze Master',  emoji: '👦🏽', xp: 920, isFictional: true },
  { name: 'Maya',  title: 'Galaxy Brain',        tier: 'SS', puzzle: 'Cosmic Logic Cube',     emoji: '👧🏼', xp: 875, isFictional: true },
  { name: 'Liam',  title: 'Sage of Solutions',   tier: 'SS', puzzle: 'Atlas of Riddles',      emoji: '🧒🏻', xp: 810, isFictional: true },
  { name: 'Zara',  title: 'Llama Legend',        tier: 'S',  puzzle: 'Mystery Mountain',      emoji: '👧🏽', xp: 685, isFictional: true },
  { name: 'Noah',  title: 'Brain Boss',          tier: 'S',  puzzle: 'Space Explorer Puzzle', emoji: '👦🏻', xp: 560, isFictional: true },
  { name: 'Aisha', title: 'Puzzle Prodigy',      tier: 'A',  puzzle: 'Dragon Quest 100',      emoji: '👧🏿', xp: 480, isFictional: true },
  { name: 'Diego', title: 'Mind Maestro',        tier: 'A',  puzzle: 'Ocean Depths',          emoji: '🧒🏽', xp: 410, isFictional: true },
  { name: 'Ella',  title: 'Logic Legend',        tier: 'A',  puzzle: 'Forest Friends 80',     emoji: '👧🏻', xp: 365, isFictional: true },
  { name: 'Kai',   title: 'Master at Work',      tier: 'A',  puzzle: 'Pyramid Path',          emoji: '👦🏿', xp: 320, isFictional: true },
  { name: 'Priya', title: 'Brain Buddy Supreme', tier: 'B',  puzzle: 'Rainbow Logic Cubes',   emoji: '👧🏽', xp: 245, isFictional: true }
];
