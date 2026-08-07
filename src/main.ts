import * as Phaser from 'phaser';
import './styles/game.css';
import { BootScene } from './game/scenes/BootScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { ComfortGameScene } from './game/scenes/ComfortGameScene';
import { ResultsScene } from './game/scenes/ResultsScene';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0d1726',
  antialias: true,
  render: { antialias: true, pixelArt: false, roundPixels: false },
  scale: {
    // EXPAND resizes the actual canvas to the available display area instead of
    // leaving a fixed 1280x720 backing buffer and stretching it with CSS.
    // The game keeps its 1280x720 logical coordinate system, but menu text and
    // small gameplay geometry are rendered with the real canvas pixel density.
    mode: Phaser.Scale.EXPAND,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: false,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  fps: { target: 60, forceSetTimeOut: false },
  input: { activePointers: 2 },
  scene: [BootScene, PreloadScene, MainMenuScene, ComfortGameScene, ResultsScene],
};

new Phaser.Game(config);
