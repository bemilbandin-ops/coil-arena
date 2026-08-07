import * as Phaser from 'phaser';
import './styles/game.css';
import { BootScene } from './game/scenes/BootScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { ComfortGameScene } from './game/scenes/ComfortGameScene';
import { ResultsScene } from './game/scenes/ResultsScene';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const displayScale = Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
const renderResolution = Math.min(2, Math.max(1, displayScale * (window.devicePixelRatio || 1)));

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  resolution: renderResolution,
  backgroundColor: '#0d1726',
  antialias: true,
  render: { antialias: true, pixelArt: false, roundPixels: false },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  fps: { target: 60, forceSetTimeOut: false },
  input: { activePointers: 2 },
  scene: [BootScene, PreloadScene, MainMenuScene, ComfortGameScene, ResultsScene],
};

new Phaser.Game(config);
