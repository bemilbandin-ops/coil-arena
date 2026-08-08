import * as Phaser from 'phaser';
import './styles/game.css';
import { BootScene } from './game/scenes/BootScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { ComfortGameScene } from './game/scenes/ComfortGameScene';
import { ResultsScene } from './game/scenes/ResultsScene';
import { RENDER_HEIGHT, RENDER_SCALE, RENDER_WIDTH } from './game/config/render';

// Phaser Text renders into its own texture. Keep every text texture at least as
// detailed as the 2x backing canvas, including menu text that later requests a
// lower resolution based on devicePixelRatio.
const originalTextResolution = Phaser.GameObjects.Text.prototype.setResolution;
Phaser.GameObjects.Text.prototype.setResolution = function (value: number): Phaser.GameObjects.Text {
  return originalTextResolution.call(this, Math.max(value, RENDER_SCALE));
};

const originalTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (
  x: number,
  y: number,
  text: string | string[],
  style?: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.GameObjects.Text {
  return originalTextFactory.call(this, x, y, text, style).setResolution(RENDER_SCALE);
};

// Static 1280x720 scenes are rendered through a 2x camera so their existing
// coordinates fill the 2560x1440 backing canvas without any layout rewrite.
class HiDpiPreloadScene extends PreloadScene {
  preload(): void {
    this.cameras.main.setZoom(RENDER_SCALE);
    super.preload();
  }
}

class HiDpiMainMenuScene extends MainMenuScene {
  create(): void {
    this.cameras.main.setZoom(RENDER_SCALE);
    super.create();
  }
}

class HiDpiResultsScene extends ResultsScene {
  create(): void {
    this.cameras.main.setZoom(RENDER_SCALE);
    super.create();
  }
}

// Gameplay already has a dynamic camera zoom. Keep that behavior, but express
// it in backing-canvas pixels so the visible world remains exactly the same size.
class HiDpiGameScene extends ComfortGameScene {
  create(): void {
    super.create();

    const runtime = this as unknown as {
      player: { alive: boolean; mass: number };
      updateCamera(): void;
    };

    runtime.updateCamera = () => {
      if (!runtime.player.alive) return;
      const logicalZoom = Phaser.Math.Clamp(1.01 - Math.sqrt(runtime.player.mass) * 0.005, 0.86, 0.99);
      const target = logicalZoom * RENDER_SCALE;
      this.cameras.main.setZoom(Phaser.Math.Linear(this.cameras.main.zoom, target, 0.012));
      this.cameras.main.setFollowOffset(0, 0);
    };

    this.cameras.main.setZoom(0.98 * RENDER_SCALE);
  }
}

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
  scene: [BootScene, HiDpiPreloadScene, HiDpiMainMenuScene, HiDpiGameScene, HiDpiResultsScene],
};

new Phaser.Game(config);
