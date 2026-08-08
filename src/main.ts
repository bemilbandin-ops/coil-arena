import * as Phaser from 'phaser';
import './styles/game.css';
import { BootScene } from './game/scenes/BootScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { ComfortGameScene } from './game/scenes/ComfortGameScene';
import { ResultsScene } from './game/scenes/ResultsScene';

// Keep the original 1280x720 + FIT layout exactly as-is. Only increase the
// internal texture resolution used by Phaser Text so menu/UI glyphs retain more
// detail before the final canvas is fitted to the browser.
const MIN_TEXT_RESOLUTION = 2;
const originalSetResolution = Phaser.GameObjects.Text.prototype.setResolution;
Phaser.GameObjects.Text.prototype.setResolution = function (value: number): Phaser.GameObjects.Text {
  return originalSetResolution.call(this, Math.max(MIN_TEXT_RESOLUTION, value));
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#0d1726',
  antialias: true,
  render: { antialias: true, pixelArt: false, roundPixels: false },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true,
    width: 1280,
    height: 720,
  },
  fps: { target: 60, forceSetTimeOut: false },
  input: { activePointers: 2 },
  scene: [BootScene, PreloadScene, MainMenuScene, ComfortGameScene, ResultsScene],
};

new Phaser.Game(config);
