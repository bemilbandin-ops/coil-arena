import * as Phaser from 'phaser';
import './styles/game.css';
import { BootScene } from './game/scenes/BootScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { ComfortGameScene } from './game/scenes/ComfortGameScene';
import { ResultsScene } from './game/scenes/ResultsScene';
import {
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  applyGameplayViewport,
  bindGameplayViewport,
  bindStaticViewport,
} from './game/render/Viewport';

// Phaser Text is rendered to an internal texture. The presentation camera may
// enlarge logical text to native pixels, so keep those textures comfortably
// above the maximum common desktop fit scale instead of enlarging a 1x glyph.
const displayFit = Math.min(window.innerWidth / LOGICAL_WIDTH, window.innerHeight / LOGICAL_HEIGHT);
const TEXT_RESOLUTION = Math.min(3, Math.max(2, window.devicePixelRatio || 1, displayFit));
const originalTextResolution = Phaser.GameObjects.Text.prototype.setResolution;
Phaser.GameObjects.Text.prototype.setResolution = function (value: number): Phaser.GameObjects.Text {
  return originalTextResolution.call(this, Math.max(value, TEXT_RESOLUTION));
};

const originalTextFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (
  x: number,
  y: number,
  text: string | string[],
  style?: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.GameObjects.Text {
  return originalTextFactory.call(this, x, y, text, style).setResolution(TEXT_RESOLUTION);
};

class PresentationPreloadScene extends PreloadScene {
  preload(): void {
    bindStaticViewport(this);
    super.preload();
  }
}

class PresentationMainMenuScene extends MainMenuScene {
  create(): void {
    bindStaticViewport(this);
    super.create();
  }
}

class PresentationResultsScene extends ResultsScene {
  create(): void {
    bindStaticViewport(this);
    super.create();
  }
}

class PresentationGameScene extends ComfortGameScene {
  create(): void {
    super.create();

    const runtime = this as unknown as {
      player: { alive: boolean };
      updateCamera(): void;
    };

    // Keep one stable logical 1280x720 world view. Dynamic fractional zoom was
    // resampling the smallest gameplay objects and screen-space HUD every frame.
    runtime.updateCamera = () => {
      if (!runtime.player.alive) return;
      applyGameplayViewport(this);
    };

    bindGameplayViewport(this);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: LOGICAL_WIDTH,
  height: LOGICAL_HEIGHT,
  backgroundColor: '#0d1726',
  antialias: true,
  render: { antialias: true, pixelArt: false, roundPixels: false },
  scale: {
    // RESIZE makes the backing canvas match the available browser pixels. Scene
    // cameras map existing 1280x720 coordinates into a centered 16:9 viewport;
    // there is no final CSS stretch of a 1280x720 backing buffer.
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER,
    autoRound: true,
  },
  fps: { target: 60, forceSetTimeOut: false },
  input: { activePointers: 2 },
  scene: [
    BootScene,
    PresentationPreloadScene,
    PresentationMainMenuScene,
    PresentationGameScene,
    PresentationResultsScene,
  ],
};

new Phaser.Game(config);
