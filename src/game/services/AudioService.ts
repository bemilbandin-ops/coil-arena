import * as Phaser from 'phaser';
import { saveService } from './SaveService';

const SFX = {
  ui: 'sfx-ui',
  pickup: 'sfx-pickup',
  large: 'sfx-large',
  growth: 'sfx-growth',
  kill: 'sfx-kill',
  death: 'sfx-death',
  start: 'sfx-start',
  end: 'sfx-end',
  reward: 'sfx-reward',
  levelUp: 'sfx-levelup',
} as const;

export class AudioService {
  private manager?: Phaser.Sound.BaseSoundManager;
  private unlocked = false;

  bind(scene: Phaser.Scene): void {
    this.manager = scene.sound;
    if (this.unlocked) this.startMusic();
    scene.input.once('pointerup', () => this.unlock());
    scene.input.keyboard?.once('keydown', () => this.unlock());
  }

  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    // Phaser handles the actual AudioContext unlock on the same user gesture.
    // Deferring lets its own unlock handler complete before music is requested.
    window.setTimeout(() => this.startMusic(), 0);
  }

  syncSettings(): void {
    if (!this.manager || !this.unlocked) return;
    try { this.manager.stopByKey('music-loop'); } catch { /* no-audio fallback */ }
    this.startMusic();
  }

  pause(): void { try { this.manager?.pauseAll(); } catch { /* no-audio fallback */ } }
  resume(): void { try { this.manager?.resumeAll(); } catch { /* no-audio fallback */ } }

  private startMusic(): void {
    if (!this.manager || !this.unlocked) return;
    const volume = saveService.get().settings.musicVolume * 0.32;
    if (volume <= 0) return;
    try {
      if (!this.manager.isPlaying('music-loop')) this.manager.play('music-loop', { loop: true, volume });
    } catch { /* missing/unsupported audio is non-fatal */ }
  }

  private play(key: string, scale = 1): void {
    if (!this.manager || !this.unlocked) return;
    const volume = saveService.get().settings.sfxVolume * scale;
    if (volume <= 0) return;
    try { this.manager.play(key, { volume }); } catch { /* graceful no-audio fallback */ }
  }

  ui(): void { this.play(SFX.ui, 0.55); }
  pickup(large = false): void { this.play(large ? SFX.large : SFX.pickup, large ? 0.8 : 0.5); }
  growth(): void { this.play(SFX.growth, 0.55); }
  kill(): void { this.play(SFX.kill, 0.85); }
  death(): void { this.play(SFX.death, 0.9); }
  matchStart(): void { this.play(SFX.start, 0.72); }
  matchEnd(): void { this.play(SFX.end, 0.72); }
  reward(): void { this.play(SFX.reward, 0.65); }
  levelUp(): void { this.play(SFX.levelUp, 0.75); }
}
export const audioService = new AudioService();
