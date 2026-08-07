export type ModeId = 'classic' | 'battle' | 'rush';
export type ArenaId = 'meadow' | 'desert' | 'neon';

export interface GameModeConfig {
  id: ModeId;
  displayName: string;
  durationSeconds: number;
  maxSnakes: number;
  allowRespawn: boolean;
  foodMultiplier: number;
  growthMultiplier: number;
  shrinkingArena: boolean;
}

export interface ArenaConfig {
  id: ArenaId;
  name: string;
  width: number;
  height: number;
  backgroundColor: number;
  boundaryColor: number;
  accentColor: number;
  foodDensity: number;
  decorationStyle: string;
}

export interface SkinDefinition {
  id: string;
  displayName: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockCost: number;
  defaultUnlocked: boolean;
  headColor: number;
  bodyColors: number[];
  glowColor?: number;
  pattern?: string;
}

export interface SettingsData {
  musicVolume: number;
  sfxVolume: number;
  vibration: boolean;
  controlStyle: 'drag' | 'joystick';
  controlSensitivity: number;
  graphics: 'low' | 'medium' | 'high';
  fpsTarget: '30' | '60' | 'auto';
}

export type MissionType = 'CollectFood' | 'EarnScore' | 'GetKills' | 'ReachRank' | 'ReachMass' | 'PlayMatches' | 'WinMatches' | 'SurviveSeconds';

export interface MissionDefinition {
  id: string;
  title: string;
  type: MissionType;
  target: number;
  reward: number;
}

export interface MissionSaveState {
  id: string;
  progress: number;
  complete: boolean;
  claimed: boolean;
}

export interface DailyRewardState {
  cycleDay: number;
  lastClaimDate: string | null;
}

export interface LifetimeStats {
  matchesPlayed: number;
  wins: number;
  top3: number;
  totalScore: number;
  totalFood: number;
  totalKills: number;
  highestMass: number;
  bestRank: number;
  longestSurvival: number;
}

export interface SaveData {
  version: number;
  coins: number;
  xp: number;
  level: number;
  equippedSkinId: string;
  unlockedSkinIds: string[];
  tutorialComplete: boolean;
  missionState: MissionSaveState[];
  dailyReward: DailyRewardState;
  settings: SettingsData;
  stats: LifetimeStats;
}

export interface MatchResult {
  modeId: ModeId;
  arenaId: ArenaId;
  placement: number;
  score: number;
  kills: number;
  maxMass: number;
  foodCollected: number;
  survivedSeconds: number;
  coinsEarned: number;
  xpEarned: number;
  rewardsGranted: boolean;
  levelUps?: number;
}
