import { describe, expect, it } from 'vitest';
import { calculateRewards, xpForNextLevel, applyMatchProgress, claimMission } from '../services/ProgressionService';
import { LocalStorageSaveService, saveService } from '../services/SaveService';
import { SpatialGrid, type SpatialItem } from '../systems/SpatialGrid';
import { canConsume, rankByScore } from '../systems/GameRules';
import { ARENAS, BOT_NAMES, DAILY_REWARDS, MISSIONS, MODES, SKINS } from '../config/content';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length(): number { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  key(index: number): string | null { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string): void { this.data.delete(key); }
  setItem(key: string, value: string): void { this.data.set(key, String(value)); }
}

function installStorage(): MemoryStorage {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  return storage;
}

describe('progression logic',()=>{
  it('rewards first place more than lower placement',()=>{
    expect(calculateRewards(1,1000,3).coins).toBeGreaterThan(calculateRewards(5,1000,3).coins);
  });
  it('xp curve increases by level',()=>{
    expect(xpForNextLevel(3)).toBeGreaterThan(xpForNextLevel(2));
  });
  it('tracks and claims missions without duplicate reward',()=>{
    installStorage(); saveService.reset();
    const result={modeId:'classic' as const,arenaId:'meadow' as const,placement:1,score:3000,kills:6,maxMass:80,foodCollected:160,survivedSeconds:130,coinsEarned:0,xpEarned:0,rewardsGranted:true};
    applyMatchProgress(result); applyMatchProgress(result); applyMatchProgress(result);
    expect(saveService.get().missionState.every(m=>m.complete)).toBe(true);
    const before=saveService.get().coins;
    expect(claimMission('kills5')).toBe(true);
    expect(saveService.get().coins).toBeGreaterThan(before);
    expect(claimMission('kills5')).toBe(false);
  });
});

describe('combat and leaderboard rules',()=>{
  it('applies the 1.05 consume threshold deterministically',()=>{
    expect(canConsume(105,100)).toBe(true);
    expect(canConsume(104.99,100)).toBe(false);
  });
  it('sorts score first and uses mass as deterministic tie-breaker',()=>{
    const ranked=rankByScore([{id:'a',score:10,mass:5},{id:'b',score:20,mass:4},{id:'c',score:20,mass:7}]);
    expect(ranked.map(x=>x.id)).toEqual(['c','b','a']);
  });
});

describe('save validation',()=>{
  it('recovers from malformed JSON and persists defaults',()=>{
    const storage=installStorage(); storage.setItem('coil-arena-save-v1','{broken');
    const service=new LocalStorageSaveService(); const data=service.load();
    expect(data.level).toBe(1); expect(data.equippedSkinId).toBe('classic');
    expect(storage.getItem('coil-arena-save-v1')).toContain('"version":1');
  });
  it('clamps invalid persisted values',()=>{
    const storage=installStorage(); storage.setItem('coil-arena-save-v1',JSON.stringify({coins:-9,level:0,settings:{musicVolume:8,sfxVolume:-3,controlStyle:'bad'}}));
    const data=new LocalStorageSaveService().load();
    expect(data.coins).toBe(0); expect(data.level).toBe(1); expect(data.settings.musicVolume).toBe(1); expect(data.settings.sfxVolume).toBe(0); expect(data.settings.controlStyle).toBe('drag');
  });
});

describe('spatial grid',()=>{
  it('updates an entity between cells',()=>{
    const grid=new SpatialGrid<SpatialItem>(100);
    const e:SpatialItem={id:'x',x:10,y:10,active:true};
    grid.insert(e); expect(grid.queryRadius(10,10,20)).toContain(e);
    e.x=500;e.y=500;grid.update(e);
    expect(grid.queryRadius(10,10,20)).not.toContain(e);
    expect(grid.queryRadius(500,500,20)).toContain(e);
  });
});

describe('content acceptance counts',()=>{
  it('ships required modes, arenas, skins, bot names, missions and daily entries',()=>{
    expect(MODES).toHaveLength(3); expect(ARENAS).toHaveLength(3); expect(SKINS.length).toBeGreaterThanOrEqual(8);
    expect(BOT_NAMES.length).toBeGreaterThanOrEqual(20); expect(MISSIONS.length).toBeGreaterThanOrEqual(8); expect(DAILY_REWARDS).toHaveLength(7);
  });
});
