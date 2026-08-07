import { DAILY_REWARDS, MISSIONS, SKINS } from '../config/content';
import type { MatchResult, SaveData } from '../types';
import { saveService } from './SaveService';

export function xpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.48, Math.max(0, level - 1)));
}

export function grantXp(data: SaveData, amount: number): number {
  data.xp += Math.max(0, Math.floor(amount));
  let levels = 0;
  while (data.xp >= xpForNextLevel(data.level)) {
    data.xp -= xpForNextLevel(data.level);
    data.level++;
    data.coins += 50 + data.level * 10;
    levels++;
  }
  return levels;
}

export function calculateRewards(placement: number, score: number, kills: number): { coins: number; xp: number } {
  const mult = placement === 1 ? 2 : placement === 2 ? 1.5 : placement === 3 ? 1.25 : 1;
  const coins = Math.floor((25 + kills * 7 + Math.min(90, score / 40)) * mult);
  const xp = Math.floor(20 + kills * 8 + Math.max(0, 21 - placement) * 2 + score / 20);
  return { coins, xp };
}

export function applyMatchProgress(result: MatchResult): void {
  const data = saveService.get();
  data.stats.matchesPlayed++;
  if (result.placement === 1) data.stats.wins++;
  if (result.placement <= 3) data.stats.top3++;
  data.stats.totalScore += result.score;
  data.stats.totalFood += result.foodCollected;
  data.stats.totalKills += result.kills;
  data.stats.highestMass = Math.max(data.stats.highestMass, result.maxMass);
  data.stats.bestRank = Math.min(data.stats.bestRank || 20, result.placement);
  data.stats.longestSurvival = Math.max(data.stats.longestSurvival, result.survivedSeconds);

  for (const m of MISSIONS) {
    const state = data.missionState.find(s => s.id === m.id)!;
    if (state.claimed) continue;
    switch (m.type) {
      case 'CollectFood': state.progress += result.foodCollected; break;
      case 'EarnScore': state.progress += result.score; break;
      case 'GetKills': state.progress += result.kills; break;
      case 'ReachRank': state.progress = result.placement <= m.target ? m.target : state.progress; break;
      case 'ReachMass': state.progress = Math.max(state.progress, result.maxMass); break;
      case 'PlayMatches': state.progress += 1; break;
      case 'WinMatches': state.progress += result.placement === 1 ? 1 : 0; break;
      case 'SurviveSeconds': state.progress = Math.max(state.progress, result.survivedSeconds); break;
    }
    state.progress = Math.min(m.target, state.progress);
    state.complete = state.progress >= m.target;
  }
  saveService.save();
}

export function purchaseSkin(id: string): boolean {
  const skin = SKINS.find(s => s.id === id);
  const data = saveService.get();
  if (!skin || data.unlockedSkinIds.includes(id) || data.coins < skin.unlockCost) return false;
  data.coins -= skin.unlockCost;
  data.unlockedSkinIds.push(id);
  data.equippedSkinId = id;
  saveService.save();
  return true;
}

export function equipSkin(id: string): boolean {
  const data = saveService.get();
  if (!data.unlockedSkinIds.includes(id)) return false;
  data.equippedSkinId = id;
  saveService.save();
  return true;
}

export function claimMission(id: string): boolean {
  const def = MISSIONS.find(m => m.id === id);
  const state = saveService.get().missionState.find(m => m.id === id);
  if (!def || !state?.complete || state.claimed) return false;
  state.claimed = true;
  saveService.get().coins += def.reward;
  saveService.save();
  return true;
}

function todayLocal(): string { return new Date().toLocaleDateString('en-CA'); }
export function dailyAvailable(): boolean { return saveService.get().dailyReward.lastClaimDate !== todayLocal(); }
export function claimDaily(): number {
  const data = saveService.get();
  if (!dailyAvailable()) return 0;
  const day = data.dailyReward.cycleDay % DAILY_REWARDS.length;
  const value = DAILY_REWARDS[day];
  data.coins += value;
  data.dailyReward.cycleDay = (day + 1) % DAILY_REWARDS.length;
  data.dailyReward.lastClaimDate = todayLocal();
  saveService.save();
  return value;
}
