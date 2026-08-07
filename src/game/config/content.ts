import type { ArenaConfig, GameModeConfig, MissionDefinition, SkinDefinition } from '../types';

export const MODES: GameModeConfig[] = [
  { id: 'classic', displayName: 'CLASSIC', durationSeconds: 180, maxSnakes: 20, allowRespawn: true, foodMultiplier: 1, growthMultiplier: 1, shrinkingArena: false },
  { id: 'battle', displayName: 'BATTLE ROYALE', durationSeconds: 240, maxSnakes: 20, allowRespawn: false, foodMultiplier: 0.95, growthMultiplier: 1, shrinkingArena: true },
  { id: 'rush', displayName: 'RUSH', durationSeconds: 90, maxSnakes: 20, allowRespawn: true, foodMultiplier: 1.25, growthMultiplier: 1.35, shrinkingArena: false },
];

export const ARENAS: ArenaConfig[] = [
  { id: 'meadow', name: 'MEADOW', width: 3000, height: 3000, backgroundColor: 0x163d2d, boundaryColor: 0x78d38f, accentColor: 0xb9f6ca, foodDensity: 1, decorationStyle: 'flowers' },
  { id: 'desert', name: 'DESERT', width: 3000, height: 3000, backgroundColor: 0x6b4d2e, boundaryColor: 0xf3c57b, accentColor: 0xffdf9e, foodDensity: 0.98, decorationStyle: 'stones' },
  { id: 'neon', name: 'NEON', width: 3000, height: 3000, backgroundColor: 0x0b1021, boundaryColor: 0x44f7ff, accentColor: 0xff4fd8, foodDensity: 1.04, decorationStyle: 'neon' },
];

export const SKINS: SkinDefinition[] = [
  { id: 'classic', displayName: 'Classic Green', rarity: 'common', unlockCost: 0, defaultUnlocked: true, headColor: 0x63e07b, bodyColors: [0x4acb68, 0x38b95a] },
  { id: 'ocean', displayName: 'Ocean', rarity: 'common', unlockCost: 180, defaultUnlocked: false, headColor: 0x44c9ff, bodyColors: [0x259de0, 0x1676b7] },
  { id: 'sunset', displayName: 'Sunset', rarity: 'rare', unlockCost: 320, defaultUnlocked: false, headColor: 0xffb35c, bodyColors: [0xff7a5c, 0xe34a7a] },
  { id: 'bee', displayName: 'Bee Stripe', rarity: 'rare', unlockCost: 380, defaultUnlocked: false, headColor: 0xffdf55, bodyColors: [0xffd43b, 0x242424], pattern: 'stripe' },
  { id: 'candy', displayName: 'Candy', rarity: 'rare', unlockCost: 420, defaultUnlocked: false, headColor: 0xff86ca, bodyColors: [0xff75bb, 0x8fe9ff] },
  { id: 'lava', displayName: 'Lava', rarity: 'epic', unlockCost: 650, defaultUnlocked: false, headColor: 0xff6b34, bodyColors: [0xe93c23, 0x59211f], glowColor: 0xff5b2b },
  { id: 'ice', displayName: 'Ice', rarity: 'epic', unlockCost: 650, defaultUnlocked: false, headColor: 0xc7f4ff, bodyColors: [0x8de4ff, 0x5aa3ff], glowColor: 0x8de4ff },
  { id: 'neon', displayName: 'Neon Pulse', rarity: 'legendary', unlockCost: 950, defaultUnlocked: false, headColor: 0xf8ff4d, bodyColors: [0x44f7ff, 0xff4fd8, 0x8d5cff], glowColor: 0x44f7ff },
];

export const BOT_NAMES = ['Nova','Byte','Rex','Mako','Pixel','Ghost','Zed','Bolt','Echo','Drift','Kite','Orbit','Juno','Blaze','Mango','Frost','Vex','Comet','Aero','Nox','Luma','Dash','Rift','Milo','Pico','Sora','Tiko','Rune','Axel','Mira'];

export const MISSIONS: MissionDefinition[] = [
  { id: 'food150', title: 'Eat 150 food', type: 'CollectFood', target: 150, reward: 120 },
  { id: 'kills5', title: 'Defeat 5 snakes', type: 'GetKills', target: 5, reward: 160 },
  { id: 'top3', title: 'Reach Top 3', type: 'ReachRank', target: 3, reward: 180 },
  { id: 'mass75', title: 'Reach mass 75', type: 'ReachMass', target: 75, reward: 140 },
  { id: 'matches3', title: 'Play 3 matches', type: 'PlayMatches', target: 3, reward: 100 },
  { id: 'survive120', title: 'Survive 120 seconds', type: 'SurviveSeconds', target: 120, reward: 160 },
  { id: 'win1', title: 'Win 1 match', type: 'WinMatches', target: 1, reward: 250 },
  { id: 'score2500', title: 'Earn 2500 score', type: 'EarnScore', target: 2500, reward: 200 },
];

export const DAILY_REWARDS = [100,150,200,250,300,400,750];
