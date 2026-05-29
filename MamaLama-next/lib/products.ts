import type { Product, Tier } from '@/types';

export const TIER_TITLES: Record<Tier, string> = {
  D: 'D Tier — First Steps · Ages 2–3',
  C: 'C Tier — Curious Builder · Ages 3–5',
  B: 'B Tier — Bright Spark · Ages 4–6',
  A: 'A Tier — Adventurer · Ages 6–8',
  S: 'S Tier — Star Solver · Ages 6–8+',
  SS: 'SS Tier — Sky Master · Ages 7–8+'
};

export const TIER_XP: Record<Tier, number> = {
  D: 30, C: 60, B: 120, A: 200, S: 300, SS: 500
};

export const TIER_ORDER: Tier[] = ['D', 'C', 'B', 'A', 'S', 'SS'];

export const TIER_PRODUCTS: Record<Tier, Product[]> = {
  SS: [
    { name: 'Galactic Maze Master', meta: 'Ages 7–8 · 200 pieces', price: '$49.99', emoji: '🌌', desc: 'A 3D galaxy maze with hidden tunnels — the finished puzzle looks like a real star map.', stock: 'Only 3 left' },
    { name: 'Cosmic Logic Cube',    meta: 'Ages 7–8 · 250 pieces', price: '$54.99', emoji: '🪐', desc: 'Wooden 5-layer cube with shifting logic gates. Trains pattern thinking like nothing else.', stock: 'Low stock' },
    { name: 'Atlas of Riddles',     meta: 'Ages 8+ · Book + Set',  price: '$44.99', emoji: '📜', desc: '108-page riddle atlas paired with a tactile clue set. Cracks open a new world per page.', stock: 'In stock' },
    { name: 'Mystery Mountain',     meta: 'Ages 8+ · 300 pieces',  price: '$59.99', emoji: '🗻', desc: 'Layered mountain peak puzzle with secret reveal at the summit. Glows under blacklight.', stock: 'Just restocked' },
    { name: 'Black Hole Puzzle',    meta: 'Ages 8+ · 240 pieces',  price: '$52.99', emoji: '🕳️', desc: "Spiral gradient piece set. Looks impossible until it isn't. Suddenly. Magically.", stock: 'Only 5 left' },
    { name: 'Quantum Cube XL',      meta: 'Ages 8+ · 5x5x5',       price: '$48.99', emoji: '🧊', desc: 'Pro-grade speed cube with smooth corner cuts. Comes with a foldable solving stand.', stock: 'In stock' },
    { name: 'Constellation Map',    meta: 'Ages 8+ · 280 pieces',  price: '$56.99', emoji: '✨', desc: 'Glow-in-the-dark constellation map. Build by day, study the stars by night.', stock: 'Bestseller' }
  ],
  S: [
    { name: 'Dragon Quest 100',     meta: 'Ages 6–8 · 100 pieces', price: '$36.99', emoji: '🐉', desc: 'Slay-the-puzzle dragon scene with foil-stamped scales. Includes mini-storybook.', stock: 'In stock' },
    { name: 'Ancient Maps',         meta: 'Ages 6–8 · 120 pieces', price: '$39.99', emoji: '🗺️', desc: 'Treasure map puzzle with raised edges, mini compass, and a real "X marks the spot" sticker.', stock: 'Low stock' },
    { name: 'Wizard Tower',         meta: 'Ages 6–8 · 150 pieces', price: '$42.99', emoji: '🧙', desc: 'Tower-shaped puzzle with secret door panels. Books, owls, and a tiny wizard included.', stock: 'In stock' },
    { name: 'Galaxy Brain Cube',    meta: 'Ages 7+ · 4x4',         price: '$34.99', emoji: '🌠', desc: 'Speed cube with magnetic core. Smoother turning, no popping pieces. Pro feel.', stock: 'Bestseller' },
    { name: 'Crystal Cave',         meta: 'Ages 6–8 · 140 pieces', price: '$38.99', emoji: '💎', desc: 'Iridescent crystal scene with translucent pieces that catch the light. Mesmerising.', stock: 'In stock' },
    { name: 'Phoenix Rising',       meta: 'Ages 7+ · 160 pieces',  price: '$41.99', emoji: '🔥', desc: 'Phoenix in flame swirl. Pieces are die-cut to follow the feather lines — extra elegant.', stock: 'Just restocked' },
    { name: 'Lost City Hunt',       meta: 'Ages 7+ · 130 pieces',  price: '$37.99', emoji: '🏛️', desc: 'Ruined city scene with hidden-object scavenger card. Find 30 items as you build.', stock: 'In stock' }
  ],
  A: [
    { name: 'Space Explorer',       meta: 'Ages 6–8 · 100 pieces', price: '$32.99', emoji: '🚀', desc: 'Rocket launch scene with a removable astronaut figurine. Glow stars included.', stock: 'In stock' },
    { name: 'Ocean Depths',         meta: 'Ages 6–8 · 80 pieces',  price: '$28.99', emoji: '🌊', desc: 'Whales, jellyfish, deep-sea diver — pieces are slightly textured for sensory fun.', stock: 'In stock' },
    { name: 'Pyramid Path',         meta: 'Ages 6–8 · 90 pieces',  price: '$30.99', emoji: '🏺', desc: 'Egyptian tomb puzzle with hieroglyph stickers. Includes a mini decoder ring.', stock: 'Low stock' },
    { name: 'Robot Workshop',       meta: 'Ages 6–8 · 100 pieces', price: '$34.99', emoji: '🤖', desc: 'Build the puzzle, then build the robot. Bonus: 12-piece snap-together robot included.', stock: 'Bestseller' },
    { name: 'Volcano Adventure',    meta: 'Ages 6–8 · 80 pieces',  price: '$29.99', emoji: '🌋', desc: 'Erupting volcano scene with heat-activated colour-changing pieces. Mind = blown.', stock: 'In stock' },
    { name: "Knight's Castle",      meta: 'Ages 6–8 · 96 pieces',  price: '$31.99', emoji: '🏰', desc: 'Medieval castle with drawbridge that actually moves on the finished puzzle.', stock: 'In stock' },
    { name: 'Mountain Climb',       meta: 'Ages 6–8 · 110 pieces', price: '$34.99', emoji: '🧗', desc: 'Mountain expedition scene with paper climbers you can slot into the finished puzzle.', stock: 'New arrival' }
  ],
  B: [
    { name: 'Rainbow Logic Cubes',  meta: 'Ages 4–6 · 48 pieces',  price: '$24.99', emoji: '🌈', desc: 'Chunky rainbow cubes that snap together magnetically. Pattern cards included.', stock: 'In stock' },
    { name: 'Forest Friends',       meta: 'Ages 4–6 · 50 pieces',  price: '$22.99', emoji: '🦊', desc: 'Foxes, deer and bunnies in a sunny forest. Soft-edged pieces, kid-friendly.', stock: 'Bestseller' },
    { name: 'Sunny Garden',         meta: 'Ages 4–6 · 60 pieces',  price: '$25.99', emoji: '🌻', desc: 'Flowers, bees and a smiley sun. Bright, cheerful, and easy to start with.', stock: 'In stock' },
    { name: 'Under the Sea',        meta: 'Ages 4–6 · 48 pieces',  price: '$23.99', emoji: '🐠', desc: 'Coral reef scene with shiny fish foil. Pieces are wipe-clean — for the messy kid.', stock: 'In stock' },
    { name: 'Farm Fun Days',        meta: 'Ages 4–6 · 50 pieces',  price: '$24.99', emoji: '🐷', desc: 'Pigs, tractors and a friendly farmer. Includes 6 farm-animal flashcards.', stock: 'Just restocked' },
    { name: 'Magical Forest',       meta: 'Ages 4–6 · 60 pieces',  price: '$26.99', emoji: '🦄', desc: 'Unicorns, rainbows and glittery trails. Glitter is sealed in, not loose. Promise.', stock: 'Low stock' },
    { name: 'Dino Discovery',       meta: 'Ages 4–6 · 54 pieces',  price: '$25.99', emoji: '🦕', desc: 'Dinosaurs in their habitats with a fold-out fact poster. Rawr-worthy.', stock: 'In stock' }
  ],
  C: [
    { name: 'Animal Friends Maze',  meta: 'Ages 3–5 · 24 pieces',  price: '$19.99', emoji: '🐻', desc: 'Bears, bunnies, and a curious squirrel. Big chunky pieces, easy first maze.', stock: 'In stock' },
    { name: 'Happy Hippos',         meta: 'Ages 3–5 · 20 pieces',  price: '$17.99', emoji: '🦛', desc: 'Hippos in mud, hippos in baths. Just adorable. Kids love the giggle factor.', stock: 'Bestseller' },
    { name: 'Birthday Cake',        meta: 'Ages 3–5 · 24 pieces',  price: '$18.99', emoji: '🎂', desc: 'Layered birthday cake puzzle. Pieces slot together like cake slices. Sweet.', stock: 'In stock' },
    { name: 'Ice Cream Truck',      meta: 'Ages 3–5 · 30 pieces',  price: '$20.99', emoji: '🍦', desc: 'Truck on a sunny street with kids in line. Smells faintly of vanilla. Yes really.', stock: 'New arrival' },
    { name: 'Tiny Town',            meta: 'Ages 3–5 · 28 pieces',  price: '$19.99', emoji: '🏘️', desc: 'A whole little town to build. Pop-up cardboard houses to play with after.', stock: 'In stock' },
    { name: 'Puppy Park',           meta: 'Ages 3–5 · 24 pieces',  price: '$18.99', emoji: '🐶', desc: 'Six different puppies playing in the park. Match them to name cards.', stock: 'In stock' },
    { name: 'Fruit Basket',         meta: 'Ages 3–5 · 30 pieces',  price: '$21.99', emoji: '🍎', desc: 'Colourful fruits with bonus fruit-name flashcards in English and Spanish.', stock: 'Low stock' }
  ],
  D: [
    { name: 'My First Shapes',      meta: 'Ages 2–3 · 6 pieces',   price: '$14.99', emoji: '🧩', desc: 'Wooden shape sorter. Each piece is satisfyingly heavy. Toddler-approved.', stock: 'Bestseller' },
    { name: 'Big Chunky ABCs',      meta: 'Ages 2–3 · 8 pieces',   price: '$15.99', emoji: '🔤', desc: 'Giant ABC puzzle with rounded edges. Doubles as letter-recognition flashcards.', stock: 'In stock' },
    { name: 'Colorful Animals',     meta: 'Ages 2–3 · 6 pieces',   price: '$14.99', emoji: '🐮', desc: 'Cow, sheep, duck, pig, dog, cat. Big chunky pieces with animal-sound stickers.', stock: 'In stock' },
    { name: 'Number Fun 1-10',      meta: 'Ages 2–3 · 10 pieces',  price: '$15.99', emoji: '🔢', desc: 'Counting puzzle with one to ten objects per number. Maths feels like a game.', stock: 'In stock' },
    { name: 'Hello, Trucks!',       meta: 'Ages 2–3 · 6 pieces',   price: '$13.99', emoji: '🚚', desc: 'Fire truck, dump truck, garbage truck and more. Wheels actually turn.', stock: 'Low stock' },
    { name: 'First Faces',          meta: 'Ages 2–3 · 5 pieces',   price: '$12.99', emoji: '😊', desc: 'Mix-and-match face puzzle. Build silly expressions. Hours of giggling.', stock: 'In stock' },
    { name: 'Tiny Llamas',          meta: 'Ages 2–3 · 6 pieces',   price: '$14.99', emoji: '🦙', desc: 'Six baby llamas in colourful outfits. Brand mascot energy. The cutest.', stock: 'New arrival' }
  ]
};

export function priceToNumber(price: string): number {
  return Number(price.replace(/[^0-9.]/g, '')) || 0;
}
