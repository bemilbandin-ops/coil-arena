import * as Phaser from 'phaser';
import './styles/game.css';
import { BootScene } from './game/scenes/BootScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { ComfortGameScene } from './game/scenes/ComfortGameScene';
import { ResultsScene } from './game/scenes/ResultsScene';
import { RENDER_HEIGHT, RENDER_SCALE, RENDER_WIDTH } from './game/config/render';

// Phaser Text renders to its own texture. Because the game camera is scaled 2x
// to preserve the existing 1280x720 layout on a 2560x1440 backing canvas, every
// text texture also needs 2x resolution or it would be enlarged and softened.
const originalTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (
  x: number,
  y: number,
  text: string | string[],
  style?: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.GameObjects.Text {
  return originalTextFactory.call(this, x, y, text, style).setResolution(RENDER_SCALE);
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: RENDER_WIDTH,
  height: RENDER_HEIGHT,
  backgroundColor: '#0d1726',
  antialias: true,
  render: { antialias: true, pixelArt: false, roundPixels: false },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: false,
    width: RENDER_WIDTH,
    height: RENDER_HEIGHT,
  },
  fps: { target: 60, forceSetTimeOut: false },
  input: { activePointers: 2 },
  scene: [BootScene, PreloadScene, MainMenuScene, ComfortGameScene, ResultsScene],
};

new Phaser.Game(config);
