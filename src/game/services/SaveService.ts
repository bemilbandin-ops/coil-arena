import { MISSIONS, SKINS } from '../config/content';
import type { SaveData } from '../types';

const KEY = 'coil-arena-save-v1';

function defaults(): SaveData {
  return {
    version: 1,
    coins: 250,
    xp: 0,
    level: 1,
    equippedSkinId: 'classic',
    unlockedSkinIds: SKINS.filter(s => s.defaultUnlocked).map(s => s.id),
    tutorialComplete: false,
    missionState: MISSIONS.map(m => ({ id: m.id, progress: 0, complete: false, claimed: false })),
    dailyReward: { cycleDay: 0, lastClaimDate: null },
    settings: { musicVolume: 0.5, sfxVolume: 0.8, vibration: true, controlStyle: 'drag', controlSensitivity: 1, graphics: 'high', fpsTarget: 'auto' },
    stats: { matchesPlayed: 0, wins: 0, top3: 0, totalScore: 0, totalFood: 0, totalKills: 0, highestMass: 10, bestRank: 20, longestSurvival: 0 },
  };
}

const finite = (value: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER): number => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T => allowed.includes(value as T) ? value as T : fallback;

export class LocalStorageSaveService {
  private data: SaveData = defaults();

  load(): SaveData {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return this.reset(true);
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      const base = defaults();
      const ps = parsed.settings ?? {} as Partial<SaveData['settings']>;
      const st = parsed.stats ?? {} as Partial<SaveData['stats']>;
      const dr = parsed.dailyReward ?? {} as Partial<SaveData['dailyReward']>;
      const unlocked = Array.isArray(parsed.unlockedSkinIds)
        ? [...new Set(parsed.unlockedSkinIds.filter(id => typeof id === 'string' && SKINS.some(s => s.id === id)))]
        : base.unlockedSkinIds;
      if (!unlocked.includes('classic')) unlocked.unshift('classic');

      this.data = {
        version: 1,
        coins: Math.floor(finite(parsed.coins, base.coins)),
        xp: Math.floor(finite(parsed.xp, base.xp)),
        level: Math.floor(finite(parsed.level, base.level, 1, 999)),
        equippedSkinId: typeof parsed.equippedSkinId === 'string' && unlocked.includes(parsed.equippedSkinId) ? parsed.equippedSkinId : 'classic',
        unlockedSkinIds: unlocked,
        tutorialComplete: Boolean(parsed.tutorialComplete),
        missionState: MISSIONS.map(m => {
          const old = parsed.missionState?.find(x => x?.id === m.id);
          const progress = finite(old?.progress, 0, 0, m.target);
          return { id: m.id, progress, complete: Boolean(old?.complete) || progress >= m.target, claimed: Boolean(old?.claimed) };
        }),
        dailyReward: {
          cycleDay: Math.floor(finite(dr.cycleDay, base.dailyReward.cycleDay, 0, 6)),
          lastClaimDate: typeof dr.lastClaimDate === 'string' ? dr.lastClaimDate : null,
        },
        settings: {
          musicVolume: finite(ps.musicVolume, base.settings.musicVolume, 0, 1),
          sfxVolume: finite(ps.sfxVolume, base.settings.sfxVolume, 0, 1),
          vibration: typeof ps.vibration === 'boolean' ? ps.vibration : base.settings.vibration,
          controlStyle: oneOf(ps.controlStyle, ['drag','joystick'] as const, base.settings.controlStyle),
          controlSensitivity: finite(ps.controlSensitivity, base.settings.controlSensitivity, 0.5, 2),
          graphics: oneOf(ps.graphics, ['low','medium','high'] as const, base.settings.graphics),
          fpsTarget: oneOf(ps.fpsTarget, ['30','60','auto'] as const, base.settings.fpsTarget),
        },
        stats: {
          matchesPlayed: Math.floor(finite(st.matchesPlayed, 0)), wins: Math.floor(finite(st.wins, 0)), top3: Math.floor(finite(st.top3, 0)),
          totalScore: Math.floor(finite(st.totalScore, 0)), totalFood: Math.floor(finite(st.totalFood, 0)), totalKills: Math.floor(finite(st.totalKills, 0)),
          highestMass: finite(st.highestMass, 10, 1), bestRank: Math.floor(finite(st.bestRank, 20, 1, 20)), longestSurvival: finite(st.longestSurvival, 0),
        },
      };
      this.save();
      return this.data;
    } catch {
      return this.reset(true);
    }
  }

  get(): SaveData { return this.data; }
  save(): void { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch { /* storage failure is non-fatal */ } }
  reset(persist = true): SaveData { this.data = defaults(); if (persist) this.save(); return this.data; }
}

export const saveService = new LocalStorageSaveService();
